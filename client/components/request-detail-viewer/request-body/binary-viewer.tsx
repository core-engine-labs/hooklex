import { File, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "../../../utils/exportUtils";

export interface BinaryBodyViewerProps {
  viewMode: "parsed" | "raw";
  hexDump: string;
  contentType: string;
  bodySize: number;
  handleCopy: () => void;
}

export function BinaryBodyViewer({
  viewMode,
  hexDump,
  contentType,
  bodySize,
  handleCopy,
}: BinaryBodyViewerProps) {
  if (viewMode === "parsed") {
    return (
      <div className="overflow-x-auto bg-zinc-950 p-4 font-mono text-xs text-green-400">
        <pre className="whitespace-pre leading-relaxed">{hexDump}</pre>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <File className="h-5 w-5" />
            Binary / Protobuf Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Content Type:</span>
            <span>{contentType}</span>
            <span className="text-muted-foreground">Body Size:</span>
            <span>{formatBytes(bodySize)}</span>
          </div>
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-1 h-4 w-4" />
            Copy Raw String
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
