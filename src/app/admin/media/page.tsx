import type { Metadata } from "next";
import { MediaOversightPage } from "@/features/admin";

export const metadata: Metadata = {
  title: "Media Oversight",
};

export default function Page() {
  return <MediaOversightPage />;
}
