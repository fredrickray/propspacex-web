"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardSidebarProvider,
  useDashboardSidebar,
} from "@/contexts/dashboard-sidebar-context";
import BuyerSidebar from "./BuyerSidebar";

function BuyerShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggleSidebar } = useDashboardSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <BuyerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <PanelLeft
              className={`size-5 transition-transform duration-200 ${collapsed ? "lg:rotate-180" : ""}`}
              aria-hidden
            />
          </Button>
          <span className="text-sm font-medium text-muted-foreground lg:hidden">
            Menu
          </span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

const BuyerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardSidebarProvider>
      <BuyerShell>{children}</BuyerShell>
    </DashboardSidebarProvider>
  );
};

export default BuyerLayout;
