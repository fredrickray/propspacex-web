"use client";

import { useState } from "react";
import {
  Search,
  Grid,
  List,
  BookmarkPlus,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertyFilters from "../components/PropertyFilters";
import PropertyGridCard from "../components/PropertyGridCard";

const properties = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    price: "$2,500,000",
    title: "Luxury Penthouse Downtown",
    location: "123 Broadway Ave, New York, NY",
    beds: 3,
    baths: 2,
    sqft: "2,100",
    badge: "For Sale",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    price: "$850,000",
    title: "Modern Family Home",
    location: "45 Park Ave, Queens, NY",
    beds: 4,
    baths: 2,
    sqft: "2,950",
    badge: "For Sale",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    price: "$1,200,000",
    title: "Sunny Loft in Brooklyn",
    location: "88 Williamsburg St, Brooklyn, NY",
    beds: 2,
    baths: 1,
    sqft: "1,450",
    badge: "For Sale",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    price: "$450,000",
    title: "Studio near Central Park",
    location: "5 Central Park West, NY",
    beds: 0,
    baths: 1,
    sqft: "650",
    badge: "For Sale",
    isPending: true,
  },
];

const PropertySearchPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        Home &gt; Search &gt;{" "}
        <span className="text-foreground">New York, NY</span>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <PropertyFilters />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Properties for Sale
              </h1>
              <p className="text-muted-foreground">124 properties found</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <BookmarkPlus className="size-4 mr-2" /> Save Search
              </Button>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <Button variant="outline" className="lg:hidden mb-4 w-full">
            <SlidersHorizontal className="size-4 mr-2" /> Filters
          </Button>

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyGridCard key={property.id} {...property} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline">Load More Properties</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearchPage;
