import { ReactNode } from "react";

interface DisplayProps {
  children: ReactNode;
  className?: string;
  variant?: "bold" | "semibold";
  as?: React.ElementType;
}

export function Display({
  children,
  className = "",
  variant = "bold",
  as: Component = "h2",
}: DisplayProps) {
  const fontWeight = variant === "bold" ? "font-bold" : "font-semibold";
  return (
    <Component
      className={`text-5xl ${fontWeight} leading-tight tracking-tight ${className}`}
    >
      {children}
    </Component>
  );
}
