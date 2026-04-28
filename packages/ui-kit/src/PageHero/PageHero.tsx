import type { ReactNode } from "react";

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
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  actions,
  stats = [],
  className = "",
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(220,38,38,0.10)",
        borderTop: "3px solid #dc2626",
        boxShadow:
          "0 1px 0 rgba(220,38,38,0.06), 0 8px 32px rgba(15,23,42,0.07), 0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      {/* subtle ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 0% 0%, rgba(220,38,38,0.05) 0%, transparent 55%)",
        }}
      />

      <div className="relative px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left: eyebrow + title + description + actions */}
          <div className="space-y-2.5 min-w-0 flex-1">
            {(eyebrow || icon) && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-700">
                {icon}
                {eyebrow}
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-sm leading-6 text-slate-500">
                  {description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex flex-wrap gap-2 pt-0.5">{actions}</div>
            )}
          </div>

          {/* Right: stats — always beside left column */}
          {stats.length > 0 && (
            <div className="hidden sm:flex flex-shrink-0 items-stretch gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl px-4 py-3 text-center"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(220,38,38,0.08)",
                    boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                    minWidth: "80px",
                  }}
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

        {/* Stats row on mobile (below content) */}
        {stats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl px-4 py-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(220,38,38,0.08)",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
                  minWidth: "80px",
                }}
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
    </section>
  );
}
