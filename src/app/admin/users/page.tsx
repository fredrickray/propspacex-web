import type { Metadata } from "next";
import { UserManagementPage } from "@/features/admin";

export const metadata: Metadata = {
  title: "User Management",
};

export default function Page() {
  return <UserManagementPage />;
}
