"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarTrigger } from "./Sidebar";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/store/services/apiService";
import { clearAuth } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/doctors": "Doctors",
  "/patients": "Patients",
};

function getInitials(name?: string | null) {
  if (!name || typeof name !== "string") return "DA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase() || "DA";
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Portal";

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      dispatch(clearAuth());
      router.push("/login");
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-4">
      {/* Mobile sidebar trigger */}
      <MobileSidebarTrigger />

      {/* Page title */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground hidden sm:block">{pageTitle}</h2>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center w-64">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          id="global-search"
          placeholder="Search..."
          className="pl-9 h-9 bg-muted/50 border-transparent focus:border-border text-sm"
        />
      </div>

      {/* Dark mode */}
      <Button
        variant="ghost"
        size="icon"
        id="dark-mode-toggle"
        onClick={toggleDark}
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        id="notifications-btn"
        className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: "oklch(0.52 0.18 220)" }}
        />
      </Button>

      {/* Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          id="user-avatar-btn"
          className="flex items-center gap-2 rounded-xl p-1 pr-3 hover:bg-accent transition-colors"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
            >
              {user?.name ? getInitials(user.name) : "DA"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:block">
            {user?.name || "Admin"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <p className="font-medium">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground font-normal truncate">
              {user?.email || ""}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            id="dropdown-logout-btn"
            onClick={handleLogout}
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
