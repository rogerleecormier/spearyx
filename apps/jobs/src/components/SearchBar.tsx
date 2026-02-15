import { Search, X, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@spearyx/ui-kit";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSearchAndScore?: (query: string) => void;
  isAIProcessing?: boolean;
  isScoring?: boolean;
  hasResume?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  onSearchAndScore,
  isAIProcessing = false,
  isScoring = false,
  hasResume = false,
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

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSearchAndScore = () => {
    if (onSearchAndScore && query.trim()) {
      onSearchAndScore(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      // If they have a resume, we could still default to search+score, 
      // but user explicitly asked for two buttons and the search button to just search.
      // So Enter = standard search now.
      handleSearch();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full !pl-11 pr-10 h-11 bg-white border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/10 transition-all shadow-sm"
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

        <div className="flex gap-2">
          {/* Standard Search Button */}
          <button
            onClick={handleSearch}
            disabled={!query.trim()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 h-11 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
          >
            <Search size={16} />
            Search
          </button>

          {/* Search + Score Button — only visible when resume is loaded */}
          {hasResume && (
            <button
              onClick={handleSearchAndScore}
              disabled={!query.trim() || isScoring}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 h-11 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-xl text-sm font-semibold hover:shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
              title="Search and score results against your resume"
            >
              {isScoring ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              Search + Score
            </button>
          )}
        </div>
      </div>

      {/* Helper text */}
      {hasResume && (
        <div className="flex items-center gap-4 px-1">
          <p className="text-[11px] text-slate-400">
            <span className="text-amber-500">✦</span> <strong>Search + Score</strong> uses AI to match jobs to your profile
          </p>
        </div>
      )}
    </div>
  );
}
