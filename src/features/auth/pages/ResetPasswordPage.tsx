"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, AlertCircle } from "lucide-react";
import {
  AuthLayout,
  AuthCard,
  AuthCardHeader,
  AuthInput,
  AuthButton,
  PasswordStrength,
  AuthFooter,
} from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <AuthLayout showHeader={false}>
      {/* Header */}
      <header className="border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <PropSpaceLogo className="size-8 text-primary" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                PropSpace X
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Support
              </Link>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <span className="material-symbols-outlined text-xl">
                  light_mode
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthCard className="max-w-lg">
          <AuthCardHeader
            icon={<Shield className="size-8" />}
            title="Secure Your Account"
            description="Create a new password for your PropSpace account. This password will secure your Web3 access layer and keeps your data fully protected."
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthInput
              label="New Password"
              type="password"
              placeholder="Enter at least 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <AuthInput
              label="Confirm New Password"
              type="password"
              placeholder="Re-type your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                confirmPassword && password !== confirmPassword
                  ? "Passwords do not match"
                  : undefined
              }
            />

            <PasswordStrength password={password} />

            <AuthButton
              type="submit"
              isLoading={isLoading}
              disabled={!password || password !== confirmPassword}
            >
              Update Password
            </AuthButton>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="size-4" />
                Back to login
              </Link>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  Security Note
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  This password will protect your PropSpace X account
                  credentials. For Web3 interactions, your connected wallet
                  provides an additional security layer that cannot be
                  overridden.
                </p>
              </div>
            </div>
          </div>
        </AuthCard>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 PropSpace X. All rights reserved.</p>
            <p>Enterprise Real Estate Solutions</p>
          </div>
        </div>
      </footer>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
