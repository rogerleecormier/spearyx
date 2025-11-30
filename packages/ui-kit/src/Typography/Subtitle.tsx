import { ReactNode } from "react";

interface SubtitleProps {
  children: ReactNode;
  className?: string;
  variant?: "semibold" | "regular";
  as?: React.ElementType;
}

export function Subtitle({
  children,
  className = "",
  variant = "semibold",
  as: Component = "h5",
}: SubtitleProps) {
  const fontWeight = variant === "semibold" ? "font-semibold" : "font-normal";
  return (
    <Component className={`text-subtitle ${fontWeight} ${className}`}>
      {children}
    </Component>
  );
}
