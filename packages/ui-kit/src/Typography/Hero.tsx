import { ReactNode } from "react";

interface HeroProps {
  children: ReactNode;
  className?: string;
  variant?: "bold" | "semibold";
  as?: React.ElementType;
}

export function Hero({
  children,
  className = "",
  variant = "bold",
  as: Component = "h1",
}: HeroProps) {
  const fontWeight = variant === "bold" ? "font-bold" : "font-semibold";
  return (
    <Component
      className={`text-hero ${fontWeight} ${className}`}
    >
      {children}
    </Component>
  );
}
