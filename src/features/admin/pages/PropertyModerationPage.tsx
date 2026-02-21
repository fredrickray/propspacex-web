"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  Bed,
  Bath,
  Square,
  Calendar,
  Car,
  Sofa,
  Star,
  X,
  Check,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const queueProperties = [
  {
    id: 1,
    title: "Luxury Villa in Palm Jumeirah",
    price: "$5,200,000",
    status: "pending",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
  },
  {
    id: 2,
    title: "Downtown Luxury Apartment",
    price: "$1,800,000",
    status: "pending",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
  },
  {
    id: 3,
    title: "Seaside Cottage Retreat",
    price: "$890,000",
    status: "pending",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
  },
  {
    id: 4,
    title: "Commercial Office Space",
    price: "$3,500,000",
    status: "pending",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
  },
];

const selectedProperty = {
  id: 1,
  title: "Luxury Villa in Palm Jumeirah",
  location: "Palm Jumeirah, Front N, Dubai, UAE",
  price: "$5,200,000",
  status: "Pending Review",
  images: [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
  ],
  type: "Villa",
  beds: 6,
  baths: 8,
  sqft: "6,000",
  built: 2021,
  garage: 2,
  furnished: "Fully Furnished",
  agent: {
    name: "John Doe",
    company: "Prime Properties LLC",
    rating: 4.9,
    reviews: 52,
    avatar: "john",
  },
};

export function PropertyModerationPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            Home / Admin /{" "}
            <span className="text-foreground">Property Moderation</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              All Properties
            </Badge>
            <Badge variant="secondary">428</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Reviewing Listing #14557
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search Listings, ID..." className="pl-9" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="size-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {queueProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => setSelectedId(property.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedId === property.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Image
                  src={property.image}
                  alt={property.title}
                  className="size-16 rounded-lg object-cover"
                  width={64}
                  height={64}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {property.title}
                  </p>
                  <p className="text-primary font-semibold">{property.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="lg:col-span-8 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Back to Dashboard
              </span>
            </div>
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
              {selectedProperty.status}
            </Badge>
          </div>

          {/* Main Image Gallery */}
          <div className="p-4">
            <div className="flex flex-col items-end mb-2">
              <p className="text-2xl font-bold text-primary">
                {selectedProperty.price}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 md:col-span-3 h-64 md:h-80 rounded-lg overflow-hidden relative">
                <Image
                  src={selectedProperty.images[0]}
                  alt="Main"
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 75vw"
                />
              </div>
              <div className="hidden md:flex flex-col gap-2">
                {selectedProperty.images.slice(1).map((img, i) => (
                  <div
                    key={i}
                    className="h-[calc(50%-4px)] rounded-lg overflow-hidden relative"
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="object-cover"
                      fill
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold">{selectedProperty.title}</h2>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="size-4" />
                {selectedProperty.location}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 py-4 border-y border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Type</p>
                <p className="font-semibold">{selectedProperty.type}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Beds</p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  <Bed className="size-4" /> {selectedProperty.beds}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Baths</p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  <Bath className="size-4" /> {selectedProperty.baths}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Sq Ft</p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  <Square className="size-4" /> {selectedProperty.sqft}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">Built</p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  <Calendar className="size-4" /> {selectedProperty.built}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase">
                  Garage
                </p>
                <p className="font-semibold flex items-center justify-center gap-1">
                  <Car className="size-4" /> {selectedProperty.garage}
                </p>
              </div>
            </div>

            {/* Agent Info */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProperty.agent.avatar}`}
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedProperty.agent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProperty.agent.company}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {selectedProperty.agent.rating}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({selectedProperty.agent.reviews})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" className="gap-2">
                Escalate
              </Button>
              <div className="flex gap-2">
                <Button variant="destructive" className="gap-2">
                  <X className="size-4" />
                  Reject
                </Button>
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                  <Check className="size-4" />
                  Approve Listing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
