import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ===========================
// PRIMARY CARD
// ===========================
interface PrimaryCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PrimaryCard({
  title,
  description,
  icon,
  children,
  className = "",
}: PrimaryCardProps) {
  return (
    <Card className={`border-l-4 border-l-primary-500 ${className}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && <div className="flex-shrink-0 text-2xl mt-1">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-primary-500">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// ===========================
// SECONDARY CARD
// ===========================
interface SecondaryCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function SecondaryCard({
  title,
  description,
  icon,
  children,
  className = "",
}: SecondaryCardProps) {
  return (
    <Card className={`border-l-4 border-l-secondary-500 ${className}`}>
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && <div className="flex-shrink-0 text-2xl mt-1">{icon}</div>}
          <div className="flex-1">
            <CardTitle className="text-secondary-500">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// ===========================
// TOOL CARD (For showcasing project tools)
// ===========================
interface ToolCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  status?: "available" | "coming-soon" | "beta";
  className?: string;
}

export function ToolCard({
  title,
  description,
  icon,
  status = "coming-soon",
  className = "",
}: ToolCardProps) {
  const statusConfig = {
    available: {
      badge: "Available",
      color: "bg-accent-50 text-accent-700 border-accent-200",
      borderColor: "border-l-accent-500",
    },
    "coming-soon": {
      badge: "Coming Soon",
      color: "bg-primary-50 text-primary-700 border-primary-200",
      borderColor: "border-l-primary-500",
    },
    beta: {
      badge: "Beta",
      color: "bg-secondary-50 text-secondary-700 border-secondary-200",
      borderColor: "border-l-secondary-500",
    },
  };

  const config = statusConfig[status];

  return (
    <Card className={`border-l-4 ${config.borderColor} ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {icon && (
              <div className="flex-shrink-0 text-2xl mt-1">{icon}</div>
            )}
            <div className="flex-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          <Badge className={`flex-shrink-0 ${config.color}`}>
            {config.badge}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}

// ===========================
// COMING SOON CARD
// ===========================
interface ComingSoonCardProps {
  title: string;
  subtitle?: string;
  description: string;
  icon?: ReactNode;
  eta?: string;
  className?: string;
}

export function ComingSoonCard({
  title,
  subtitle,
  description,
  icon,
  eta,
  className = "",
}: ComingSoonCardProps) {
  return (
    <Card
      className={`border-2 border-dashed border-primary-300 bg-gradient-to-br from-primary-50 to-white ${className}`}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex-shrink-0 text-3xl mt-1 opacity-50">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-primary-600">{title}</CardTitle>
              <Badge className="bg-primary-100 text-primary-700 border-primary-200">
                Coming Soon
              </Badge>
            </div>
            {subtitle && (
              <p className="text-sm font-medium text-primary-600 mb-2">
                {subtitle}
              </p>
            )}
            <CardDescription>{description}</CardDescription>
            {eta && (
              <p className="text-xs text-primary-500 mt-3">
                <span className="font-semibold">ETA:</span> {eta}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

// ===========================
// STATS CARD (For displaying metrics)
// ===========================
interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  accentColor?: "primary" | "secondary" | "accent" | "success" | "warning";
  className?: string;
}

export function StatsCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  accentColor = "primary",
  className = "",
}: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary-600",
    secondary: "text-secondary-600",
    accent: "text-accent-600",
    success: "text-success-600",
    warning: "text-warning-600",
  };

  const trendColors = {
    up: "text-accent-600",
    down: "text-error-600",
    neutral: "text-slate-600",
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">
            {label}
          </CardTitle>
          {icon && (
            <div className={`text-xl ${colorClasses[accentColor]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className={`text-2xl font-bold ${colorClasses[accentColor]}`}>
            {value}
          </div>
          {unit && <span className="text-sm text-slate-600">{unit}</span>}
        </div>
        {trend && trendValue && (
          <div className={`text-xs font-medium mt-2 ${trendColors[trend]}`}>
            {trend === "up" && "↑ "}
            {trend === "down" && "↓ "}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===========================
// INTERACTIVE CARD (With hover effects)
// ===========================
interface InteractiveCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  onHover?: boolean;
  accentColor?: "primary" | "secondary" | "accent";
  children?: ReactNode;
  className?: string;
}

export function InteractiveCard({
  title,
  description,
  icon,
  onHover = true,
  accentColor = "primary",
  children,
  className = "",
}: InteractiveCardProps) {
  const hoverClass = onHover ? "hover-lift hover-glow" : "";
  const glowClasses = {
    primary: "primary-glow",
    secondary: "secondary-glow",
    accent: "accent-glow",
  };

  return (
    <Card
      className={`cursor-pointer transition-all ${hoverClass} ${
        onHover ? glowClasses[accentColor] : ""
      } ${className}`}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {icon && (
            <div className="flex-shrink-0 text-2xl mt-1 hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
