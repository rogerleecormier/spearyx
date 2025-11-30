import { Link } from "@tanstack/react-router";
import { Layers, ChevronDown } from "lucide-react";
import { Button } from "@spearyx/ui-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@spearyx/ui-kit";

export default function Header() {
  const isDev = import.meta.env.DEV;

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
        </div>
        <div className="flex items-center gap-4">
          {/* Jobs Link */}
          <a
            href="https://jobs.spearyx.com"
            className="px-4 py-2 text-slate-900 font-medium hover:bg-slate-100 rounded-md transition-colors"
          >
            Jobs
          </a>

          {/* Tools Link */}
          <a
            href="https://tools.spearyx.com"
            className="px-4 py-2 text-slate-900 font-medium hover:bg-slate-100 rounded-md transition-colors"
          >
            Tools
          </a>

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
