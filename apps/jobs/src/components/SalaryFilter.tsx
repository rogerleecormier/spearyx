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
    <div className="jobs-filter-section">
      <div className="jobs-filter-header">
        <DollarSign size={16} />
        <h3>Salary Range</h3>
      </div>
      <div className="jobs-filter-chips">
        {salaryRanges.map((range) => (
          <button
            key={range.value || "all"}
            onClick={() => onSelectRange(range.value)}
            className={`jobs-filter-chip ${selectedRange === range.value ? "active" : ""}`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--jobs-text-secondary)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={includeNoSalary}
            onChange={(e) => onIncludeNoSalaryChange(e.target.checked)}
            style={{
              accentColor: "var(--jobs-primary)",
              width: "1rem",
              height: "1rem",
            }}
          />
          <span>Include jobs with no salary info</span>
        </label>
      </div>
    </div>
  );
}
