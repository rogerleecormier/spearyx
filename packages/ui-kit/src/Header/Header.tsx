import { ReactNode } from "react";
import { Overline } from "../Typography";

interface HeaderProps {
  logo: ReactNode;
  label: string;
  children?: ReactNode;
}

export function Header({ logo, label, children }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="flex flex-col md:flex-row items-center md:justify-between px-4 py-3 md:py-3 gap-3 md:gap-0 max-w-7xl mx-auto">
        <div className="flex items-start gap-3">
          {logo}
          <Overline className="text-slate-500 leading-none mt-0.5">
            {label}
          </Overline>
        </div>
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </header>
  );
}
