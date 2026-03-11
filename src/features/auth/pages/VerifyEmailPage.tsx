"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, RefreshCw, HelpCircle, Shield, Lock } from "lucide-react";
import {
  AuthLayout,
  AuthCard,
  AuthCardHeader,
  AuthButton,
  AuthFooter,
} from "../components";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { verifyOtpSchema, type VerifyOtpFormData } from "../validations";

const VerifyEmailPage = () => {
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = searchParams.get("email") ?? "";

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onSubmit = async (data: VerifyOtpFormData) => {
    setIsLoading(true);
    try {
      console.log("Verifying OTP for email:", email, "with code:", data.otp);
      await api.verify_otp(email, data.otp);
      toast({
        title: "Email verified!",
        description: "Your account has been verified. You can now log in.",
      });
      router.push("/auth/login");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.";
      setError("otp", { message });
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await api.resend_otp(email);
      setCooldown(60);
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend code.";
      toast({
        title: "Resend failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
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
            description="We've sent a 6-digit verification code to your inbox. Enter it below to confirm your account."
          />

          {/* Email Display */}
          <div className="bg-muted rounded-lg px-4 py-3 text-center mb-6">
            <span className="text-foreground font-medium">{email}</span>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input */}
            <div className="flex flex-col items-center gap-2">
              <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp.message}</p>
              )}
            </div>

            {/* Verify Button */}
            <AuthButton type="submit" isLoading={isSubmitting}>
              Verify Email
            </AuthButton>
          </form>

          {/* Resend Code */}
          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
            >
              <RefreshCw
                className={`size-4 ${isResending ? "animate-spin" : ""}`}
              />
              {cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend verification code"}
            </button>
          </div>

          {/* Hint */}
          <p className="text-sm text-muted-foreground text-center mt-2">
            Don&apos;t see it? Check your spam folder.
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
              <span className="text-sm">Secure Verification</span>
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
