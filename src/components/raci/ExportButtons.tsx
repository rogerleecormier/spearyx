/**
 * Export Buttons
 * Multiple export format options
 */

import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";

interface ExportButtonsProps {
  chart?: any;
  theme?: string;
}

export default function ExportButtons({}: ExportButtonsProps) {
  const handleExport = (format: string) => {
    // TODO: Implement export logic
    console.log(`Exporting as ${format}`);
  };

  const handleGetLink = () => {
    // TODO: Implement public link generation
    console.log("Generating public link");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => handleExport("pdf")} className="gap-2">
        <Download size={16} />
        Export PDF
      </Button>
      <Button onClick={() => handleExport("xlsx")} className="gap-2">
        <Download size={16} />
        Export XLSX
      </Button>
      <Button onClick={() => handleExport("csv")} className="gap-2">
        <Download size={16} />
        Export CSV
      </Button>
      <Button onClick={handleGetLink} variant="secondary" className="gap-2">
        <Share2 size={16} />
        Get Link
      </Button>
    </div>
  );
}
