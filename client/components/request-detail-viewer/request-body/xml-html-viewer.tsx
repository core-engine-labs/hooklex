import Editor from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";

export interface XmlHtmlBodyViewerProps {
  category: "xml" | "html";
  rawBody: string;
}

export function XmlHtmlBodyViewer({ category, rawBody }: XmlHtmlBodyViewerProps) {
  const language = category === "xml" ? "xml" : "html";
  return (
    <Editor
      height="400px"
      language={language}
      theme="vs-dark"
      value={rawBody}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        lineNumbers: "on",
      }}
      loading={<Skeleton className="h-64 w-full" />}
    />
  );
}
