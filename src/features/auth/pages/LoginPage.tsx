"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Fingerprint, Shield, Wallet } from "lucide-react";
import {
  AuthLayout,
  AuthCard,
  AuthCardHeader,
  AuthCardFooter,
  AuthInput,
  AuthButton,
  AuthDivider,
  AuthFooter,
} from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <AuthLayout showHeader={false}>
      {/* Minimal Header */}
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
                Help Center
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to PropSpace X
          </h1>
          <p className="text-muted-foreground">
            Secure access for Agents, Buyers, and Admins.
          </p>
        </div>

        {/* Two Column Auth Cards */}
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
          {/* Traditional Login */}
          <AuthCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Lock className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">
                  Sign in to PropSpace
                </h2>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access your dashboard
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthInput
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightElement={<Mail className="size-5 text-muted-foreground" />}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <AuthInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <AuthButton
                type="submit"
                isLoading={isLoading}
                rightIcon={<Lock className="size-4" />}
              >
                Sign In
              </AuthButton>
            </form>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="size-4" /> Secured
              </span>
              <span className="flex items-center gap-1">
                <Lock className="size-4" /> 256-bit Encrypted
              </span>
            </div>
          </AuthCard>

          {/* Passwordless Options */}
          <AuthCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">
                  Passwordless Login
                </h2>
                <p className="text-sm text-muted-foreground">
                  Access using your digital wallet or authenticate without
                  typing a password.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <AuthButton
                variant="outline"
                leftIcon={<Fingerprint className="size-5" />}
              >
                Secure Digital Signature
              </AuthButton>
              <p className="text-xs text-muted-foreground text-center">
                Use registered biometrics or your hardware key
              </p>
            </div>

            <AuthDivider text="Or connect with" />

            <AuthButton
              variant="outline"
              leftIcon={<Wallet className="size-5" />}
            >
              Connect Wallet
            </AuthButton>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Web3 Ethereum
            </p>
          </AuthCard>
        </div>

        {/* Create Account Link */}
        <AuthCardFooter className="mt-8">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link
            href="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            Create an Agent Account
          </Link>
        </AuthCardFooter>

        {/* Footer Links */}
        <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">
            Release Notes
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Cookie Settings
          </Link>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default LoginPage;
