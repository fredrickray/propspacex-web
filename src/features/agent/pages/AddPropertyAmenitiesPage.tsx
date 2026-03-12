"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";

const comfortAmenities = [
  "Central A/C",
  "Heating",
  "Double Glazed Windows",
  "Waste Disposal",
  "Service Elevators",
];

const lifestyleAmenities = [
  "Private Pool",
  "Shared Gym",
  "Spa",
  "Concierge Service",
  "Barbecue Area",
  "Children's Play Area",
];

const securityAmenities = [
  "CCTV",
  "24/7 Security",
  "Smart Door Lock",
  "Fire Alarm",
];

const AddPropertyAmenitiesPage = () => {
  const router = useRouter();

  return (
    <div className="max-w-6xl space-y-6">
      <AddPropertyStepHeader
        title="Property Amenities"
        description="Select all features that apply to improve search visibility."
        step={4}
        totalSteps={6}
        stepLabel="Amenities"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <div className="space-y-4">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search for an amenity (e.g. Pool, Gym)..."
            />
          </div>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Comfort & Cooling</h3>
                <button className="text-xs text-primary" type="button">
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {comfortAmenities.map((amenity, index) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Checkbox defaultChecked={index === 0 || index === 2} />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Lifestyle & Recreation</h3>
                <span className="text-xs text-muted-foreground">
                  3 Selected
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {lifestyleAmenities.map((amenity, index) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Checkbox defaultChecked={index < 3} />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {securityAmenities.map((amenity, index) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <Checkbox defaultChecked={index < 2} />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="rounded-lg overflow-hidden border border-border h-44">
                <img
                  src="https://images.unsplash.com/photo-1494526585095-c41746248156?w=800"
                  alt="Live preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">Luxury Penthouse in Downtown</p>
                <p className="text-xs text-muted-foreground">
                  4 Beds • 5 Baths • 3,200 sqft
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Amenities Added</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Central A/C</Badge>
                  <Badge variant="secondary">Private Pool</Badge>
                  <Badge variant="secondary">Shared Gym</Badge>
                  <Badge variant="secondary">CCTV</Badge>
                </div>
              </div>
              <div className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-primary" />
                Blockchain verification enabled for this listing.
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Pro Tip: Listings with at least 5 amenities have higher lead rates.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/agent/add-property/details")}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button onClick={() => router.push("/agent/add-property/media")}>
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyAmenitiesPage;
