import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | PropSpace X",
    default: "Authentication | PropSpace X",
  },
  description: "Sign in or create your PropSpace X account.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
