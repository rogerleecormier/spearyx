import { Filter } from "lucide-react";

interface SourceFilterProps {
  selectedSource: string | null;
  onSelectSource: (source: string | null) => void;
}

export default function SourceFilter({
  selectedSource,
  onSelectSource,
}: SourceFilterProps) {
  const sources = [
    { id: "RemoteOK", name: "RemoteOK" },
    { id: "Greenhouse", name: "Greenhouse" },
    { id: "Lever", name: "Lever" },
    { id: "Himalayas", name: "Himalayas" },
  ];

  return (
    <div className="jobs-filter-section">
      <div className="jobs-filter-header">
        <Filter size={16} />
        <h3>Source</h3>
      </div>
      <div className="jobs-filter-chips">
        <button
          className={`jobs-filter-chip ${selectedSource === null ? "active" : ""}`}
          onClick={() => onSelectSource(null)}
        >
          All Sources
        </button>
        {sources.map((source) => (
          <button
            key={source.id}
            className={`jobs-filter-chip ${
              selectedSource === source.id ? "active" : ""
            }`}
            onClick={() => onSelectSource(source.id)}
          >
            {source.name}
          </button>
        ))}
      </div>
    </div>
  );
}
