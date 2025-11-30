import { ReactNode } from "react";

interface BodyProps {
  children: ReactNode;
  className?: string;
  size?: "lg" | "base" | "sm";
  weight?: "normal" | "medium" | "semibold";
  as?: React.ElementType;
}

export function Body({
  children,
  className = "",
  size = "base",
  weight = "normal",
  as: Component = "p",
}: BodyProps) {
  const sizeClass = {
    lg: "text-body-lg",
    base: "text-body",
    sm: "text-body-sm",
  }[size];

  const fontWeight = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
  }[weight];

  return (
    <Component
      className={`${sizeClass} ${fontWeight} leading-relaxed ${className}`}
    >
      {children}
    </Component>
  );
}
