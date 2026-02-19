import type { Metadata } from "next";
import { SavedPropertiesPage } from "@/features/buyer";

export const metadata: Metadata = {
  title: "Saved Properties",
};

export default function Page() {
  return <SavedPropertiesPage />;
}
