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
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Filter size={16} />
        <h3>Source</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium transition-all hover:border-slate-300 hover:shadow-sm ${
            selectedSource === null
              ? "bg-primary-600 text-white border-transparent hover:bg-primary-700 hover:border-transparent shadow-md"
              : "text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => onSelectSource(null)}
        >
          All Sources
        </button>
        {sources.map((source) => (
          <button
            key={source.id}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium transition-all hover:border-slate-300 hover:shadow-sm ${
              selectedSource === source.id
                ? "bg-primary-600 text-white border-transparent hover:bg-primary-700 hover:border-transparent shadow-md"
                : "text-slate-600 hover:bg-slate-50"
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
