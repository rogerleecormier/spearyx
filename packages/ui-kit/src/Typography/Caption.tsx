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
  const fontWeight = variant === "normal" ? "font-normal" : "font-semibold";
  return (
    <Component className={`text-sm ${fontWeight} ${className}`}>
      {children}
    </Component>
  );
}
