import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code,
  Eye,
  FileText,
  Type,
  Braces,
  EyeOff,
  Download,
  Copy,
} from "lucide-react";
import { formatBytes } from "../../../utils/exportUtils";

export interface RequestBodyToolbarProps {
  contentType: string;
  bodySize: number;
  category: string;
  viewMode: "parsed" | "raw";
  setViewMode: (mode: "parsed" | "raw") => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedJson: any;
  handleFormatJson: () => void;
  handleJsonToTs: () => void;
  handleXmlToJson: () => void;
  handleXmlToTs: () => void;
  isMarkdownPreview: boolean;
  setIsMarkdownPreview: (val: boolean) => void;
  handleDownloadMedia: () => void;
  handleCopy: () => void;
}

export function RequestBodyToolbar({
  contentType,
  bodySize,
  category,
  viewMode,
  setViewMode,
  parsedJson,
  handleFormatJson,
  handleJsonToTs,
  handleXmlToJson,
  handleXmlToTs,
  isMarkdownPreview,
  setIsMarkdownPreview,
  handleDownloadMedia,
  handleCopy,
}: RequestBodyToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {contentType || "unknown"}
        </Badge>
        {bodySize > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatBytes(bodySize)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {/* Toggle view for JSON / Form */}
        {(category === "json" || category === "form") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "parsed" ? "raw" : "parsed")
            }
          >
            {viewMode === "parsed" ? (
              <Code className="mr-1 h-4 w-4" />
            ) : (
              <Eye className="mr-1 h-4 w-4" />
            )}
            {viewMode === "parsed" ? "Raw" : "Parsed"}
          </Button>
        )}

        {/* JSON actions */}
        {category === "json" && parsedJson && viewMode === "parsed" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => await handleFormatJson()}
            >
              <FileText className="mr-1 h-4 w-4" />
              Prettify
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => await handleJsonToTs()}
            >
              <Type className="mr-1 h-4 w-4" />
              To TS
            </Button>
          </>
        )}

        {/* XML actions */}
        {category === "xml" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => await handleXmlToJson()}
            >
              <Braces className="mr-1 h-4 w-4" />
              To JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => await handleXmlToTs()}
            >
              <Type className="mr-1 h-4 w-4" />
              To TS
            </Button>
          </>
        )}

        {/* Markdown toggle */}
        {category === "markdown" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMarkdownPreview(!isMarkdownPreview)}
          >
            {isMarkdownPreview ? (
              <EyeOff className="mr-1 h-4 w-4" />
            ) : (
              <Eye className="mr-1 h-4 w-4" />
            )}
            {isMarkdownPreview ? "Raw" : "Preview"}
          </Button>
        )}

        {/* Media download */}
        {["image", "audio", "video", "pdf"].includes(category) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => await handleDownloadMedia()}
          >
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        )}

        {/* Copy always */}
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => await handleCopy()}
        >
          <Copy className="mr-1 h-4 w-4" />
          Copy
        </Button>
      </div>
    </div>
  );
}
