"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AgentSidebar from "./AgentSidebar";

const AgentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background flex">
      <AgentSidebar />

      <div className="flex-1 min-w-0">
        <header className="h-14 border-b border-border bg-card px-4 flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PanelLeft className="size-4" />
          </Button>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AgentLayout;
