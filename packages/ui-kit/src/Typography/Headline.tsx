import { ReactNode } from "react";

interface HeadlineProps {
  children: ReactNode;
  className?: string;
  variant?: "bold" | "semibold";
  as?: React.ElementType;
}

export function Headline({
  children,
  className = "",
  variant = "bold",
  as: Component = "h3",
}: HeadlineProps) {
  const fontWeight = variant === "bold" ? "font-bold" : "font-semibold";
  return (
    <Component
      className={`text-4xl ${fontWeight} leading-tight ${className}`}
    >
      {children}
    </Component>
  );
}
