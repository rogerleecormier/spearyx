import { ReactNode } from "react";
import { Overline } from "../Typography";
import styles from "./Header.module.css";

interface HeaderProps {
  logo: ReactNode;
  label: string;
  children?: ReactNode;
}

export function Header({ logo, label, children }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className={styles.headerContainer}>
        <div className="flex items-end gap-3">
          {logo}
          <Overline className="text-slate-500 leading-none mb-0.5">
            {label}
          </Overline>
        </div>
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </header>
  );
}
