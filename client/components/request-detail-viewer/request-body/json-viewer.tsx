import Editor from "@monaco-editor/react";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JsonCodeEditor } from "../../json-code-editor";

export interface JsonBodyViewerProps {
  viewMode: "parsed" | "raw";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedJson: any;
  rawBody: string;
  isFormatted: boolean;
}

export function JsonBodyViewer({
  viewMode,
  parsedJson,
  rawBody,
  isFormatted,
}: JsonBodyViewerProps) {
  if (viewMode === "raw") {
    return (
      <Editor
        height="200px"
        language="json"
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

  if (parsedJson) {
    const jsonString = isFormatted
      ? JSON.stringify(parsedJson, null, 2)
      : rawBody;
    return <JsonCodeEditor value={jsonString} readOnly height="200px" />;
  } else {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid JSON</AlertTitle>
          <AlertDescription>
            The body is not valid JSON. Showing raw content.
          </AlertDescription>
        </Alert>
        <Editor
          height="200px"
          language="json"
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
      </div>
    );
  }
}
