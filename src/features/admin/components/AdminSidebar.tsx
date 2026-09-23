"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck,
  Image as ImageIcon,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { api } from "@/lib/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Properties", url: "/admin/properties", icon: Building2 },
  { title: "Verifications", url: "/admin/verifications", icon: FileCheck },
  { title: "Media", url: "/admin/media", icon: ImageIcon },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const collapsed = state === "collapsed";
  const profile = api.getProfile();
  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    "Admin";
  const roleLabel =
    profile?.appRole === "admin"
      ? "Super Admin"
      : profile?.appRole === "agent"
        ? "Agent"
        : profile?.appRole === "buyer"
          ? "Buyer"
          : "User";
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="border-b border-border px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          {collapsed ? (
            <Image
              src="/favicon.png"
              alt="PropSpace X icon"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0"
            />
          ) : (
            <PropSpaceLogo className="h-10 w-auto max-w-[180px]" />
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-accent rounded-lg p-2 transition-colors">
              <Avatar className="size-9">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => {
                api.signout();
              }}
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
