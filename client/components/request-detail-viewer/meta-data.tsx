import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "../../utils/exportUtils";

export interface RequestMetadataProps {
  ip: string;
  contentType: string;
  bodySize: number;
  createdAt: Date;
  isReplay: boolean;
  replayedFrom: string | null;
}

export function RequestMetadata({
  ip,
  contentType,
  bodySize,
  createdAt,
  isReplay,
  replayedFrom,
}: RequestMetadataProps) {
  const metaItems = [
    { label: "IP Address", value: ip },
    { label: "Content-Type", value: contentType || "—" },
    { label: "Body Size", value: formatBytes(bodySize) },
    {
      label: "Created At",
      value: format(new Date(createdAt), "PPP p"),
    },
    {
      label: "Replay",
      value: isReplay ? (
        <Badge variant="secondary" className="gap-1">
          <RefreshCw className="h-3 w-3" />
          Replayed
          {replayedFrom && <span className="ml-1 text-xs">(from {replayedFrom})</span>}
        </Badge>
      ) : (
        "—"
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/40 p-4 md:grid-cols-4">
      {metaItems.map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <div className="text-sm">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
