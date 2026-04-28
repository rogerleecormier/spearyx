import type { ReactNode } from "react";

interface PageActionBarProps {
  children: ReactNode;
  className?: string;
}

export function PageActionBar({ children, className = "" }: PageActionBarProps) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between ${className}`}
      style={{
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(226,232,240,0.7)",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      {children}
    </section>
  );
}
