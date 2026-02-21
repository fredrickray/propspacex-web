"use client";

import { useState } from "react";
import {
  Plus,
  Filter,
  Heart,
  Building,
  TrendingUp,
  Hammer,
  BarChart3,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PropertyGridCard from "../components/PropertyGridCard";

const collections = [
  {
    id: "all",
    label: "All Saved Properties",
    icon: Heart,
    count: 24,
    color: "text-red-500",
  },
  { id: "dream", label: "Dream Homes", icon: Building, count: 8 },
  {
    id: "investment",
    label: "Commercial Investments",
    icon: TrendingUp,
    count: 5,
  },
  { id: "renovation", label: "Renovation Projects", icon: Hammer, count: 3 },
];

const tools = [
  { id: "analytics", label: "Market Analytics", icon: BarChart3 },
  { id: "comparison", label: "Comparison Table", icon: Table },
];

const properties = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    price: "$1,250,000",
    title: "The Grand Residence",
    location: "Downtown District, Metropolis",
    beds: 4,
    baths: 3,
    sqft: "1,900",
    isFavorited: true,
    badge: "Recommended",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    price: "$3,500,000",
    title: "Skyview Penthouse",
    location: "Marina Bay, Coastal City",
    beds: 5,
    baths: 4,
    sqft: "3,200",
    isFavorited: true,
    isNew: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    price: "$850,000",
    title: "Urban Loft",
    location: "Arts District, City Center",
    beds: 2,
    baths: 2,
    sqft: "1,100",
    isFavorited: true,
    isPending: true,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    price: "$620,000",
    title: "Maple Ave Family Home",
    location: "Suburban Heights, Northside",
    beds: 4,
    baths: 2,
    sqft: "2,100",
    isFavorited: true,
    badge: "Ready for Resale",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    price: "$250,000",
    title: "Historic Cottage",
    location: "Old Town, Heritage District",
    beds: 2,
    baths: 1,
    sqft: "950",
    isFavorited: true,
    badge: "Price Drop",
  },
];

const SavedPropertiesPage = () => {
  const [activeCollection, setActiveCollection] = useState("all");

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-border p-4 space-y-6 hidden lg:block">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Collections
          </h3>
          <div className="space-y-1">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCollection === collection.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  <collection.icon
                    className={`size-4 ${collection.color || ""}`}
                  />
                  {collection.label}
                </span>
                <Badge
                  variant={
                    activeCollection === collection.id ? "secondary" : "outline"
                  }
                  className="text-xs"
                >
                  {collection.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Tools
          </h3>
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <tool.icon className="size-4" />
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Saved Properties
            </h1>
            <p className="text-muted-foreground">
              Manage your potential investments and collections.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="size-4 mr-2" /> Filters
            </Button>
            <Button>
              <Plus className="size-4 mr-2" /> Create Collection
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Filter by address, price, or keyword..."
            className="max-w-md"
          />
          <Select defaultValue="newest">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((property) => (
            <PropertyGridCard key={property.id} {...property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedPropertiesPage;
