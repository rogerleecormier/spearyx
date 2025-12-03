import { DollarSign } from "lucide-react";

interface SalaryFilterProps {
  selectedRange: string | null;
  onSelectRange: (range: string | null) => void;
  includeNoSalary: boolean;
  onIncludeNoSalaryChange: (include: boolean) => void;
}

// Predefined salary ranges
const salaryRanges = [
  { label: "All Salaries", value: null },
  { label: "Under $50k", value: "0-50000" },
  { label: "$50k - $100k", value: "50000-100000" },
  { label: "$100k - $150k", value: "100000-150000" },
  { label: "$150k - $200k", value: "150000-200000" },
  { label: "Over $200k", value: "200000+" },
];

export default function SalaryFilter({
  selectedRange,
  onSelectRange,
  includeNoSalary,
  onIncludeNoSalaryChange,
}: SalaryFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <DollarSign size={16} />
        <h3>Salary Range</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {salaryRanges.map((range) => (
          <button
            key={range.value || "all"}
            onClick={() => onSelectRange(range.value)}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium transition-all hover:border-slate-300 hover:shadow-sm ${
              selectedRange === range.value
                ? "bg-primary-600 text-white border-transparent hover:bg-primary-700 hover:border-transparent shadow-md"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeNoSalary}
            onChange={(e) => onIncludeNoSalaryChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 accent-primary-600"
          />
          <span>Include jobs with no salary info</span>
        </label>
      </div>
    </div>
  );
}
