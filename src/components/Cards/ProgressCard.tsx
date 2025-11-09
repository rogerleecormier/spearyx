import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

interface ProgressCardProps {
  title: string;
  description?: string;
  progress: number;
  progressColor?: "red" | "orange" | "yellow" | "green" | "blue" | "purple";
  variant?: "linear" | "circular" | "steps";
  steps?: Array<{
    label: string;
    completed: boolean;
  }>;
  showPercentage?: boolean;
  className?: string;
}

const colorClasses = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

const textColorClasses = {
  red: "text-red-500",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-green-500",
  blue: "text-blue-500",
  purple: "text-purple-500",
};

export function ProgressCard({
  title,
  description,
  progress,
  progressColor = "blue",
  variant = "linear",
  steps,
  showPercentage = true,
  className = "",
}: ProgressCardProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Card className={`overflow-hidden transition-all ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-6">
        {variant === "linear" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Progress
              </span>
              {showPercentage && (
                <span
                  className={`text-sm font-bold ${textColorClasses[progressColor]}`}
                >
                  {clampedProgress}%
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${colorClasses[progressColor]} transition-all duration-500`}
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>
        )}

        {variant === "circular" && (
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={`${clampedProgress * 2.827} 282.7`}
                  strokeLinecap="round"
                  className={textColorClasses[progressColor]}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">
                  {clampedProgress}%
                </span>
              </div>
            </div>
          </div>
        )}

        {variant === "steps" && steps && steps.length > 0 && (
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    step.completed
                      ? "text-slate-900 font-medium"
                      : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Overall Progress
                </span>
                <span
                  className={`text-sm font-bold ${textColorClasses[progressColor]}`}
                >
                  {Math.round(
                    (steps.filter((s) => s.completed).length / steps.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                <div
                  className={`h-full ${colorClasses[progressColor]} transition-all duration-500`}
                  style={{
                    width: `${Math.round(
                      (steps.filter((s) => s.completed).length / steps.length) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
