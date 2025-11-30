import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertCardProps {
  title?: string;
  description?: string;
  variant?: "success" | "warning" | "error" | "info";
  dismissible?: boolean;
  onDismiss?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const variantConfig = {
  success: {
    Icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-l-green-500",
    textColor: "text-green-900",
    titleColor: "text-green-800",
    descColor: "text-green-700",
    iconColor: "text-green-500",
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
  },
  warning: {
    Icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-l-yellow-500",
    textColor: "text-yellow-900",
    titleColor: "text-yellow-800",
    descColor: "text-yellow-700",
    iconColor: "text-yellow-500",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
  },
  error: {
    Icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-l-red-500",
    textColor: "text-red-900",
    titleColor: "text-red-800",
    descColor: "text-red-700",
    iconColor: "text-red-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
  info: {
    Icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-l-blue-500",
    textColor: "text-blue-900",
    titleColor: "text-blue-800",
    descColor: "text-blue-700",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
  },
};

export function AlertCard({
  title,
  description,
  variant = "info",
  dismissible = false,
  onDismiss,
  children,
  className = "",
}: AlertCardProps) {
  const config = variantConfig[variant];
  const { Icon, bgColor, borderColor, titleColor, descColor, iconColor } =
    config;

  return (
    <Card
      className={`${bgColor} border-l-4 ${borderColor} relative overflow-hidden ${className}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`${iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              {title && (
                <CardTitle className={`${titleColor} text-lg`}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className={`${descColor} mt-1`}>
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
              aria-label="Dismiss alert"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </CardHeader>
      {children && <CardContent className={descColor}>{children}</CardContent>}
    </Card>
  );
}
