import { useMemo } from "react";
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
  User,
  LogIn,
  LogOut,
  Shield,
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Header } from "../Header";
import { getSharedAuthOrigin } from "../../../shared-utils/src/auth";

interface AppHeaderUser {
  id?: number;
  email: string;
  role: string;
}

interface AppHeaderProps {
  app: "jobs" | "tools" | "corporate";
  isDev?: boolean;
  currentPath: string;
  Link?: any;
  extraNav?: ReactNode;
  user?: AppHeaderUser | null;
  onLogout?: () => Promise<void> | void;
}

function getAppOrigin(app: AppHeaderProps["app"], currentPath: string): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (app === "corporate") return "https://spearyx.com";
  if (app === "tools") return "https://tools.spearyx.com";
  if (currentPath.startsWith("/login") || currentPath.startsWith("/analyze")) {
    return "https://jobs.spearyx.com";
  }
  return "https://jobs.spearyx.com";
}

function normalizePath(path: string) {
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

function isActivePath(currentPath: string, targetPath: string) {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);
  return current === target || current.startsWith(`${target}/`);
}

/* ── shared dropdown content styles ── */
const contentClass =
  "z-[9999] min-w-[13rem] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/12 ring-1 ring-black/[0.06]";

const itemBase =
  "cursor-pointer rounded-xl border border-transparent p-0 outline-none transition-all duration-100 data-[highlighted]:border-slate-200 data-[highlighted]:bg-slate-50 focus:border-slate-200 focus:bg-slate-50";

const itemActive = "border-red-100 bg-red-50/60";

/* nav trigger buttons */
const triggerBase =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 border border-transparent select-none focus:outline-none";
const triggerIdle =
  "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 hover:border-slate-200/60";
const triggerActive =
  "text-primary-700 bg-primary-50/80 border-primary-100/80";

/* icon badge inside dropdown */
function IconBadge({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}
    >
      {children}
    </span>
  );
}

function NavItem({
  label,
  sub,
  icon,
  bg,
}: {
  label: string;
  sub: string;
  icon: ReactNode;
  bg: string;
}) {
  return (
    <span className="flex items-center gap-2.5 rounded-[10px] px-3 py-2">
      <IconBadge bg={bg}>{icon}</IconBadge>
      <span>
        <span className="block text-sm font-semibold text-slate-900 leading-tight">
          {label}
        </span>
        <span className="block text-xs text-slate-500 leading-tight mt-0.5">
          {sub}
        </span>
      </span>
    </span>
  );
}

