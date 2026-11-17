
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { marked } from "marked";
import jsonToTs from "json-to-ts";
import { parseStringPromise } from "xml2js";
import { detectCategory, getformParams, parseMultipartData } from "@/utils/exportHelper";

import { RequestBodyToolbar } from "./toolbar";
import { JsonBodyViewer } from "./json-viewer";
import { FormBodyViewer } from "./form-viewer";
import { XmlHtmlBodyViewer } from "./xml-html-viewer";
import { MarkdownBodyViewer } from "./markdown-viewer";
import { MediaBodyViewer } from "./media-viewer";
import { BinaryBodyViewer } from "./binary-viewer";
import { MultipartBodyViewer } from "./multipart-viewer";
import { CodeTextBodyViewer } from "./code-text-viewer";
import { ConversionModal } from "./conversation-model";
import { RequestBodyEmpty } from "./empty";

interface RequestBodyViewerProps {
  body: string | null;
  contentType: string;
  bodySize?: number;
}

const generateHexDump = (rawStr: string): string => {
  let bytes: Uint8Array;
  try {
    let base64Data = rawStr.includes(",") ? rawStr.split(",")[1] : rawStr;
    base64Data = base64Data.replace(/[\s\r\n]+/g, "");
    const binary = atob(base64Data);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  } catch {
    bytes = new TextEncoder().encode(rawStr);
  }

  let hexOutput = "";
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(8, "0");

    const hex = Array.from(chunk)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join(" ")
      .padEnd(47, " ");

    const ascii = Array.from(chunk)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");

    hexOutput += `${offset}  ${hex}  |${ascii}|\n`;
  }

  return hexOutput || "No binary content";
};

