import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface EmptyStateCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost";
  };
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  actionButton,
  className = "",
}: EmptyStateCardProps) {
  return (
    <Card
      className={`bg-slate-50 border-dashed border-2 border-slate-300 ${className}`}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 text-slate-400">{icon}</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-6 max-w-sm">{description}</p>
        {actionButton && (
          <Button
            onClick={actionButton.onClick}
            variant={actionButton.variant || "default"}
          >
            {actionButton.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
