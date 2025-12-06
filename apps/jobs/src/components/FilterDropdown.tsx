import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@spearyx/ui-kit";
import { ChevronDown, Check } from "lucide-react";

interface FilterOption {
  id: string | number | null;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  value: string | number | null;
  options: FilterOption[];
  onChange: (value: any) => void;
  align?: "start" | "end" | "center";
}

export default function FilterDropdown({
  label,
  value,
  options,
  onChange,
  align = "start",
}: FilterDropdownProps) {
  const selectedOption = options.find((opt) => opt.id === value);
  const isActive = value !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border outline-none focus:ring-2 focus:ring-primary-500/10 h-10 ${
            isActive
              ? "bg-primary-600 text-white border-transparent hover:bg-primary-700 shadow-sm"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span className="truncate max-w-[150px]">
            {selectedOption ? selectedOption.label : `All ${label}`}
          </span>
          <ChevronDown
            size={14}
            className={`flex-shrink-0 transition-transform duration-200 ${
              isActive ? "text-white/80" : "text-slate-400"
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="z-50 min-w-[220px] bg-white rounded-xl shadow-xl border border-slate-100 p-1"
        align={align}
        sideOffset={8}
      >
        <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
          <DropdownMenuItem
            className={`relative flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none transition-colors ${
              value === null
                ? "bg-primary-50 text-primary-700 font-medium"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            onClick={() => onChange(null)}
          >
            <span>All {label}</span>
            {value === null && <Check size={16} className="text-primary-600" />}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="h-px bg-slate-100 my-1" />

          {options.map((option) => (
            <DropdownMenuItem
              key={String(option.id)}
              className={`relative flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none transition-colors ${
                value === option.id
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
              onClick={() => onChange(option.id)}
            >
              <span className="truncate mr-2">{option.label}</span>
              <div className="flex items-center gap-2">
                {option.count !== undefined && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {option.count}
                  </span>
                )}
                {value === option.id && (
                  <Check size={16} className="text-primary-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
