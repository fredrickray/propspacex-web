"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { api } from "@/lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/buyer" },
  { icon: Search, label: "Property Search", path: "/buyer/search" },
  { icon: Search, label: "Saved Searches", path: "/buyer/searches" },
  { icon: Heart, label: "Favorites", path: "/buyer/favorites" },
  { icon: MessageSquare, label: "Messages", path: "/buyer/messages", badge: 3 },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/buyer/settings" },
];

const BuyerSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <PropSpaceLogo className="h-8 w-8" />
          <span className="text-xl font-bold text-foreground">PropSpace X</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="size-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <item.icon className="size-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => api.signout()}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
        >
          <LogOut className="size-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default BuyerSidebar;
