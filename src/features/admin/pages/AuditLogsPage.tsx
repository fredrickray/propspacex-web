"use client";

export function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Verifications</h1>
        <p className="text-sm text-muted-foreground">
          Identity checks, document reviews, and audit events.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="text-sm text-muted-foreground">
          This queue is empty because the API has no verifications or audit-log
          route yet. Listing review stays on the properties screen.
        </p>
      </div>
    </div>
  );
}
