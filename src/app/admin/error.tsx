"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-2 text-xl font-bold text-foreground">Admin Error</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Something went wrong in the admin panel.
        </p>
        <Button onClick={reset} size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