export function AppHeader({
  app,
  isDev = false,
  currentPath,
  Link,
  extraNav,
  user,
  onLogout,
}: AppHeaderProps) {
  const isOnTools = app === "tools";
  const isOnJobs = app === "jobs";
  const sharedOrigin =
    typeof window === "undefined" ? getSharedAuthOrigin() : getSharedAuthOrigin(window.location.href);
  const appOrigin = getAppOrigin(app, currentPath);

  const resolvedUser = user ?? null;
  const canAccessLinkedInSearch = app === "jobs" && resolvedUser?.role === "admin";

  const loginHref = useMemo(() => {
    if (app === "corporate") return "/login";
    // For jobs/tools, link to spearyx.com/login with the current page as redirect target
    // so the user lands back where they were after signing in.
    const returnTo =
      typeof window !== "undefined"
        ? window.location.href
        : `${appOrigin}${currentPath || "/"}`;
    const params = new URLSearchParams({ redirect: returnTo });
    return `https://spearyx.com/login?${params.toString()}`;
  }, [app, appOrigin, currentPath]);

  async function handleSharedLogout() {
    if (onLogout) { await onLogout(); return; }
    if (typeof window === "undefined") return;
    await fetch(`${sharedOrigin}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      mode: "cors",
    }).catch(() => undefined);
    window.location.reload();
  }

  function toolsItem(path: string) {
    const active = isOnTools && isActivePath(currentPath, path);
    return `${itemBase} ${active ? itemActive : ""}`;
  }

  function jobsItem(path: string) {
    const active = isOnJobs && isActivePath(currentPath, path);
    return `${itemBase} ${active ? itemActive : ""}`;
  }

  const logo = (
    <a href="https://spearyx.com" className="inline-flex items-center group">
      <img
        src="/images/spearyx-logo.svg"
        alt="Spearyx"
        className="h-7 w-auto transition-opacity duration-200 group-hover:opacity-75"
      />
    </a>
  );

  const label = app === "jobs" ? "Jobs" : app === "tools" ? "Tools" : "";

  return (
    <Header logo={logo} label={label}>
      {/* ── Tools dropdown ── */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className={`${triggerBase} ${isOnTools ? triggerActive : triggerIdle}`}>
            <Wrench size={14} />
            Tools
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className={`${contentClass} w-72`}>
          <DropdownMenuItem asChild className={toolsItem("/")}>
            {Link && app === "tools" ? (
              <Link to="/" className="block">
                <NavItem
                  label="Tools Home"
                  sub="Browse all project tools"
                  icon={<Home size={13} className="text-slate-600" />}
                  bg="bg-slate-100"
                />
              </Link>
            ) : (
              <a href="https://tools.spearyx.com" className="block">
                <NavItem
                  label="Tools Home"
                  sub="Browse all project tools"
                  icon={<Home size={13} className="text-slate-600" />}
                  bg="bg-slate-100"
                />
              </a>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuLabel className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Available
          </DropdownMenuLabel>

          <DropdownMenuItem asChild className={toolsItem("/raci-generator")}>
            {Link && app === "tools" ? (
              <Link to="/raci-generator" className="block">
                <NavItem
                  label="RACI Generator"
                  sub="AI-powered role mapping"
                  icon={<BarChart3 size={13} className="text-primary-600" />}
                  bg="bg-primary-50"
                />
              </Link>
            ) : (
              <a href="https://tools.spearyx.com/raci-generator" className="block">
                <NavItem
                  label="RACI Generator"
                  sub="AI-powered role mapping"
                  icon={<BarChart3 size={13} className="text-primary-600" />}
                  bg="bg-primary-50"
                />
              </a>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuLabel className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Coming Soon
          </DropdownMenuLabel>
          {["Project Charter Generator", "Communications Plan", "Risk Register", "Stakeholder Register"].map((name) => (
            <DropdownMenuItem key={name} disabled className="rounded-xl px-3 py-2 opacity-40 cursor-not-allowed">
              <span className="flex items-center gap-2.5 rounded-[10px]">
                <IconBadge bg="bg-slate-50">
                  <FileText size={13} className="text-slate-400" />
                </IconBadge>
                <span className="text-sm text-slate-400">{name}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Jobs dropdown ── */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className={`${triggerBase} ${isOnJobs ? triggerActive : triggerIdle}`}>
            <Briefcase size={14} />
            Jobs
            <ChevronDown size={12} className="opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className={`${contentClass} w-76`}>
          <DropdownMenuItem asChild className={jobsItem("/")}>
            {Link && app === "jobs" ? (
              <Link to="/" className="block">
                <NavItem
                  label="Jobs Home"
                  sub="Overview & getting started"
                  icon={<Home size={13} className="text-slate-600" />}
                  bg="bg-slate-100"
                />
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com" className="block">
                <NavItem
                  label="Jobs Home"
                  sub="Overview & getting started"
                  icon={<Home size={13} className="text-slate-600" />}
                  bg="bg-slate-100"
                />
              </a>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-slate-100" />
          <DropdownMenuLabel className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Job Tools
          </DropdownMenuLabel>

          <DropdownMenuItem asChild className={jobsItem("/jobs")}>
            {Link && app === "jobs" ? (
              <Link to="/jobs" className="block">
                <NavItem
                  label="Job Listings"
                  sub="AI-curated tech jobs"
                  icon={<Briefcase size={13} className="text-primary-600" />}
                  bg="bg-primary-50"
                />
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/jobs" className="block">
                <NavItem
                  label="Job Listings"
                  sub="AI-curated tech jobs"
                  icon={<Briefcase size={13} className="text-primary-600" />}
                  bg="bg-primary-50"
                />
              </a>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={jobsItem("/analyze")}>
            {Link && app === "jobs" ? (
              <Link to="/analyze" className="block">
                <NavItem
                  label="Analyze Job"
                  sub="Match scoring & resume strategy"
                  icon={<Search size={13} className="text-violet-600" />}
                  bg="bg-violet-50"
                />
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/analyze" className="block">
                <NavItem
                  label="Analyze Job"
                  sub="Match scoring & resume strategy"
                  icon={<Search size={13} className="text-violet-600" />}
                  bg="bg-violet-50"
                />
              </a>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={jobsItem("/history")}>
            {Link && app === "jobs" ? (
              <Link to="/history" className="block">
                <NavItem
                  label="History"
                  sub="Past analyses & documents"
                  icon={<History size={13} className="text-sky-600" />}
                  bg="bg-sky-50"
                />
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/history" className="block">
                <NavItem
                  label="History"
                  sub="Past analyses & documents"
                  icon={<History size={13} className="text-sky-600" />}
                  bg="bg-sky-50"
                />
              </a>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={jobsItem("/dashboard")}>
            {Link && app === "jobs" ? (
              <Link to="/dashboard" className="block">
                <NavItem
                  label="Search Insights"
                  sub="Match trends & activity"
                  icon={<BarChart3 size={13} className="text-emerald-600" />}
                  bg="bg-emerald-50"
                />
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/dashboard" className="block">
                <NavItem
                  label="Search Insights"
                  sub="Match trends & activity"
                  icon={<BarChart3 size={13} className="text-emerald-600" />}
                  bg="bg-emerald-50"
                />
              </a>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Dev dropdown ── */}
      {isDev && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className={`${triggerBase} ${triggerIdle}`}>
              <Layers size={14} />
              Dev
              <ChevronDown size={12} className="opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className={`${contentClass} w-52`}>
            <DropdownMenuItem asChild className={itemBase}>
              <a href="https://spearyx.com/cards" className="flex items-center gap-2 px-3 py-2">
                <Layers size={13} className="text-primary-500" />
                <span className="text-sm text-slate-900">Card Library</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className={itemBase}>
              <a href="https://spearyx.com/typography" className="flex items-center gap-2 px-3 py-2">
                <Layers size={13} className="text-primary-500" />
                <span className="text-sm text-slate-900">Typography</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* ── User menu ── */}
      {resolvedUser ? (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className={`${triggerBase} ${triggerIdle} max-w-[220px]`}>
              <User size={14} className="shrink-0" />
              <span className="truncate text-sm">{resolvedUser.email}</span>
              <ChevronDown size={12} className="shrink-0 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className={`${contentClass} w-64`}>
            <DropdownMenuItem asChild className={jobsItem("/profile")}>
              {Link && app === "jobs" ? (
                <Link to="/profile" className="flex items-center gap-2 rounded-[10px] px-3 py-2">
                  <User size={14} className="text-primary-500" />
                  <span className="text-sm font-medium text-slate-900">My Profile</span>
                </Link>
              ) : (
                <a
                  href={`${sharedOrigin}/profile`}
                  className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                >
                  <User size={14} className="text-primary-500" />
                  <span className="text-sm font-medium text-slate-900">My Profile</span>
                </a>
              )}
            </DropdownMenuItem>
            {canAccessLinkedInSearch && (
              <>
                <DropdownMenuItem asChild className={jobsItem("/linkedin-search")}>
                  {Link && app === "jobs" ? (
                    <Link to="/linkedin-search" className="flex items-center gap-2 rounded-[10px] px-3 py-2">
                      <Search size={14} className="text-primary-500" />
                      <span className="text-sm font-medium text-slate-900">LinkedIn Search</span>
                    </Link>
                  ) : (
                    <a
                      href="https://jobs.spearyx.com/linkedin-search"
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                    >
                      <Search size={14} className="text-primary-500" />
                      <span className="text-sm font-medium text-slate-900">LinkedIn Search</span>
                    </a>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={jobsItem("/linkedin-jobs")}>
                  {Link && app === "jobs" ? (
                    <Link to="/linkedin-jobs" className="flex items-center gap-2 rounded-[10px] px-3 py-2">
                      <History size={14} className="text-primary-500" />
                      <span className="text-sm font-medium text-slate-900">LinkedIn Results</span>
                    </Link>
                  ) : (
                    <a
                      href="https://jobs.spearyx.com/linkedin-jobs"
                      className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                    >
                      <History size={14} className="text-primary-500" />
                      <span className="text-sm font-medium text-slate-900">LinkedIn Results</span>
                    </a>
                  )}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            {resolvedUser.role === "admin" && (
              <>
                <DropdownMenuItem asChild className={itemBase}>
                  <a
                    href={app === "jobs" ? "/admin" : `${sharedOrigin}/admin`}
                    className="flex items-center gap-2 rounded-[10px] px-3 py-2"
                  >
                    <Shield size={14} className="text-primary-500" />
                    <span className="text-sm font-medium text-slate-900">Admin</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
              </>
            )}
            <DropdownMenuItem
              className={`${itemBase} text-destructive focus:text-destructive`}
              onClick={handleSharedLogout}
            >
              <span className="flex items-center gap-2 rounded-[10px] px-3 py-2">
                <LogOut size={14} />
                <span className="text-sm font-medium">Sign Out</span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <a
          href={loginHref}
          className={`${triggerBase} ${triggerIdle}`}
        >
          <LogIn size={14} />
          Sign In
        </a>
      )}

      {extraNav}
    </Header>
  );
}
