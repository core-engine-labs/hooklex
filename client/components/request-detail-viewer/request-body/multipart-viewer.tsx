import Editor from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MultipartPart } from "@/utils/exportHelper";

export interface MultipartBodyViewerProps {
  viewMode: "parsed" | "raw";
  multipartParts: MultipartPart[];
  decodedRawBody: string;
}

export function MultipartBodyViewer({
  viewMode,
  multipartParts,
  decodedRawBody,
}: MultipartBodyViewerProps) {
  if (viewMode === "parsed" && multipartParts.length > 0) {
    return (
      <div className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Field Name</TableHead>
              <TableHead className="w-1/4">Type / Info</TableHead>
              <TableHead>Value / Attachment</TableHead>
              <TableHead className="w-[80px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {multipartParts.map((part, idx) => (
              <TableRow key={`${part.name}-${idx}`}>
                <TableCell className="font-mono text-sm font-semibold">
                  {part.name}
                </TableCell>
                <TableCell>
                  {part.isFile ? (
                    <Badge variant="secondary" className="font-mono text-xs">
                      File: {part.filename}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-mono text-xs">
                      {part.contentType || "text/plain"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm break-all">
                  {part.isFile ? (
                    <span className="italic text-muted-foreground">
                      [Binary Attachment: {part.value.length} bytes]
                    </span>
                  ) : (
                    part.value
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(part.value)
                        .then(() => toast.success(`Copied ${part.name}`))
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
  }

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
