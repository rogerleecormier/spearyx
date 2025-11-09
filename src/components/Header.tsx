import { Link } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
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
        <Link to="/cards">
          <Button variant="outline" className="text-slate-900">
            <Layers size={20} />
            <span className="hidden sm:inline ml-2">Card Library</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
