import { Link, useLocation } from "@tanstack/react-router";
import { AppHeader } from "@spearyx/ui-kit";

export default function Header() {
  const isDev = import.meta.env.DEV;
  const location = useLocation();

  return (
    <AppHeader 
      app="jobs" 
      isDev={isDev} 
      currentPath={location.pathname}
      Link={Link}
    />
  );
}
