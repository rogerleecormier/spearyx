import { ReactNode } from "react";

interface LabelProps {
  children: ReactNode;
  className?: string;
  variant?: "normal" | "semibold";
  htmlFor?: string;
  as?: React.ElementType;
}

export function Label({
  children,
  className = "",
  variant = "normal",
  htmlFor,
  as: Component = "label",
}: LabelProps) {
  const fontWeight = variant === "normal" ? "font-medium" : "font-semibold";
  return (
    <Component htmlFor={htmlFor} className={`text-sm ${fontWeight} tracking-wide ${className}`}>
      {children}
    </Component>
  );
}
