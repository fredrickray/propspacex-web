"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { api, AppRole } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginFormData } from "../validations";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { user } = await api.signin(data.email, data.password);

      toast({
        title: "Welcome back!",
        description: `Signed in as ${user.email}`,
      });

      // Role-based redirect
      if (user.appRole === AppRole.Buyer) {
        router.push("/buyer");
      } else if (user.appRole === AppRole.Agent) {
        router.push("/agent");
      } else if (user.appRole === AppRole.Admin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.log("Error logging in:", err);
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError("root", { message });
      toast({
        title: "Sign in failed",
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

      const nonceRes = await api.requestWeb3Nonce(walletAddress);
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
        title: "Wallet connected",
        description: `Signed in as ${user.email ?? walletAddress}`,
      });

      if (user.appRole === AppRole.Buyer) router.push("/buyer");
      else if (user.appRole === AppRole.Agent) router.push("/agent");
      else if (user.appRole === AppRole.Admin) router.push("/admin");
      else router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wallet sign-in failed";
      toast({
        title: "Wallet sign-in failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsWalletLoading(false);
    }
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {errors.root.message}
                </div>
              )}

              <AuthInput
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                {...register("email")}
                error={errors.email?.message}
                rightElement={<Mail className="size-5 text-muted-foreground" />}
                disabled={isLoading}
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
                  {...register("password")}
                  error={errors.password?.message}
                  disabled={isLoading}
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
              onClick={handleWalletAuth}
              isLoading={isWalletLoading}
              disabled={isLoading}
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
