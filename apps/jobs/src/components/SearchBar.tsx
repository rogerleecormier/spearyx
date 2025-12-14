import { Search, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@spearyx/ui-kit";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isAIProcessing?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  isAIProcessing = false,
  placeholder = "Search jobs... try 'React developer at startups'",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full !pl-11 pr-16 h-10 bg-white border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/10 transition-all shadow-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isAIProcessing && (
          <div className="flex items-center gap-1 text-amber-600">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-xs font-medium">AI</span>
          </div>
        )}
        {query && !isAIProcessing && (
          <button
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

