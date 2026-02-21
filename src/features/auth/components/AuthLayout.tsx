"use client";

import { ReactNode } from "react";
import Link from "next/link";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

interface AuthLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  headerVariant?: "minimal" | "full";
}

export const AuthLayout = ({
  children,
  showHeader = true,
  headerVariant = "minimal",
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <header className="border-b border-border bg-surface/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <PropSpaceLogo className="size-8 text-primary" />
                <span className="text-xl font-bold tracking-tight text-foreground">
                  PropSpace X
                </span>
              </Link>

              {headerVariant === "full" && (
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    href="#"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Platform
                  </Link>
                  <Link
                    href="#"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Listings
                  </Link>
                  <Link
                    href="#"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Solutions
                  </Link>
                </nav>
              )}

              {headerVariant === "minimal" && (
                <div className="flex items-center gap-4">
                  <Link
                    href="#"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Support
                  </Link>
                  <Link
                    href="#"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </div>
              )}

              <Link
                href="/auth/login"
                className="bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Log In
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
};
