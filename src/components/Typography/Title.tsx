import { ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
  className?: string;
  variant?: "bold" | "semibold";
  as?: React.ElementType;
}

export function Title({
  children,
  className = "",
  variant = "bold",
  as: Component = "h4",
}: TitleProps) {
  const fontWeight = variant === "bold" ? "font-bold" : "font-semibold";
  return (
    <Component className={`text-2xl ${fontWeight} leading-tight ${className}`}>
      {children}
    </Component>
  );
}
