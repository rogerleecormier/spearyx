import { cn } from "@spearyx/ui-kit";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getScoreConfig(score: number) {
  if (score >= 80) return { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20", label: "Strong" };
  if (score >= 60) return { color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-amber-500/20", label: "Moderate" };
  return { color: "bg-red-500/15 text-red-700 dark:text-red-400 ring-red-500/20", label: "Weak" };
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const config = getScoreConfig(score);
  return (
    <div className={cn(
      "inline-flex flex-col items-center justify-center rounded-lg ring-1 font-mono tabular-nums",
      config.color,
      size === "sm" && "px-2 py-1 min-w-10",
      size === "md" && "px-3 py-1.5 min-w-14",
      size === "lg" && "px-4 py-2 min-w-20",
    )}>
      <span className={cn(
        "font-bold leading-none",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-2xl",
      )}>
        {score}
      </span>
      <span className={cn(
        "opacity-70 leading-none mt-0.5",
        size === "sm" && "text-[10px]",
        size === "md" && "text-[11px]",
        size === "lg" && "text-xs",
      )}>
        {config.label}
      </span>
    </div>
  );
}
