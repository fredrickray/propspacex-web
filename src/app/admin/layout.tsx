import type { Metadata } from "next";
import { AdminLayout } from "@/features/admin";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin | PropSpace X",
    default: "Dashboard | Admin | PropSpace X",
  },
  description: "PropSpace X administration panel.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
