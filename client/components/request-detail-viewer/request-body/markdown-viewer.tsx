import Editor from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";

export interface MarkdownBodyViewerProps {
  isMarkdownPreview: boolean;
  markdownHtml: string;
  rawBody: string;
}

export function MarkdownBodyViewer({
  isMarkdownPreview,
  markdownHtml,
  rawBody,
}: MarkdownBodyViewerProps) {
  if (isMarkdownPreview) {
    return (
      <div
        className="prose prose-sm max-w-none p-4 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: markdownHtml }}
      />
    );
  } else {
    return (
      <Editor
        height="400px"
        language="markdown"
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
}
