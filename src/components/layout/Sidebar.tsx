"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useLogoutMutation } from "@/store/services/apiService";
import { clearAuth } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

function NavLink({
  item,
  collapsed,
  mobile = false,
  onClick,
}: {
  item: (typeof navItems)[0];
  collapsed: boolean;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
        isActive
          ? "text-white shadow-md"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      )}
      style={
        isActive
          ? { background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }
          : undefined
      }
    >
      {isActive && (
        <span
          className="absolute inset-0 rounded-xl opacity-20 blur-sm"
          style={{ background: "oklch(0.52 0.18 220)" }}
        />
      )}
      <Icon className={cn("w-5 h-5 flex-shrink-0 relative z-10", isActive ? "text-white" : "")} />
      {(!collapsed || mobile) && (
        <span className="relative z-10 truncate">{item.label}</span>
      )}
    </Link>
  );

  if (collapsed && !mobile) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
}

export function SidebarContent({
  collapsed,
  mobile = false,
  onClose,
}: {
  collapsed: boolean;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    dispatch(clearAuth());
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
          collapsed && !mobile ? "justify-center" : ""
        )}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
        >
          <Activity className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">Doctor Tracker</p>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        <div className={cn("mb-2", !collapsed || mobile ? "px-2" : "")}>
          {(!collapsed || mobile) && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Navigation
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              mobile={mobile}
              onClick={onClose}
            />
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        {collapsed && !mobile ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  id="logout-btn"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button
            onClick={handleLogout}
            id="logout-btn-expanded"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex-shrink-0 relative",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <SidebarContent collapsed={collapsed} />

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        id="sidebar-collapse-btn"
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background shadow-md flex items-center justify-center hover:bg-accent transition-colors z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        id="mobile-menu-btn"
        className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
        <SidebarContent collapsed={false} mobile onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
