import type { Metadata } from "next";
import SavedPropertiesPage from "@/features/buyer/pages/SavedPropertiesPage";

export const metadata: Metadata = {
  title: "Saved Properties",
};

export default function Page() {
  return <SavedPropertiesPage />;
}
