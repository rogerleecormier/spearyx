import type { ReactNode } from "react";
import {
  Layers,
  ChevronDown,
  Wrench,
  Briefcase,
  FileText,
  BarChart3,
  Search,
  History,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Header } from "../Header";

interface AppHeaderProps {
  app: "jobs" | "tools" | "corporate";
  isDev?: boolean;
  currentPath: string;
  Link?: any;
  extraNav?: ReactNode;
}

export function AppHeader({ app, isDev = false, currentPath, Link, extraNav }: AppHeaderProps) {
  const isOnTools = app === "tools";
  const isOnJobs = app === "jobs";

  const logo = (
    <a href="https://spearyx.com" className="inline-flex items-center group">
      <img
        src="/images/spearyx-logo.svg"
        alt="Spearyx"
        className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-80"
      />
    </a>
  );

  const label = app === "jobs" ? "Jobs" : app === "tools" ? "Tools" : "";

  const navBtnBase =
    "font-semibold text-sm transition-all duration-150 rounded-lg px-3 py-2 flex items-center gap-1.5 border border-transparent";
  const navBtnActive =
    "text-primary-600 bg-red-50/80 border-red-100";
  const navBtnIdle =
    "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80";

  return (
    <Header logo={logo} label={label}>
      {/* Tools Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className={`${navBtnBase} ${isOnTools ? navBtnActive : navBtnIdle}`}>
            <Wrench size={15} />
            Tools
            <ChevronDown size={13} className="opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[70] w-68 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl ring-1 ring-black/5"
        >
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            {Link && app === "tools" ? (
              <Link to="/" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Wrench size={14} className="text-slate-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Tools Home</div>
                  <div className="text-xs text-slate-500">Browse all tools</div>
                </div>
              </Link>
            ) : (
              <a href="https://tools.spearyx.com" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Wrench size={14} className="text-slate-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Tools Home</div>
                  <div className="text-xs text-slate-500">Browse all tools</div>
                </div>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
            Available
          </DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            {Link && app === "tools" ? (
              <Link to="/raci-generator" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={14} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">RACI Generator</div>
                  <div className="text-xs text-slate-500">AI-powered role mapping</div>
                </div>
              </Link>
            ) : (
              <a href="https://tools.spearyx.com/raci-generator" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={14} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">RACI Generator</div>
                  <div className="text-xs text-slate-500">AI-powered role mapping</div>
                </div>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
            Coming Soon
          </DropdownMenuLabel>
          {["Project Charter Generator", "Communications Plan", "Risk Register", "Stakeholder Register"].map((name) => (
            <DropdownMenuItem key={name} disabled className="rounded-lg px-3 py-2 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-slate-400" />
                </div>
                <span className="text-sm text-slate-400">{name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Jobs Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className={`${navBtnBase} ${isOnJobs ? navBtnActive : navBtnIdle}`}>
            <Briefcase size={15} />
            Jobs
            <ChevronDown size={13} className="opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[70] w-72 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl ring-1 ring-black/5"
        >
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            {Link && app === "jobs" ? (
              <Link to="/" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={14} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Job Listings</div>
                  <div className="text-xs text-slate-500">AI-curated tech jobs</div>
                </div>
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={14} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Job Listings</div>
                  <div className="text-xs text-slate-500">AI-curated tech jobs</div>
                </div>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 py-1">
            Job Tools
          </DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            {Link && app === "jobs" ? (
              <Link to="/analyze" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Search size={14} className="text-violet-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Analyze Job</div>
                  <div className="text-xs text-slate-500">Match scoring and resume strategy</div>
                </div>
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/analyze" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <Search size={14} className="text-violet-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Analyze Job</div>
                  <div className="text-xs text-slate-500">Match scoring and resume strategy</div>
                </div>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            {Link && app === "jobs" ? (
              <Link to="/history" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <History size={14} className="text-sky-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">History</div>
                  <div className="text-xs text-slate-500">Review past analyses and documents</div>
                </div>
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/history" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                  <History size={14} className="text-sky-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">History</div>
                  <div className="text-xs text-slate-500">Review past analyses and documents</div>
                </div>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
            {Link && app === "jobs" ? (
              <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={14} className="text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Search Insights</div>
                  <div className="text-xs text-slate-500">Track your match trends and search activity</div>
                </div>
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/dashboard" className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={14} className="text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Search Insights</div>
                  <div className="text-xs text-slate-500">Track your match trends and search activity</div>
                </div>
              </a>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isDev && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className={`${navBtnBase} ${navBtnIdle}`}>
              <Layers size={15} />
              Dev
              <ChevronDown size={13} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-[70] w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl ring-1 ring-black/5"
          >
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <a href="https://spearyx.com/cards" className="flex items-center gap-2 px-3 py-2">
                <Layers size={14} className="text-primary-500" />
                <span className="text-sm text-slate-900">Card Library</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
              <a href="https://spearyx.com/typography" className="flex items-center gap-2 px-3 py-2">
                <Layers size={14} className="text-primary-500" />
                <span className="text-sm text-slate-900">Typography</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {extraNav}
    </Header>
  );
}
