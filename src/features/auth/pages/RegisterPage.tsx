"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Check, Wallet, AlertCircle } from "lucide-react";
import {
  AuthLayout,
  AuthCard,
  AuthInput,
  AuthButton,
  AuthDivider,
  AuthFooter,
  UserTypeToggle,
} from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

const RegisterPage = () => {
  const [userType, setUserType] = useState<"buyer" | "agent">("buyer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
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
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-2 min-h-[calc(100vh-64px)]">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center py-12 px-4 lg:px-8">
          <AuthCard className="max-w-md w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Create Account
              </h1>
              <p className="text-muted-foreground">
                The future of real estate, secured by blockchain.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <UserTypeToggle value={userType} onChange={setUserType} />

              <AuthInput
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <AuthInput
                label="Professional Email"
                type="email"
                placeholder="john@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <AuthInput
                label="Secure Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <AuthButton type="submit" isLoading={isLoading}>
                Create Account
              </AuthButton>
            </form>

            <AuthDivider text="Or" />

            <AuthButton
              variant="outline"
              leftIcon={<Wallet className="size-5" />}
            >
              Continue with Wallet
            </AuthButton>

            {/* Wallet Info */}
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    Connecting your wallet ensures identity verification only.
                  </p>
                  <p>
                    Web3 password can be set after a single connection. Access
                    to property assets require verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline"
              >
                Log In
              </Link>
            </div>
          </AuthCard>
        </div>

        {/* Right Side - Features */}
        <div className="hidden lg:flex bg-gradient-to-br from-primary to-blue-900 items-center justify-center p-12">
          <div className="max-w-md text-white">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Shield className="size-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              Institutional Real Estate Platform
            </h2>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="size-5 text-green-400" />
                <span>Immutable asset ownership</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-green-400" />
                <span>Smart contract legal framework</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-green-400" />
                <span>Instant cross-border settlement</span>
              </li>
            </ul>

            {/* Testimonial Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <p className="text-sm mb-4 italic">
                "PropSpace X has completely transformed how we handle high-value
                real estate transactions, reducing closing time from months to
                days."
              </p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-white/20" />
                <div>
                  <p className="font-semibold">Marcus Thrane</p>
                  <p className="text-xs text-white/70">CEO, Thrane Capital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default RegisterPage;
