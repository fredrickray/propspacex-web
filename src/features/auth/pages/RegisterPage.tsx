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
import { signupSchema, type SignupFormData } from "../validations";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      appRole: "buyer",
    },
  });

  const userType = watch("appRole");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);

    try {
      const response = await api.signup(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.appRole,
      );

      toast({
        title: "Account created!",
        description:
          response.message || "Please check your email for verification code.",
      });

      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError("root", { message });
      console.log("Signup error:", err);
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletAuth = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask (or another Ethereum wallet).",
        variant: "destructive",
      });
      return;
    }

    setIsWalletLoading(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const walletAddress = accounts?.[0];
      if (!walletAddress) throw new Error("No wallet account selected");

      const nonceRes = await api.requestWeb3Nonce(walletAddress, userType);
      const messageToSign = nonceRes.nonce;
      if (!messageToSign) throw new Error("Failed to get nonce message");

      const signature = (await window.ethereum.request({
        method: "personal_sign",
        params: [messageToSign, walletAddress],
      })) as string;

      const { user } = await api.verifyWeb3Signature(
        walletAddress,
        signature,
        messageToSign,
      );

      toast({
        title: "Wallet authenticated",
        description: "Welcome to PropSpace X.",
      });

      if (user.appRole === "admin") router.push("/admin");
      else if (user.appRole === "agent") router.push("/agent");
      else router.push("/buyer");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wallet authentication failed";
      toast({
        title: "Wallet auth failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsWalletLoading(false);
    }
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {errors.root.message}
                </div>
              )}

              <UserTypeToggle
                value={userType}
                onChange={(value) => {
                  console.log("Selected role:", value);
                  setValue("appRole", value, { shouldValidate: true });
                }}
              />

              <AuthInput
                label="First Name"
                type="text"
                placeholder="John"
                {...register("firstName")}
                error={errors.firstName?.message}
                disabled={isLoading}
              />

              <AuthInput
                label="Last Name"
                type="text"
                placeholder="Doe"
                {...register("lastName")}
                error={errors.lastName?.message}
                disabled={isLoading}
              />

              <AuthInput
                label="Professional Email"
                type="email"
                placeholder="john@enterprise.com"
                {...register("email")}
                error={errors.email?.message}
                disabled={isLoading}
              />

              <AuthInput
                label="Password"
                type="password"
                placeholder="************"
                {...register("password")}
                error={errors.password?.message}
                disabled={isLoading}
              />

              <AuthButton type="submit" isLoading={isLoading}>
                Create Account
              </AuthButton>
            </form>

            <AuthDivider text="Or" />

            <AuthButton
              variant="outline"
              leftIcon={<Wallet className="size-5" />}
              onClick={handleWalletAuth}
              isLoading={isWalletLoading}
              disabled={isLoading}
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
