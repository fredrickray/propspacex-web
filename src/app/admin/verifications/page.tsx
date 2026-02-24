import type { Metadata } from "next";
import { AuditLogsPage } from "@/features/admin/pages/AuditLogsPage";

export const metadata: Metadata = {
  title: "Audit & Verifications",
};

export default function Page() {
  return <AuditLogsPage />;
}
