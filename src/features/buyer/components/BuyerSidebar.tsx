"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Handshake,
  Wallet,
} from "lucide-react";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDashboardSidebar } from "@/contexts/dashboard-sidebar-context";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/buyer" },
  { icon: Search, label: "Property Search", path: "/buyer/search" },
  { icon: Search, label: "Saved Searches", path: "/buyer/searches" },
  { icon: Heart, label: "Favorites", path: "/buyer/favorites" },
  { icon: MessageSquare, label: "Messages", path: "/buyer/messages", badge: 3 },
  { icon: Handshake, label: "Deals", path: "/buyer/deals" },
  { icon: Wallet, label: "Wallet", path: "/buyer/wallet" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/buyer/settings" },
];

type SidebarBodyProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarBody({ collapsed, onNavigate }: SidebarBodyProps) {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center rounded-lg transition-colors",
      collapsed ? "relative justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const withTip = (label: string, el: ReactElement) =>
    collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{el}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    ) : (
      el
    );

  return (
    <>
      <div
        className={cn(
          "border-b border-border",
          collapsed ? "flex justify-center p-3" : "p-4",
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center",
          )}
        >
          <PropSpaceLogo className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <span className="whitespace-nowrap text-xl font-bold text-foreground">
              PropSpace X
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const link = (
            <Link
              href={item.path}
              onClick={onNavigate}
              className={linkClass(isActive)}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
              {collapsed && item.badge ? (
                <span
                  className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"
                  aria-label={`${item.badge} notifications`}
                />
              ) : null}
            </Link>
          );
          return (
            <div key={item.path}>{withTip(item.label, link)}</div>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-4">
        {bottomItems.map((item) => {
          const link = (
            <Link
              href={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
          return (
            <div key={item.path}>{withTip(item.label, link)}</div>
          );
        })}
        <div>
          {withTip(
            "Log out",
            <button
              type="button"
              onClick={() => api.signout()}
              className={cn(
                "flex w-full items-center rounded-lg text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              )}
            >
              <LogOut className="size-5 shrink-0" />
              {!collapsed && <span className="font-medium">Log Out</span>}
            </button>,
          )}
        </div>
      </div>
    </>
  );
}

const BuyerSidebar = () => {
  const { collapsed, mobileOpen, setMobileOpen } = useDashboardSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden min-h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-in-out lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(100%,18rem)] p-0 lg:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex min-h-full flex-col">
            <SidebarBody
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BuyerSidebar;
