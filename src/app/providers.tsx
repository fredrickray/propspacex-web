"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CommunicationsProvider } from "@/features/communications/communications-context";
import { MessagingDockProvider } from "@/features/communications/messaging-dock";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="propspacex-theme-v2"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CommunicationsProvider>
            <MessagingDockProvider>
              <Toaster />
              <Sonner />
              {children}
            </MessagingDockProvider>
          </CommunicationsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
