"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  House,
  Plus,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Wallet,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { useDashboardSidebar } from "@/contexts/dashboard-sidebar-context";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/agent", icon: LayoutDashboard },
  { label: "My Listings", href: "/agent/listings", icon: House },
  { label: "Add Property", href: "/agent/add-property", icon: Plus },
  { label: "Leads", href: "/agent/leads", icon: Users },
  { label: "Deals", href: "/agent/deals", icon: Handshake },
  { label: "Wallet", href: "/agent/wallet", icon: Wallet },
  { label: "Messages", href: "/agent/messages", icon: MessageSquare },
  { label: "Analytics", href: "/agent/analytics", icon: BarChart3 },
  { label: "Settings", href: "/agent/settings", icon: Settings },
];

type SidebarBodyProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarBody({ collapsed, onNavigate }: SidebarBodyProps) {
  const pathname = usePathname();

  const linkClass = (active: boolean, extra?: string) =>
    cn(
      "flex w-full items-center rounded-lg text-sm font-medium transition-colors",
      collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
      active
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
      extra,
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
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href="/agent"
          onClick={onNavigate}
          className={cn("flex items-center gap-2", collapsed && "justify-center")}
        >
          <PropSpaceLogo className="size-7 shrink-0 text-primary" />
          {!collapsed && (
            <span className="whitespace-nowrap text-lg font-bold text-foreground">
              PropSpace X
            </span>
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className="px-6 pb-2 pt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Seller Panel
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/agent"
              ? pathname === "/agent"
              : item.href !== "#" && pathname.startsWith(item.href);

          if (item.disabled) {
            const el = (
              <span
                className={linkClass(
                  false,
                  "cursor-not-allowed opacity-50",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </span>
            );
            return (
              <div key={item.label}>
                {withTip(
                  `${item.label} (coming soon)`,
                  el as ReactElement,
                )}
              </div>
            );
          }

          const el = (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={linkClass(isActive)}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
          return (
            <div key={item.label}>{withTip(item.label, el)}</div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-border p-4">
        <div>
          {withTip(
            "Account",
            <button
              type="button"
              className={cn(
                "flex w-full items-center rounded-lg transition-colors hover:bg-muted",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-2 py-2",
              )}
            >
              <Avatar className="size-9 shrink-0">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-foreground">
                      Sarah Johnson
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Licensed Agent
                    </p>
                  </div>
                  <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
                </>
              )}
            </button>,
          )}
        </div>
        <div>
          {withTip(
            "Log out",
            <button
              type="button"
              onClick={() => api.signout()}
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
              )}
            >
              <LogOut className="size-4 shrink-0" />
              {!collapsed && <span>Log out</span>}
            </button>,
          )}
        </div>
      </div>
    </>
  );
}

const AgentSidebar = () => {
  const { collapsed, mobileOpen, setMobileOpen } = useDashboardSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden min-h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out lg:flex",
          collapsed ? "w-[4.5rem]" : "w-[250px]",
        )}
      >
        <SidebarBody collapsed={collapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(100%,16rem)] p-0 lg:hidden">
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

export default AgentSidebar;
