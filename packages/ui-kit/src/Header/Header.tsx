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
    <header className={styles.glassNav}>
      <div className={styles.headerContainer}>
        <div className="flex items-end gap-3">
          {logo}
          {label && (
            <span className={styles.appLabel}>{label}</span>
          )}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
