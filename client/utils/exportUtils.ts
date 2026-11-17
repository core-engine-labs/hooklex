import { format } from "date-fns";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { BodyExportContext, SpecificRequest } from "@/types/request";

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const isBinaryContent = (contentType?: string, body?: string): boolean => {
  if (!body) return false;
  return (
    body.startsWith("data:") ||
    Boolean(contentType && (contentType.includes("octet-stream") || contentType.includes("image/")))
  );
};

const formatBodyForExport = (body?: string | null, contentType?: string): string => {
  if (body === undefined || body === null || body.trim() === "") {
    return "(no body provided)";
  }

  if (isBinaryContent(contentType, body)) {
    return body.length > 80 ? `${body.substring(0, 80)}... [Binary Data Truncated]` : body;
  }

  if (contentType?.includes("json")) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }

  return body;
};

const escapeCSV = (val: string | number | boolean | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export const exportPDF = async (request: SpecificRequest, bodyContext?: BodyExportContext) => {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "a4",
    });

    const formattedBody = formatBodyForExport(request.body, request.contentType) || bodyContext?.formattedBody;
    const category = bodyContext?.category || "text";
    const formParams = bodyContext?.formParams || [];
    const multipartParts = bodyContext?.multipartParts || [];

    const now = new Date().toISOString();
    const margin = 0.5;
    const pageWidth = 8.27;
    const pageHeight = 11.0;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const primaryColor: [number, number, number] = [15, 23, 42];
    const accentColor: [number, number, number] = [2, 132, 199];
    const textColor: [number, number, number] = [51, 65, 85];
    const lightBg: [number, number, number] = [241, 245, 249];
    const borderColor: [number, number, number] = [203, 213, 225];

    const checkOverflow = (neededHeight = 0.3) => {
      if (y + neededHeight > pageHeight - margin - 0.4) {
        doc.addPage();
        y = margin;
      }
    };

    // Title Strip
    doc.setFillColor(...accentColor);
    doc.rect(margin, y, 0.05, 0.3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text("Request Report", margin + 0.12, y + 0.22);
    y += 0.4;

    // Metadata Table
    const metadata = [
      ["Method", request.method || "N/A"],
      ["Path", request.path || "/"],
      ["IP", request.ip || "N/A"],
      ["Content-Type", request.contentType || "N/A"],
      ["Body Size", request.bodySize ? formatBytes(request.bodySize) : "0 B"],
      ["Created At", request.createdAt ? format(new Date(request.createdAt), "PPP p") : "N/A"],
      ["Is Replay", request.isReplay ? "Yes" : "No"],
    ];

    if (request.replayedFrom) {
      metadata.push(["Replayed From", request.replayedFrom]);
    }

    autoTable(doc, {
      startY: y,
      body: metadata,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { fontSize: 8.5, cellPadding: 0.04, textColor },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 1.3, textColor: primaryColor },
        1: { cellWidth: contentWidth - 1.3 },
      },
      didDrawPage: (data) => {
        y = data.cursor ? data.cursor.y + 0.25 : y;
      },
    });

    const renderCodeBlock = (title: string, content: string) => {
      checkOverflow(0.6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...primaryColor);
      doc.text(title, margin, y);
      y += 0.12;

      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      const padding = 0.1;
      const lines: string[] = doc.splitTextToSize(content, contentWidth - padding * 2);
      const lineHeight = 0.13;
      const boxHeight = lines.length * lineHeight + padding * 2;

      if (y + boxHeight < pageHeight - margin - 0.4) {
        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.005);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 0.03, 0.03, "FD");

        doc.setTextColor(...primaryColor);
        let textY = y + padding + 0.07;
        lines.forEach((line) => {
          doc.text(line, margin + padding, textY);
          textY += lineHeight;
        });
        y += boxHeight + 0.2;
      } else {
        lines.forEach((line) => {
          checkOverflow(0.15);
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 0.15;
      }
    };

    renderCodeBlock("Headers", request.headers ? JSON.stringify(request.headers, null, 2) : "{}");
    renderCodeBlock("Query Parameters", request.query ? JSON.stringify(request.query, null, 2) : "{}");

    checkOverflow(0.6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...primaryColor);
    doc.text("Body Payload", margin, y);
    y += 0.15;

    if (category === "form" && formParams.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Key", "Value"]],
        body: formParams,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 8, font: "courier", cellPadding: 0.05 },
        columnStyles: {
          0: { cellWidth: 2.0, fontStyle: "bold" },
          1: { cellWidth: contentWidth - 2.0 },
        },
        didDrawPage: (data) => {
          y = data.cursor ? data.cursor.y + 0.25 : y;
        },
      });
    } else if (category === "multipart" && multipartParts.length > 0) {
      const multipartRows = multipartParts.map((part) => [
        part.name,
        part.isFile ? `File: ${part.filename}` : part.contentType || "text/plain",
        part.isFile ? `[Binary Attachment: ${part.value.length} B]` : part.value,
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Field Name", "Type / Info", "Value / Attachment"]],
        body: multipartRows,
        margin: { left: margin, right: margin },
        theme: "striped",
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 8, font: "courier", cellPadding: 0.05 },
        columnStyles: {
          0: { cellWidth: 1.8, fontStyle: "bold" },
          1: { cellWidth: 1.8 },
          2: { cellWidth: contentWidth - 3.6 },
        },
        didDrawPage: (data) => {
          y = data.cursor ? data.cursor.y + 0.25 : y;
        },
      });
    } else {
      y -= 0.15;
      renderCodeBlock("Body Payload", formattedBody as string);
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.005);
      doc.line(margin, pageHeight - 0.45, pageWidth - margin, pageHeight - 0.45);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);

      doc.text(`Generated by Hooklex · ${now}`, margin, pageHeight - 0.3);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 0.3, { align: "right" });
    }

    doc.save(`request-${request.id}.pdf`);
    toast.success("PDF exported successfully");
  } catch (error) {
    console.error("PDF Export Error:", error);
    toast.error("PDF export failed");
  }
};

