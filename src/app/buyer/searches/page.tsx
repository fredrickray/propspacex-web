import type { Metadata } from "next";
import { SavedSearchesPage } from "@/features/buyer";

export const metadata: Metadata = {
  title: "Saved Searches",
};

export default function Page() {
  return <SavedSearchesPage />;
}
