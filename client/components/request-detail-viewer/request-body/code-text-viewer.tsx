import Editor from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";

export interface CodeTextBodyViewerProps {
  category: string;
  rawBody: string;
  decodedRawBody: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedNdjson: any;
}

export function CodeTextBodyViewer({
  category,
  rawBody,
  decodedRawBody,
  parsedNdjson,
}: CodeTextBodyViewerProps) {
  if (category === "ndjson") {
    const formattedNdjson = parsedNdjson
      ? JSON.stringify(parsedNdjson, null, 2)
      : rawBody;

    return (
      <Editor
        height="200px"
        language="json"
        theme="vs-dark"
        value={formattedNdjson}
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

  if (category === "sse") {
    return (
      <Editor
        height="200px"
        language="plaintext"
        theme="vs-dark"
        value={decodedRawBody}
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

  if (["javascript", "css", "text"].includes(category)) {
    const lang =
      category === "javascript"
        ? "javascript"
        : category === "css"
          ? "css"
          : "plaintext";
    return (
      <Editor
        height="400px"
        language={lang}
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

  return (
    <Editor
      height="400px"
      language="plaintext"
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
