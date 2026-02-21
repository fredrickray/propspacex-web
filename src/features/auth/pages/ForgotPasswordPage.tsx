"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Shield, AlertCircle } from "lucide-react";
import {
  AuthLayout,
  AuthCard,
  AuthCardHeader,
  AuthInput,
  AuthButton,
  AuthFooter,
} from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
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
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Connect Wallet
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthCard>
          <AuthCardHeader
            icon={<Mail className="size-8" />}
            title="Forgot Password?"
            description="Enter the email address associated with your PropSpace account and we'll send you a link to reset your password."
          />

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthInput
                label="Email Address"
                type="email"
                placeholder="e.g. myemail@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightElement={<Mail className="size-5 text-muted-foreground" />}
              />

              <AuthButton type="submit" isLoading={isLoading}>
                Send Reset Link
              </AuthButton>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-300 text-sm">
                  We've sent a password reset link to{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
              </p>

              <Link
                href="/auth/login"
                className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="size-4" />
                Back to Login
              </Link>
            </div>
          )}

          {/* Help Info */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Need help?</p>
                <p className="text-muted-foreground">
                  If you don't receive an email within 5 minutes and it's not in
                  your spam, your email might not be registered. Please try to{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:underline"
                  >
                    create a new account
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </AuthCard>
      </div>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 PropSpace X Enterprise Platform.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
