"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

type VerificationRow = {
  id: string;
  kind: string;
  status: string;
  title: string;
  detail: string;
  email: string;
  propertyId: string;
  createdAt: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseRows(data: unknown): VerificationRow[] {
  if (!data || typeof data !== "object") return [];
  const list = (data as { verifications?: unknown }).verifications;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = text(row.id) || `row-${index}`;
    return [
      {
        id,
        kind: text(row.kind) || "audit",
        status: text(row.status) || "recorded",
        title: text(row.title) || "Verification",
        detail: text(row.detail),
        email: text(row.email),
        propertyId: text(row.propertyId),
        createdAt: text(row.createdAt),
      },
    ];
  });
}

function formatWhen(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function kindLabel(kind: string) {
  if (kind === "identity") return "Account";
  if (kind === "document") return "Document";
  return "Audit";
}

export function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [kind, setKind] = useState("all");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = parseRows(await api.getVerifications(1, 50));
        if (!cancelled) setRows(next);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load verifications.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => (kind === "all" ? rows : rows.filter((row) => row.kind === kind)),
    [kind, rows],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verifications</h1>
          <p className="text-sm text-muted-foreground">
            Unverified accounts, pending property documents, and recent audit events.
          </p>
        </div>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="identity">Accounts</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="audit">Audit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading the queue
          </p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{error}</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nothing is waiting in this queue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Item
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground md:table-cell">
                    Kind
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground lg:table-cell">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={`${row.kind}-${row.id}`} className="border-b border-border">
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{row.title}</p>
                      {row.detail ? (
                        <p className="text-xs text-muted-foreground">{row.detail}</p>
                      ) : null}
                      {row.email ? (
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      ) : null}
                      {row.propertyId ? (
                        <Link
                          href={`/properties/${row.propertyId}`}
                          className="text-xs font-medium text-primary"
                        >
                          Open listing
                        </Link>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-4 md:table-cell">
                      <Badge variant="outline">{kindLabel(row.kind)}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm capitalize">{row.status}</span>
                    </td>
                    <td className="hidden px-4 py-4 text-sm text-muted-foreground lg:table-cell">
                      {formatWhen(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
