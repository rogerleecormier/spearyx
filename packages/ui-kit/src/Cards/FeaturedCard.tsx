import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface FeaturedCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  accentColor?: "primary" | "accent" | "slate";
  className?: string;
}

export function FeaturedCard({
  title,
  description,
  icon,
  accentColor = "primary",
  className = "",
}: FeaturedCardProps) {
  const borderClasses = {
    primary: "border-l-red-500",
    accent: "border-l-green-500",
    slate: "border-l-slate-500",
  };

  return (
    <Card className={`border-l-4 ${borderClasses[accentColor]} ${className}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && <div className="flex-shrink-0 text-2xl mt-1">{icon}</div>}
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
