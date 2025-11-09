import { ReactNode } from "react";

interface CaptionProps {
  children: ReactNode;
  className?: string;
  variant?: "normal" | "semibold";
  as?: React.ElementType;
}

export function Caption({
  children,
  className = "",
  variant = "normal",
  as: Component = "span",
}: CaptionProps) {
  const fontWeight = variant === "semibold" ? "font-semibold" : "font-normal";
  return (
    <Component
      className={`block text-sm ${fontWeight} leading-snug ${className}`}
    >
      {children}
    </Component>
  );
}
