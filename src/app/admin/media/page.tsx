import type { Metadata } from "next";
import { MediaOversightPage } from "@/features/admin/pages/MediaOversightPage";

export const metadata: Metadata = {
  title: "Media Oversight",
};

export default function Page() {
  return <MediaOversightPage />;
}
