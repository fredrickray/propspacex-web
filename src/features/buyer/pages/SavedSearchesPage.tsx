"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import SavedSearchCard from "../components/SavedSearchCard";
import { useCommunications } from "@/features/communications/communications-context";

function formatCreated(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

const SavedSearchesPage = () => {
  const router = useRouter();
  const { savedSearches, addSavedSearch, deleteSavedSearch, updateSavedSearch } = useCommunications();
  const [listFilter, setListFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [filtersRaw, setFiltersRaw] = useState("2+ beds, Pool");
  const [alerts, setAlerts] = useState(true);

  const listFiltered = useMemo(() => {
    const q = listFilter.trim().toLowerCase();
    if (!q) return savedSearches;
    return savedSearches.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.filters.some((f) => f.toLowerCase().includes(q)),
    );
  }, [savedSearches, listFilter]);

  const create = () => {
    const filters = filtersRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!name.trim() || !location.trim()) return;
    addSavedSearch({
      name: name.trim(),
      location: location.trim(),
      filters: filters.length ? filters : ["Any"],
      alertsEnabled: alerts,
    });
    setOpen(false);
    setName("");
    setLocation("");
    setFiltersRaw("2+ beds, Pool");
    setAlerts(true);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-4 text-sm text-muted-foreground">
        Home / My account / <span className="text-foreground">Saved searches</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved searches</h1>
          <p className="text-muted-foreground">
            Stored on this device until the API syncs saved searches to your profile.
          </p>
        </div>
        <Button type="button" onClick={() => setOpen(true)}>
          <Plus className="mr-2 size-4" /> Create search
        </Button>
      </div>

      <div className="relative mb-6 max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter list…"
          className="pl-10"
          value={listFilter}
          onChange={(e) => setListFilter(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {savedSearches.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No saved searches yet. Create one to jump back into property search with context.
          </p>
        ) : listFiltered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No matches for your filter.
          </p>
        ) : (
          listFiltered.map((search) => (
            <SavedSearchCard
              key={search.id}
              id={search.id}
              name={search.name}
              location={search.location}
              filters={search.filters}
              matchCount={0}
              alertsEnabled={search.alertsEnabled}
              lastUpdated={formatCreated(search.createdAtIso)}
              onRun={() =>
                router.push(
                  `/buyer/search?q=${encodeURIComponent(`${search.name} ${search.location}`)}`,
                )
              }
              onDelete={() => deleteSavedSearch(search.id)}
              onToggleAlerts={() =>
                updateSavedSearch(search.id, { alertsEnabled: !search.alertsEnabled })
              }
            />
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New saved search</DialogTitle>
            <DialogDescription>
              Runs open the search page with your terms in the query bar (demo wiring).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="ss-name">Name</Label>
              <Input id="ss-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Downtown lofts" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-loc">Location</Label>
              <Input id="ss-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ss-filters">Filters (comma-separated)</Label>
              <Input
                id="ss-filters"
                value={filtersRaw}
                onChange={(e) => setFiltersRaw(e.target.value)}
                placeholder="2+ beds, Waterfront"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label htmlFor="ss-alerts">Email alerts</Label>
              <Switch id="ss-alerts" checked={alerts} onCheckedChange={setAlerts} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={create} disabled={!name.trim() || !location.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Prefer map-based search?{" "}
        <Link href="/buyer/search" className="text-primary underline">
          Open property search
        </Link>
        .
      </p>
    </div>
  );
};

export default SavedSearchesPage;
