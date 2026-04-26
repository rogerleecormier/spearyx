import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { AppHeader } from "@spearyx/ui-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@spearyx/ui-kit";
import { Button } from "@spearyx/ui-kit";
import {
  FileUser,
  Shield,
  LogIn,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import type { SessionUser } from "@/lib/cloudflare";
import { logoutUser } from "@/server/functions/auth";

interface HeaderProps {
  user?: SessionUser | null;
}

export default function Header({ user }: HeaderProps) {
  const isDev = import.meta.env.DEV;
  const location = useLocation();
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    await router.invalidate();
    window.location.href = "/";
  }

  const authNav = user ? (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="font-medium text-slate-900 hover:bg-slate-100"
        >
          <User size={18} className="mr-2" />
          {user.email}
          <ChevronDown size={16} className="ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/profile" className="flex items-center">
            <FileUser size={16} className="mr-2 text-primary-500" />
            My Profile
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/admin" className="flex items-center">
                <Shield size={16} className="mr-2 text-primary-500" />
                Admin
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button variant="ghost" asChild className="font-medium text-slate-900 hover:bg-slate-100">
      <Link to="/login" className="flex items-center">
        <LogIn size={18} className="mr-2" />
        Sign In
      </Link>
    </Button>
  );

  return (
    <AppHeader
      app="jobs"
      isDev={isDev}
      currentPath={location.pathname}
      Link={Link}
      extraNav={authNav}
    />
  );
}
