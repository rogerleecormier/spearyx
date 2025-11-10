/**
 * RACI Header Bar
 * Logo upload and chart title editing
 */

import { RaciChart } from "@/types/raci";

interface RaciHeaderBarProps {
  chart: RaciChart;
  onChange: (chart: RaciChart) => void;
}

export default function RaciHeaderBar({ chart, onChange }: RaciHeaderBarProps) {
  return (
    <div className="flex items-center gap-4 w-full">
      <input
        type="text"
        value={chart.title}
        onChange={(e) => onChange({ ...chart, title: e.target.value })}
        placeholder="Enter chart title"
        className="flex-1 px-0 py-2 border-0 border-b-2 border-border bg-transparent text-2xl font-bold focus:outline-none focus:border-primary transition-colors"
        aria-label="Chart title"
      />
      <input
        type="file"
        accept="image/*"
        aria-label="Logo upload"
        className="cursor-pointer"
      />
    </div>
  );
}
