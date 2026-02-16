import type { Metadata } from "next";
import SavedSearchesPage from "@/features/buyer/pages/SavedSearchesPage";

export const metadata: Metadata = {
  title: "Saved Searches",
};

export default function Page() {
  return <SavedSearchesPage />;
}
