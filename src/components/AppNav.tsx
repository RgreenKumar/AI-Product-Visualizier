import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Heart, History, LayoutDashboard, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

interface AppNavProps {
  search?: string;
  onSearchChange?: (value: string) => void;
}

export function AppNav({ search, onSearchChange }: AppNavProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
        <Logo to="/dashboard" />

        {onSearchChange && (
          <div className="relative ml-4 hidden max-w-sm flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search shirts, sarees, watches…"
              className="rounded-xl pl-9"
              aria-label="Search products"
            />
          </div>
        )}

        <nav className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Dashboard">
            <Link to="/dashboard">
              <LayoutDashboard className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
            <Link to="/wishlist">
              <Heart className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="History">
            <Link to="/history">
              <History className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon" aria-label="Profile menu">
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{user?.email ?? "Guest"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/history">Recently tried</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/wishlist">My wishlist</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  void navigate({ to: "/" });
                }}
              >
                <LogOut className="mr-2 size-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}