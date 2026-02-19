import type { Metadata } from "next";
import { PropertyModerationPage } from "@/features/admin";

export const metadata: Metadata = {
  title: "Property Moderation",
};

export default function Page() {
  return <PropertyModerationPage />;
}
