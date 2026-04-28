import type { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className = "",
  contentClassName = "",
}: PageSectionProps) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={`rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.84)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(226,232,240,0.7)",
        boxShadow: "0 2px 12px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)",
      }}
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
      <div className={`px-6 py-5 ${contentClassName}`}>{children}</div>
    </section>
  );
}
