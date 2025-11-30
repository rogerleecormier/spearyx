import { ArrowUpDown } from "lucide-react";

interface SortControlsProps {
  sortBy: "newest" | "oldest" | "title-asc" | "title-desc";
  onSortChange: (
    sortBy: "newest" | "oldest" | "title-asc" | "title-desc"
  ) => void;
}

const sortOptions = [
  { value: "newest" as const, label: "Newest First" },
  { value: "oldest" as const, label: "Oldest First" },
  { value: "title-asc" as const, label: "Title (A-Z)" },
  { value: "title-desc" as const, label: "Title (Z-A)" },
];

export default function SortControls({
  sortBy,
  onSortChange,
}: SortControlsProps) {
  return (
    <div className="jobs-sort-controls">
      <ArrowUpDown size={18} />
      <label htmlFor="sort-select">Sort by:</label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) =>
          onSortChange(
            e.target.value as "newest" | "oldest" | "title-asc" | "title-desc"
          )
        }
        className="jobs-sort-select"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
