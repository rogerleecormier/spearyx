import { ReactNode } from "react";

interface LabelProps {
  children: ReactNode;
  className?: string;
  variant?: "medium" | "semibold";
  as?: React.ElementType;
}

export function Label({
  children,
  className = "",
  variant = "medium",
  as: Component = "label",
}: LabelProps) {
  const fontWeight = variant === "semibold" ? "font-semibold" : "font-medium";
  return (
    <Component
      className={`block text-xs ${fontWeight} uppercase tracking-wider ${className}`}
    >
      {children}
    </Component>
  );
}
