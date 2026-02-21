"use client";

import { Home, Heart, Calendar, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StatCard from "../components/StatCard";
import PropertyGridCard from "../components/PropertyGridCard";

const savedProperties = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    price: "$1,250,000",
    title: "Modern Villa with Pool",
    location: "4521 Beverly Hills Dr, Los Angeles",
    beds: 4,
    baths: 3,
    sqft: "3,400 sqft",
    isFavorited: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    price: "$850,000",
    title: "Miami Beach House",
    location: "1200 Main St, Apt 18, New York",
    beds: 3,
    baths: 2,
    sqft: "1,950 sqft",
    isFavorited: true,
  },
];

const savedSearches = [
  { name: "Downtown Condos", location: "New York, NY", matches: 24 },
  { name: "Miami Beach House", location: "Miami, FL", matches: 12 },
];

const recentlyViewed = [
  { price: "$650,000", location: "Miami Beach, FL" },
  { price: "$425,000", location: "Downtown Chicago, IL" },
];

const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, Alex
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your real estate activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-2 px-3">
            <Wallet className="size-4" />
            0xF7C...9b2 Connected
          </Badge>
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Home}
          value={5}
          label="New Matches"
          iconColor="text-primary"
        />
        <StatCard
          icon={Heart}
          value={12}
          label="Saved Homes"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={Calendar}
          value={2}
          label="Scheduled Viewings"
          iconColor="text-primary"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Properties */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Saved Properties
            </h2>
            <Button variant="link" asChild>
              <Link href="/buyer/favorites">
                View All <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedProperties.map((property) => (
              <PropertyGridCard key={property.id} {...property} />
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Saved Searches */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Saved Searches</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {savedSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {search.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {search.location}
                    </p>
                  </div>
                  <Badge variant="secondary">{search.matches}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recently Viewed</h3>
              <Button variant="link" size="sm">
                View History
              </Button>
            </div>
            <div className="space-y-3">
              {recentlyViewed.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
