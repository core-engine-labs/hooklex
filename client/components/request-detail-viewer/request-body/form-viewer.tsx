import Editor from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface FormBodyViewerProps {
  viewMode: "parsed" | "raw";
  rawBody: string;
  formParams: Array<[string, string]> | null;
}

export function FormBodyViewer({
  viewMode,
  rawBody,
  formParams,
}: FormBodyViewerProps) {
  if (viewMode === "raw") {
    return (
      <Editor
        height="200px"
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

  if (formParams && formParams.length > 0) {
    return (
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formParams.map(([key, value], idx) => (
              <TableRow key={`${key}-${idx}`}>
                <TableCell className="font-mono text-sm">{key}</TableCell>
                <TableCell className="font-mono text-sm break-all">
                  {value}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(value)
                        .then(() => toast.success("Value copied"))
                        .catch(() => toast.error("Copy failed"));
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else {
    return (
      <Editor
        height="200px"
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
}
