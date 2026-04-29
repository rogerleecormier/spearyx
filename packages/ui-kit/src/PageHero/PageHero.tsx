import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface PageHeroStat {
  label: string;
  value: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  stats?: PageHeroStat[];
  tone?: "primary" | "indigo" | "emerald" | "slate";
  className?: string;
}

const toneStyles = {
  primary: {
    border: "border-primary-200/70",
    bar: "border-t-primary-600",
    eyebrow: "border-primary-200/70 bg-primary-50/90 text-primary-700",
    glow: "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(220,38,38,0.08) 0%, transparent 55%)",
    statBorder: "border-primary-100/70",
  },
  indigo: {
    border: "border-indigo-200/70",
    bar: "border-t-indigo-600",
    eyebrow: "border-indigo-200/70 bg-indigo-50/90 text-indigo-700",
    glow: "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(99,102,241,0.10) 0%, transparent 55%)",
    statBorder: "border-indigo-100/70",
  },
  emerald: {
    border: "border-emerald-200/70",
    bar: "border-t-emerald-600",
    eyebrow: "border-emerald-200/70 bg-emerald-50/90 text-emerald-700",
    glow: "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(16,185,129,0.10) 0%, transparent 55%)",
    statBorder: "border-emerald-100/70",
  },
  slate: {
    border: "border-slate-200/80",
    bar: "border-t-slate-900",
    eyebrow: "border-slate-200/80 bg-slate-100/90 text-slate-700",
    glow: "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(148,163,184,0.12) 0%, transparent 55%)",
    statBorder: "border-slate-200/80",
  },
} as const;

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  actions,
  stats = [],
  tone = "primary",
  className = "",
}: PageHeroProps) {
  const styles = toneStyles[tone];

  return (
    <section
      className={cn(
        "spx-glass-card-strong relative overflow-hidden border-t-[3px]",
        styles.border,
        styles.bar,
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: styles.glow }}
      />

      <div className="relative px-5 py-4 sm:px-6 sm:py-4.5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            {(eyebrow || icon) && (
              <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]", styles.eyebrow)}>
                {icon}
                {eyebrow}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-sm leading-5 text-slate-500">
                  {description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex flex-wrap gap-2 pt-0.5">{actions}</div>
            )}
          </div>

          {stats.length > 0 && (
            <div className="hidden lg:flex lg:flex-shrink-0 lg:items-stretch lg:gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={cn("spx-stat-tile min-w-[80px] border text-center", styles.statBorder)}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
