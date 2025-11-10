import { Link } from "@tanstack/react-router";
import { Layers, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

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
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                className="text-slate-900"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Layers size={20} />
                <span className="hidden sm:inline ml-2">Components</span>
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <Link
                    to="/cards"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <Layers size={18} className="mr-2 text-primary-500" />
                    <span>Card Library</span>
                  </Link>
                  <Link
                    to="/typography"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <Layers size={18} className="mr-2 text-primary-500" />
                    <span>Typography</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Tools Dropdown */}
            <Link
              to="/tools/raci-generator"
              className="px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              Tools
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
