import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function RequestBodyEmpty() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No request body provided</p>
      </CardContent>
    </Card>
  );
}
