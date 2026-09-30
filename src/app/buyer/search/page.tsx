import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import PropertySearchPage from "@/features/buyer/pages/PropertySearchPage";

export const metadata: Metadata = {
  title: "Search Properties",
  description:
    "Search and filter verified real estate listings on PropSpace X.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden />
          Loading listings…
        </div>
      }
    >
      <PropertySearchPage />
    </Suspense>
  );
}
