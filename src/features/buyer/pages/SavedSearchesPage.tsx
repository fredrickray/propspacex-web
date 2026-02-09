import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SavedSearchCard from "../components/SavedSearchCard";

const savedSearches = [
  {
    id: "1",
    name: "Miami Beach Investment Props",
    location: "Miami, FL",
    filters: ["2+ beds", "$1M-$3M", "Waterfront"],
    matchCount: 24,
    alertsEnabled: true,
    lastUpdated: "Date Created (Newest)",
  },
  {
    id: "2",
    name: "Downtown 2-Bed Condos",
    location: "New York, NY",
    filters: ["2 Beds", "$500k-$750k"],
    matchCount: 18,
    alertsEnabled: false,
    lastUpdated: "2 days ago",
  },
  {
    id: "3",
    name: "Suburban Family Homes",
    location: "Los Angeles, CA",
    filters: ["4+ Beds", "Backyard", "Pool"],
    matchCount: 12,
    alertsEnabled: true,
    lastUpdated: "1 week ago",
  },
];

const SavedSearchesPage = () => {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        Home &gt; My Account &gt; <span className="text-foreground">Saved Searches</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Saved Searches</h1>
          <p className="text-muted-foreground">Manage your property alerts and search history.</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" /> Create New Search
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search saved items..." className="pl-10" />
        </div>
        <Select defaultValue="newest">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date Created (Newest)</SelectItem>
            <SelectItem value="oldest">Date Created (Oldest)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="matches">Most Matches</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {savedSearches.map((search) => (
          <SavedSearchCard key={search.id} {...search} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button variant="outline" size="icon" disabled>
          &lt;
        </Button>
        <Button variant="default" size="icon">1</Button>
        <Button variant="outline" size="icon">2</Button>
        <Button variant="outline" size="icon">3</Button>
        <Button variant="outline" size="icon">...</Button>
        <Button variant="outline" size="icon">&gt;</Button>
      </div>
    </div>
  );
};

export default SavedSearchesPage;
