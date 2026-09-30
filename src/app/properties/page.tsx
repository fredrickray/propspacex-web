import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import PropertySearchPage from "@/features/buyer/pages/PropertySearchPage";

export const metadata: Metadata = {
  title: "Browse properties",
  description:
    "Search verified real estate listings on PropSpace X without an account.",
};

function SearchFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-hidden />
      Loading listings…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <PropertySearchPage detailBasePath="/properties" publicCatalog />
    </Suspense>
  );
}
