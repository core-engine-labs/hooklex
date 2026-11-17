/* eslint-disable @typescript-eslint/no-explicit-any */

type ContentCategory =
    | "json"
    | "xml"
    | "html"
    | "form"
    | "image"
    | "audio"
    | "video"
    | "pdf"
    | "binary"
    | "text"
    | "javascript"
    | "css"
    | "markdown"
    | "multipart"
    | "ndjson"
    | "sse"
    | "unknown";

export interface MultipartPart {
  name: string;
  filename?: string;
  contentType?: string;
  value: string;
  isFile: boolean;
}


export const detectCategory = (contentType: string): ContentCategory => {
    const ct = (contentType || "").toLowerCase();
    // XML / SOAP
    if (ct.includes("xml") || ct.includes("soap")) return "xml";

    // Web Pages / SVG
    if (ct.includes("html") || ct.includes("svg")) return "html";

    // URL-Encoded Form
    if (ct.includes("x-www-form-urlencoded")) return "form";

    // Multipart Form Data (matches boundary headers like "multipart/form-data; boundary=...")
    if (ct.includes("multipart/")) return "multipart";

    // Streaming Data (NDJSON, SSE)
    if (ct.includes("ndjson") || ct.includes("jsonlines")) return "ndjson";
    if (ct.includes("event-stream")) return "sse";

    // JSON and JSON subtypes (+json, problem+json, vnd.api+json)
    if (ct.includes("json") || ct.includes("+json")) return "json";

    // Media Types
    if (ct.startsWith("image/")) return "image";
    if (ct.startsWith("audio/")) return "audio";
    if (ct.startsWith("video/")) return "video";
    if (ct.includes("pdf")) return "pdf";

    // Binary Streams & Protocols
    if (
        ct.includes("octet-stream") ||
        ct.includes("protobuf") ||
        ct.includes("grpc") ||
        ct.includes("msgpack") ||
        ct.includes("zip")
    ) {
        return "binary";
    }

    if (ct.includes("markdown") || ct.includes("md")) return "markdown";
    if (ct.includes("javascript")) return "javascript";
    if (ct.includes("css")) return "css";
    if (ct.startsWith("text/")) return "text";

    return "unknown";
};

export const getformParams = (category:string,rawBody:any) => {
    if (category !== "form") return null;
    try {
        const params = new URLSearchParams(rawBody);
        return Array.from(params.entries());
    } catch {
        return null;
    }
}

export const parseMultipartData = (bodyText: string, contentType: string): MultipartPart[] => {
  const parts: MultipartPart[] = [];

  // Extract boundary token from Content-Type header
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);
  if (!boundaryMatch) return parts;

  const boundary = boundaryMatch[1].trim().replace(/^["']|["']$/g, "");
  const rawParts = bodyText.split(new RegExp(`--${boundary}(?:--)?`));

  for (const rawPart of rawParts) {
    if (!rawPart.trim() || rawPart.trim() === "--") continue;

    const [headerBlock, ...bodySegments] = rawPart.split("\r\n\r\n");
    if (!headerBlock) continue;

    const bodyContent = bodySegments.join("\r\n\r\n").replace(/\r\n$/, "");
    const nameMatch = headerBlock.match(/name="([^"]+)"/i);
    const filenameMatch = headerBlock.match(/filename="([^"]+)"/i);
    const contentTypeMatch = headerBlock.match(/Content-Type:\s*([^\r\n]+)/i);

    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch ? filenameMatch[1] : undefined,
        contentType: contentTypeMatch ? contentTypeMatch[1] : undefined,
        value: bodyContent,
        isFile: !!filenameMatch,
      });
    }
  }

  return parts;
};