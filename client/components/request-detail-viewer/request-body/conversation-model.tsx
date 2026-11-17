import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JsonCodeEditor } from "../../json-code-editor";

export interface ConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  result: string;
  isTsConvert: boolean;
}

export function ConversionModal({
  open,
  onOpenChange,
  title,
  result,
  isTsConvert,
}: ConversionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] overflow-auto">
          <JsonCodeEditor
            value={result}
            readOnly
            height="400px"
            language={isTsConvert ? "typescript" : "json"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
