"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowLeft } from "lucide-react";
import { AuthLayout, AuthInput, AuthButton, PasswordStrength } from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function passwordRuleError(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least 1 uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least 1 lowercase letter";
  }
  if (!/\d/.test(password)) return "Password must contain at least 1 number";
  return "";
}

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const ruleError = password ? passwordRuleError(password) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Open the reset link from your email to choose a new password.");
      return;
    }
    const rule = passwordRuleError(password);
    if (rule) {
      setError(rule);
      return;
    }
    if (password !== confirmPassword) return;
    setIsLoading(true);
    try {
      const response = await api.resetPassword(token, password);
      toast({
        title: "Password updated",
        description: response.message || "You can sign in with your new password.",
      });
      router.push("/auth/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update your password.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout showHeader={false}>
      <div className="grid min-h-dvh md:grid-cols-2">
        <aside className="hidden flex-col justify-between bg-primary px-10 py-8 text-primary-foreground md:flex">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
            <Shield className="size-5" />
            PropSpace X
          </Link>
          <div className="max-w-sm space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Choose a new password
              </h1>
              <p className="text-sm leading-6 text-primary-foreground/80">
                This replaces the password on your PropSpace X account. The
                checklist updates as you type.
              </p>
            </div>
            <PasswordStrength password={password} tone="inverse" showHeading={false} />
          </div>
          <p className="text-sm text-primary-foreground/70">© 2026 PropSpace X</p>
        </aside>

        <div className="flex min-h-dvh flex-col bg-background">
          <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-8">
            <Link href="/" className="md:hidden">
              <PropSpaceLogo className="h-9 w-auto" />
            </Link>
            <Link
              href="/auth/login"
              className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
          </header>

          <div className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-8">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
              <div className="space-y-1 md:hidden">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Choose a new password
                </h1>
                <p className="text-sm text-muted-foreground">
                  At least 8 characters, with an uppercase letter, a lowercase
                  letter, and a number.
                </p>
              </div>

              {!token ? (
                <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  Open the reset link from your email to choose a new password.
                </p>
              ) : null}

              <AuthInput
                label="New password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              <AuthInput
                label="Confirm password"
                type="password"
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={
                  confirmPassword && password !== confirmPassword
                    ? "Passwords do not match"
                    : undefined
                }
              />

              <div className="md:hidden">
                <PasswordStrength password={password} columns={2} />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <AuthButton
                type="submit"
                isLoading={isLoading}
                disabled={
                  !token ||
                  !password ||
                  password !== confirmPassword ||
                  Boolean(ruleError)
                }
              >
                Update password
              </AuthButton>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
