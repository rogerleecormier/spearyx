import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  tone?: "default" | "muted" | "primary" | "indigo";
  className?: string;
  contentClassName?: string;
}

const toneStyles = {
  default: "border-slate-200/80",
  muted: "border-slate-200/70 bg-slate-50/60",
  primary: "border-primary-100/80",
  indigo: "border-indigo-100/80",
} as const;

export function PageSection({
  title,
  description,
  actions,
  children,
  tone = "default",
  className = "",
  contentClassName = "",
}: PageSectionProps) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={cn("spx-glass-card rounded-[1.6rem] border", toneStyles[tone], className)}
    >
      {hasHeader && (
        <div className="flex flex-col gap-3 border-b border-slate-100/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={cn("px-6 py-5", contentClassName)}>{children}</div>
    </section>
  );
}
