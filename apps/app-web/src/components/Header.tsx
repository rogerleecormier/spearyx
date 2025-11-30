import { Link, useLocation } from "@tanstack/react-router";
import { Layers, ChevronDown, Wrench, Briefcase, LayoutDashboard } from "lucide-react";
import { Button } from "@spearyx/ui-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Overline,
} from "@spearyx/ui-kit";

export default function Header() {
  const isDev = import.meta.env.DEV;
  const location = useLocation();
  const isToolsPage = location.pathname.startsWith("/tools");
  const isJobsPage = location.pathname.startsWith("/jobs");

  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-end gap-3">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/images/spearyx-logo.svg"
              alt="Spearyx Logo"
              className="h-8 w-auto"
            />
          </Link>
          {isToolsPage && (
            <Overline className="text-slate-500 leading-none mb-0.5">
              Tools
            </Overline>
          )}
          {isJobsPage && (
            <Overline className="text-slate-500 leading-none mb-0.5">
              Jobs
            </Overline>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Jobs Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`font-medium hover:bg-slate-100 ${
                  isJobsPage ? "text-primary-600 bg-primary-50" : "text-slate-900"
                }`}
              >
                <Briefcase size={18} className="mr-2" />
                Jobs
                <ChevronDown size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/jobs" className="flex items-center">
                  <Briefcase size={16} className="mr-2 text-primary-500" />
                  <span>Job Listings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/jobs/sync" className="flex items-center">
                  <LayoutDashboard size={16} className="mr-2 text-primary-500" />
                  <span>Sync Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tools Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`font-medium hover:bg-slate-100 ${
                  isToolsPage ? "text-primary-600 bg-primary-50" : "text-slate-900"
                }`}
              >
                <Wrench size={18} className="mr-2" />
                Tools
                <ChevronDown size={16} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/tools" className="flex items-center">
                  <Wrench size={16} className="mr-2 text-primary-500" />
                  <span>Tools Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Available Tools</DropdownMenuLabel>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/tools/raci-generator">RACI Generator</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Coming Soon</DropdownMenuLabel>
              <DropdownMenuItem disabled>
                Project Charter Generator
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Communications Plan Generator
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                Risk Management Plan Generator
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Stakeholder Register</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isDev && (
            <div className="flex items-center gap-4">
            {/* Components Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-900 font-medium hover:bg-slate-100"
                >
                  <Layers size={18} className="mr-2" />
                  Components
                  <ChevronDown size={16} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/cards" className="flex items-center">
                    <Layers size={16} className="mr-2 text-primary-500" />
                    <span>Card Library</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/typography" className="flex items-center">
                    <Layers size={16} className="mr-2 text-primary-500" />
                    <span>Typography</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
