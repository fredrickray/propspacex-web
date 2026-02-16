import type { Metadata } from "next";
import { SettingsPage } from "@/features/admin/pages/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
};

export default function Page() {
  return <SettingsPage />;
}
