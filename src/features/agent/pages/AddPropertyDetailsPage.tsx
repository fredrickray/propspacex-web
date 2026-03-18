"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ArrowLeft,
  BedDouble,
  Bath,
  Car,
  Calendar,
  Building2,
  Waves,
  Trees,
  Home,
  Shield,
  Lightbulb,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";

const detailsFeatures = [
  { label: "Swimming Pool", icon: Waves },
  { label: "Garden", icon: Trees },
  { label: "Garage", icon: Home },
  { label: "Central A/C", icon: Lightbulb },
  { label: "Security System", icon: Shield },
  { label: "Gym", icon: Dumbbell },
];

const AddPropertyDetailsPage = () => {
  const router = useRouter();
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [parkingSpaces, setParkingSpaces] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Swimming Pool",
    "Central A/C",
  ]);

  const updateCounter = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
  ) => {
    setter((prev) => Math.max(0, prev + delta));
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((item) => item !== feature)
        : [...prev, feature],
    );
  };

  return (
    <div className="max-w-5xl space-y-6">
      <AddPropertyStepHeader
        title="Add Property"
        description="Specify key metrics and detailed features of the property."
        step={3}
        totalSteps={6}
        stepLabel="Property Details"
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Core Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <div className="h-10 rounded-md border border-border px-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCounter(setBedrooms, -1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="font-medium inline-flex items-center gap-2">
                    <BedDouble className="size-4 text-muted-foreground" />
                    {bedrooms}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCounter(setBedrooms, 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <div className="h-10 rounded-md border border-border px-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCounter(setBathrooms, -1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="font-medium inline-flex items-center gap-2">
                    <Bath className="size-4 text-muted-foreground" />
                    {bathrooms}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCounter(setBathrooms, 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Parking Spaces</Label>
                <div className="h-10 rounded-md border border-border px-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCounter(setParkingSpaces, -1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="font-medium inline-flex items-center gap-2">
                    <Car className="size-4 text-muted-foreground" />
                    {parkingSpaces}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateCounter(setParkingSpaces, 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Dimensions & Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Total Area (Sq Ft)</Label>
                <Input id="area" placeholder="e.g. 2,400" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot">Lot Size (Sq Ft)</Label>
                <Input id="lot" placeholder="e.g. 5,000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year Built</Label>
                <div className="relative">
                  <Calendar className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input id="year" placeholder="YYYY" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select defaultValue="single-family">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-family">
                      Single Family Home
                    </SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Key Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {detailsFeatures.map((feature) => (
                <button
                  key={feature.label}
                  type="button"
                  onClick={() => toggleFeature(feature.label)}
                  className={`h-10 px-3 rounded-md border text-sm flex items-center gap-2 ${
                    selectedFeatures.includes(feature.label)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <feature.icon className="size-4" />
                  {feature.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-description">Property Description</Label>
            <Textarea
              id="property-description"
              className="min-h-28"
              placeholder="Describe the home layout, unique advantages, and interior quality..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/agent/add-property/location")}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button onClick={() => router.push("/agent/add-property/amenities")}>
          Continue to Amenities
        </Button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center gap-2">
        <Building2 className="size-4" />
        Well-detailed listings convert significantly better with verified
        metrics and features.
      </div>
    </div>
  );
};

export default AddPropertyDetailsPage;
