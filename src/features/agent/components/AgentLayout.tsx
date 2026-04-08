"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardSidebarProvider,
  useDashboardSidebar,
} from "@/contexts/dashboard-sidebar-context";
import AgentSidebar from "./AgentSidebar";

function AgentShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggleSidebar } = useDashboardSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AgentSidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-card px-3">
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
          <span className="ml-2 text-sm font-medium text-muted-foreground lg:hidden">
            Menu
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

const AgentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardSidebarProvider>
      <AgentShell>{children}</AgentShell>
    </DashboardSidebarProvider>
  );
};

export default AgentLayout;
