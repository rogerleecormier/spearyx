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
  const sizeClasses = {
    sm: "text-sm leading-normal",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-relaxed",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
  };

  return (
    <Component
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
    >
      {children}
    </Component>
  );
}
