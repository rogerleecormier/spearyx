import { Link } from "@tanstack/react-router";
import { Layers, ChevronDown, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const isDev = import.meta.env.DEV;

  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center">
          <img
            src="/images/spearyx-logo.svg"
            alt="Spearyx Logo"
            className="h-8 w-auto"
          />
        </Link>
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

            {/* Tools Dropdown */}
            {/* Tools Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-slate-900 font-medium hover:bg-slate-100"
                >
                  <Wrench size={18} className="mr-2" />
                  Tools
                  <ChevronDown size={16} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
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
          </div>
        )}
      </div>
    </header>
  );
}
