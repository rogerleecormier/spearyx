import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Small overline text (e.g. "Project Tools") */
  overline?: string;
  /** Main page title */
  title: string;
  /** Optional subtitle / description */
  description?: string;
  /** Icon or emoji displayed to the left of the title */
  icon?: ReactNode;
  /** Slot for action buttons (right side) */
  actions?: ReactNode;
  /** Slot for breadcrumb or secondary nav (above title) */
  breadcrumb?: ReactNode;
  /** Extra class names */
  className?: string;
}

export function PageHeader({
  overline,
  title,
  description,
  icon,
  actions,
  breadcrumb,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`spx-page-header ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {breadcrumb && (
          <div className="mb-3">{breadcrumb}</div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {icon && (
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-red-100 border border-primary-100 flex items-center justify-center text-xl shadow-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {overline && (
                <p className="overline text-primary-600 mb-1">{overline}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                {title}
              </h1>
              {description && (
                <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}
