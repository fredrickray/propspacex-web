"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, HelpCircle, Shield, Lock } from "lucide-react";
import {
  AuthLayout,
  AuthCard,
  AuthCardHeader,
  AuthButton,
  AuthFooter,
} from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

const VerifyEmailPage = () => {
  const [isResending, setIsResending] = useState(false);
  const email = "d***@domain.com"; // Mock email

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => setIsResending(false), 2000);
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
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </Link>
            </div>
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthCard>
          <AuthCardHeader
            icon={<Mail className="size-8" />}
            title="Verify your email"
            description="We've sent a verification link to your inbox. Please click the link to confirm your PropSpace account and access the dashboard."
          />

          {/* Email Display */}
          <div className="bg-muted rounded-lg px-4 py-3 text-center mb-6">
            <span className="text-foreground font-medium">{email}</span>
          </div>

          {/* Resend Button */}
          <AuthButton
            onClick={handleResend}
            isLoading={isResending}
            leftIcon={<RefreshCw className="size-4" />}
          >
            Resend Email
          </AuthButton>

          {/* Open Email Hint */}
          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't see it? Check your spam folder.
          </p>

          {/* Change Email Link */}
          <div className="text-center mt-4">
            <Link
              href="/auth/register"
              className="text-primary text-sm font-medium hover:underline"
            >
              Change email address →
            </Link>
          </div>

          {/* Trust Icons */}
          <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="size-5" />
              <span className="text-sm">Secure Links</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="size-5" />
              <span className="text-sm">Privacy Protected</span>
            </div>
          </div>

          {/* Help Link */}
          <div className="text-center mt-6">
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <HelpCircle className="size-4" />
              Need help? Contact our support team.
            </Link>
          </div>
        </AuthCard>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default VerifyEmailPage;
