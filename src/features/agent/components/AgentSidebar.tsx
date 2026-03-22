"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", href: "/agent", icon: LayoutDashboard },
  { label: "My Listings", href: "/agent/listings", icon: House },
  { label: "Add Property", href: "/agent/add-property", icon: Plus },
  { label: "Leads", href: "/agent/leads", icon: Users },
  { label: "Messages", href: "#", icon: MessageSquare },
  { label: "Analytics", href: "#", icon: BarChart3 },
  { label: "Settings", href: "#", icon: Settings },
];

const AgentSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-[250px] shrink-0 flex-col border-r border-border bg-card">
      <div className="h-16 border-b border-border px-4 flex items-center">
        <Link href="/agent" className="flex items-center gap-2">
          <PropSpaceLogo className="size-7 text-primary" />
          <span className="text-lg font-bold text-foreground">PropSpace X</span>
        </Link>
      </div>

      <div className="px-6 pt-8 pb-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Seller Panel
        </p>
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/agent"
              ? pathname === "/agent"
              : item.href !== "#" && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <button
          type="button"
          className="w-full flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted transition-colors"
        >
          <Avatar className="size-9">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground text-left">
              Sarah Johnson
            </p>
            <p className="text-xs text-muted-foreground text-left">
              Licensed Agent
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground ml-auto" />
        </button>
      </div>
    </aside>
  );
};

export default AgentSidebar;