export function RequestBodyViewer({
  body,
  contentType,
  bodySize = 0,
}: RequestBodyViewerProps) {
  const [viewMode, setViewMode] = useState<"parsed" | "raw">("parsed");
  const [isFormatted, setIsFormatted] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertResult, setConvertResult] = useState("");
  const [isTsConvert, setisTsConvert] = useState(true);
  const [convertTitle, setConvertTitle] = useState("");
  const [isMarkdownPreview, setIsMarkdownPreview] = useState(false);

  const category = useMemo(() => detectCategory(contentType), [contentType]);
  const rawBody = body || "";
  const isEmpty = !body || body.trim() === "";

  const getBlobUrl = (dataUrl: string, type: string) => {
    try {
      let base64Data = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      base64Data = base64Data.replace(/[\s\r\n]+/g, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type || "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error decoding base64:", error);
      return "";
    }
  };

  const parsedJson = useMemo(() => {
    if (category !== "json") return null;
    try {
      return JSON.parse(rawBody);
    } catch {
      return null;
    }
  }, [category, rawBody]);

  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {

    let timer;
    let url: string;
    if (category !== "pdf" || !rawBody) {
      timer = setTimeout(() => setPdfUrl(""), 0)
      return;
    }

    timer = setTimeout(() => {
      url = getBlobUrl(rawBody, contentType);
      setPdfUrl(url);
    }, 0)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [category, rawBody, contentType]);

  const formParams = useMemo(() => getformParams(category, rawBody), [category, rawBody]);

  const parsedNdjson = useMemo(() => {
    if (category !== "ndjson") return null;
    try {
      return rawBody
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line.trim()));
    } catch {
      return null;
    }
  }, [category, rawBody]);

  const decodedRawBody = useMemo(() => {
    if (rawBody.startsWith("data:") && rawBody.includes(";base64,")) {
      try {
        const base64Part = rawBody.split(";base64,")[1];
        return atob(base64Part);
      } catch {
        return rawBody;
      }
    }
    return rawBody;
  }, [rawBody]);

  const multipartParts = useMemo(() => {
    if (category !== "multipart") return [];
    return parseMultipartData(decodedRawBody, contentType);
  }, [category, decodedRawBody, contentType]);

  const hexDump = useMemo(() => {
    if (category !== "binary") return "";
    return generateHexDump(rawBody);
  }, [category, rawBody]);

  const isDataUrl = rawBody.startsWith("data:");

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(rawBody)
      .then(() => toast.success("Body copied to clipboard"))
      .catch(() => toast.error("Failed to copy body"));
  }, [rawBody]);

  const handleFormatJson = useCallback(() => {
    if (parsedJson) {
      setIsFormatted(true);
      toast.info("JSON formatted");
    }
  }, [parsedJson]);

  const handleJsonToTs = () => {
    if (!parsedJson) return;
    try {
      const tsTypes = jsonToTs(parsedJson);
      setConvertResult(tsTypes.join("\n\n"));
      setConvertTitle("TypeScript Interfaces");
      setisTsConvert(true);
      setShowConvertModal(true);
    } catch {
      toast.error("Failed to convert JSON to TypeScript");
    }
  };

  const handleXmlToJson = async () => {
    if (!rawBody || !rawBody.trim()) {
      toast.error("Please provide valid XML input");
      return;
    }

    try {
      const result = await parseStringPromise(rawBody, {
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
      });

      const json = JSON.stringify(result, null, 2);
      setConvertResult(json);
      setisTsConvert(false);
      setConvertTitle("XML → JSON");
      setShowConvertModal(true);
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Invalid XML: " + err.message);
      }
    }
  };

  const handleXmlToTs = async () => {
    if (!rawBody.trim()) return;
    try {
      const result = await parseStringPromise(rawBody, {
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
      });
      const tsTypes = jsonToTs(result);
      setConvertResult(tsTypes.join("\n\n"));
      setisTsConvert(true);
      setConvertTitle("TypeScript Interfaces (from XML)");
      setShowConvertModal(true);
    } catch {
      toast.error("Failed to convert XML to TypeScript");
    }
  };

  const handleDownloadMedia = () => {
    let blob: Blob | null = null;
    const filename = `request.${contentType.split("/")[1] || "bin"}`;
    if (isDataUrl) {
      const mime = contentType.split(";")[0] || "application/octet-stream";
      const base64 = rawBody.split(",")[1] || "";
      const binary = atob(base64);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
      }
      blob = new Blob([array], { type: mime });
    } else {
      try {
        const binary = atob(rawBody);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        blob = new Blob([array], { type: contentType });
      } catch {
        toast.error("Invalid base64 data");
        return;
      }
    }
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    }
  };

  const markdownHtml = useMemo(() => {
    if (category === "markdown") {
      try {
        return marked(rawBody);
      } catch {
        return "<p>Error rendering markdown</p>";
      }
    }
    return "";
  }, [category, rawBody]);

  if (isEmpty) {
    return <RequestBodyEmpty />;
  }

  const renderContent = () => {
    if (category === "json") {
      return (
        <JsonBodyViewer
          viewMode={viewMode}
          parsedJson={parsedJson}
          rawBody={rawBody}
          isFormatted={isFormatted}
        />
      );
    }

    if (category === "form") {
      return (
        <FormBodyViewer
          viewMode={viewMode}
          rawBody={rawBody}
          formParams={formParams}
        />
      );
    }

    if (category === "xml" || category === "html") {
      return <XmlHtmlBodyViewer category={category} rawBody={rawBody} />;
    }

    if (category === "markdown") {
      return (
        <MarkdownBodyViewer
          isMarkdownPreview={isMarkdownPreview}
          markdownHtml={markdownHtml as string}
          rawBody={rawBody}
        />
      );
    }

    if (["image", "audio", "video", "pdf"].includes(category)) {
      return (
        <MediaBodyViewer
          category={category as "image" | "audio" | "video" | "pdf"}
          rawBody={rawBody}
          contentType={contentType}
          isDataUrl={isDataUrl}
          pdfUrl={pdfUrl}
        />
      );
    }

    if (category === "binary") {
      return (
        <BinaryBodyViewer
          viewMode={viewMode}
          hexDump={hexDump}
          contentType={contentType}
          bodySize={bodySize}
          handleCopy={handleCopy}
        />
      );
    }

    if (category === "multipart") {
      return (
        <MultipartBodyViewer
          viewMode={viewMode}
          multipartParts={multipartParts}
          decodedRawBody={decodedRawBody}
        />
      );
    }

    return (
      <CodeTextBodyViewer
        category={category}
        rawBody={rawBody}
        decodedRawBody={decodedRawBody}
        parsedNdjson={parsedNdjson}
      />
    );
  };

  return (
    <>
      <Card>
        <RequestBodyToolbar
          contentType={contentType}
          bodySize={bodySize}
          category={category}
          viewMode={viewMode}
          setViewMode={setViewMode}
          parsedJson={parsedJson}
          handleFormatJson={handleFormatJson}
          handleJsonToTs={handleJsonToTs}
          handleXmlToJson={handleXmlToJson}
          handleXmlToTs={handleXmlToTs}
          isMarkdownPreview={isMarkdownPreview}
          setIsMarkdownPreview={setIsMarkdownPreview}
          handleDownloadMedia={handleDownloadMedia}
          handleCopy={handleCopy}
        />
        <CardContent className="p-0">{renderContent()}</CardContent>
      </Card>

      <ConversionModal
        open={showConvertModal}
        onOpenChange={setShowConvertModal}
        title={convertTitle}
        result={convertResult}
        isTsConvert={isTsConvert}
      />
    </>
  );
}