import type { Metadata } from "next";
import { AuditLogsPage } from "@/features/admin";

export const metadata: Metadata = {
  title: "Audit & Verifications",
};

export default function Page() {
  return <AuditLogsPage />;
}
