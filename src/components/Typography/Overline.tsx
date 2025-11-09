import { ReactNode } from "react";

interface OverlineProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Overline({
  children,
  className = "",
  as: Component = "span",
}: OverlineProps) {
  return (
    <Component
      className={`text-xs font-semibold uppercase tracking-widest ${className}`}
    >
      {children}
    </Component>
  );
}
