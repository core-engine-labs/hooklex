import { FileDown, FileText, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SpecificRequest, BodyExportContext } from "@/types/request";
import { exportPDF, exportCSV, exportMD } from "../../utils/exportUtils";

export interface RequestExportDropdownProps {
  request: SpecificRequest;
  exportContext: BodyExportContext;
}

export function RequestExportDropdown({
  request,
  exportContext,
}: RequestExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 border border-input cursor-pointer">
        <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
        <span>Export Report</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={async () => await exportPDF(request, exportContext)}
            className="cursor-pointer"
          >
            <FileText
              className="mr-2 h-4 w-4 text-rose-500"
              aria-hidden="true"
            />
            <span>PDF Document</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => await exportCSV(request, exportContext)}
            className="cursor-pointer"
          >
            <FileSpreadsheet
              className="mr-2 h-4 w-4 text-emerald-500"
              aria-hidden="true"
            />
            <span>CSV Spreadsheet</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => await exportMD(request, exportContext)}
            className="cursor-pointer"
          >
            <FileText
              className="mr-2 h-4 w-4 text-blue-500"
              aria-hidden="true"
            />
            <span>Markdown File</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