export const exportCSV = (request: SpecificRequest, bodyContext?: BodyExportContext) => {
  let bodyOutput = formatBodyForExport(request.body, request.contentType) || bodyContext?.formattedBody;

  if (bodyContext?.category === "form" && bodyContext.formParams?.length) {
    bodyOutput = bodyContext.formParams.map(([k, v]) => `${k}=${v}`).join(" & ");
  } else if (bodyContext?.category === "multipart" && bodyContext.multipartParts?.length) {
    bodyOutput = bodyContext.multipartParts
      .map((p) => `${p.name}: ${p.isFile ? `[File: ${p.filename}]` : p.value}`)
      .join(" | ");
  }

  const rows = [
    ["Field", "Value"],
    ["Method", request.method],
    ["Path", request.path || "/"],
    ["IP", request.ip || "N/A"],
    ["Content-Type", request.contentType || "N/A"],
    ["Body Size", request.bodySize ? formatBytes(request.bodySize) : "0 B"],
    ["Created At", request.createdAt ? format(new Date(request.createdAt), "PPP p") : "N/A"],
    ["Is Replay", request.isReplay ? "Yes" : "No"],
    ["Replayed From", request.replayedFrom || "N/A"],
    ["Headers", request.headers ? JSON.stringify(request.headers) : "{}"],
    ["Query Parameters", request.query ? JSON.stringify(request.query) : "{}"],
    ["Body Payload", bodyOutput],
    ["Generated At", new Date().toISOString()],
  ];

  const csvContent = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `request-${request.id}.csv`);
  toast.success("CSV exported successfully");
};

export const exportMD = (request: SpecificRequest, bodyContext?: BodyExportContext) => {
  const category = bodyContext?.category || "text";
  const formattedBody = formatBodyForExport(request.body, request.contentType) || bodyContext?.formattedBody;

  const codeBlockLang = category === "json" || category === "ndjson"
    ? "json"
    : category === "xml" || category === "html"
      ? category
      : category === "markdown"
        ? "markdown"
        : category === "javascript"
          ? "javascript"
          : category === "css"
            ? "css"
            : "text";

  let bodyMarkdownSection = "";

  if (category === "form" && bodyContext?.formParams?.length) {
    bodyMarkdownSection = [
      `## Body Payload (Form Data)`,
      ``,
      `| Key | Value |`,
      `| :--- | :--- |`,
      ...bodyContext.formParams.map(([k, v]) => `| \`${k}\` | \`${v}\` |`),
    ].join("\n");
  } else if (category === "multipart" && bodyContext?.multipartParts?.length) {
    bodyMarkdownSection = [
      `## Body Payload (Multipart Form Data)`,
      ``,
      `| Field Name | Type / Info | Value / Attachment |`,
      `| :--- | :--- | :--- |`,
      ...bodyContext.multipartParts.map((p) =>
        `| \`${p.name}\` | \`${p.isFile ? `File: ${p.filename}` : p.contentType || "text/plain"}\` | ${p.isFile ? `*[Binary Attachment: ${p.value.length} B]*` : `\`${p.value}\``} |`
      ),
    ].join("\n");
  } else {
    bodyMarkdownSection = [
      `## Body Payload`,
      `\`\`\`${codeBlockLang}`,
      formattedBody,
      `\`\`\``,
    ].join("\n");
  }

  const lines = [
    `# Request Report`,
    ``,
    `| Property | Value |`,
    `| :--- | :--- |`,
    `| **Method** | \`${request.method}\` |`,
    `| **Path** | \`${request.path || "/"}\` |`,
    `| **IP** | \`${request.ip || "N/A"}\` |`,
    `| **Content-Type** | \`${request.contentType || "N/A"}\` |`,
    `| **Body Size** | ${request.bodySize ? formatBytes(request.bodySize) : "0 B"} |`,
    `| **Created At** | ${request.createdAt ? format(new Date(request.createdAt), "PPP p") : "N/A"} |`,
    `| **Is Replay** | ${request.isReplay ? "Yes" : "No"} |`,
    request.replayedFrom ? `| **Replayed From** | \`${request.replayedFrom}\` |` : "",
    ``,
    `## Headers`,
    `\`\`\`json`,
    request.headers ? JSON.stringify(request.headers, null, 2) : "{}",
    `\`\`\``,
    ``,
    `## Query Parameters`,
    `\`\`\`json`,
    request.query ? JSON.stringify(request.query, null, 2) : "{}",
    `\`\`\``,
    ``,
    bodyMarkdownSection,
    ``,
    `---`,
    `*Generated by Hooklex on ${new Date().toISOString()}*`,
  ].filter(Boolean);

  const mdContent = lines.join("\n");
  const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8;" });
  saveAs(blob, `request-${request.id}.md`);
  toast.success("Markdown exported successfully");
};
