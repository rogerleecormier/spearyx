import { Layers, ChevronDown, Wrench, Briefcase } from "lucide-react";
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
  Link?: any; // TanStack Router Link component
}

export function AppHeader({ app, isDev = false, currentPath, Link }: AppHeaderProps) {
  const isOnTools = app === "tools";
  const isOnJobs = app === "jobs";
  const isOnCorporate = app === "corporate";

  const logo = (
    <a href="https://spearyx.com" className="inline-flex items-center">
      <img
        src="/images/spearyx-logo.svg"
        alt="Spearyx Logo"
        className="h-8 w-auto"
      />
    </a>
  );

  const label = app === "jobs" ? "Jobs" : app === "tools" ? "Tools" : "";

  return (
    <Header logo={logo} label={label}>
      {/* Tools Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`font-medium hover:bg-slate-100 ${
              isOnTools ? "text-primary-600 bg-primary-50" : "text-slate-900"
            }`}
          >
            <Wrench size={18} className="mr-2" />
            Tools
            <ChevronDown size={16} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem asChild className="cursor-pointer">
            {Link && app === "tools" ? (
              <Link to="/" className="flex items-center">
                <Wrench size={16} className="mr-2 text-primary-500" />
                <span>Tools Home</span>
              </Link>
            ) : (
              <a href="https://tools.spearyx.com" className="flex items-center">
                <Wrench size={16} className="mr-2 text-primary-500" />
                <span>Tools Home</span>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Available Tools</DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer">
            {Link && app === "tools" ? (
              <Link to="/raci-generator">RACI Generator</Link>
            ) : (
              <a href="https://tools.spearyx.com/raci-generator">
                RACI Generator
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Coming Soon</DropdownMenuLabel>
          <DropdownMenuItem disabled className="text-slate-400">
            Project Charter Generator
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="text-slate-400">
            Communications Plan Generator
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="text-slate-400">
            Risk Management Plan Generator
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="text-slate-400">
            Stakeholder Register
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Jobs Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`font-medium hover:bg-slate-100 ${
              isOnJobs ? "text-primary-600 bg-primary-50" : "text-slate-900"
            }`}
          >
            <Briefcase size={18} className="mr-2" />
            Jobs
            <ChevronDown size={16} className="ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem asChild className="cursor-pointer">
            {Link && app === "jobs" ? (
              <Link to="/" className="flex items-center">
                <Briefcase size={16} className="mr-2 text-primary-500" />
                <span>Job Listings</span>
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com" className="flex items-center">
                <Briefcase size={16} className="mr-2 text-primary-500" />
                <span>Job Listings</span>
              </a>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            {Link && app === "jobs" ? (
              <Link to="/sync" className="flex items-center">
                <Briefcase size={16} className="mr-2 text-primary-500" />
                <span>Sync Dashboard</span>
              </Link>
            ) : (
              <a href="https://jobs.spearyx.com/sync" className="flex items-center">
                <Briefcase size={16} className="mr-2 text-primary-500" />
                <span>Sync Dashboard</span>
              </a>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isDev && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-slate-900 font-medium hover:bg-slate-100"
            >
              <Layers size={18} className="mr-2" />
              Dev
              <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href="https://spearyx.com/cards" className="flex items-center">
                <Layers size={16} className="mr-2 text-primary-500" />
                <span>Card Library</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href="https://spearyx.com/typography"
                className="flex items-center"
              >
                <Layers size={16} className="mr-2 text-primary-500" />
                <span>Typography</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Header>
  );
}
