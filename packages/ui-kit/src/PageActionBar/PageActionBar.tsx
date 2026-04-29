import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface PageActionBarProps {
  children: ReactNode;
  tone?: "default" | "primary" | "indigo";
  className?: string;
}

const toneStyles = {
  default: "border-slate-200/80",
  primary: "border-primary-100/80",
  indigo: "border-indigo-100/80",
} as const;

export function PageActionBar({
  children,
  tone = "default",
  className = "",
}: PageActionBarProps) {
  return (
    <section
      className={cn(
        "spx-glass-card flex flex-col gap-3 rounded-[1.4rem] border px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </section>
  );
}
