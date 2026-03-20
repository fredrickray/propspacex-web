"use client";

import { useState } from "react";
import { usePropertyCreation } from "../context/PropertyCreationContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Navigation, Plus, ShieldCheck, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";
import { useToast } from "@/hooks/use-toast";

const defaultNeighborhoodTags = ["Schools", "Transit", "Parks", "Shopping"];

const AddPropertyLocationPage = () => {
  const router = useRouter();
  const { property, setProperty } = usePropertyCreation();
  const { toast } = useToast();
  // Address fields
  const [address, setAddress] = useState(property.location?.address ?? "");
  const [unit, setUnit] = useState(property.location?.unit ?? "");
  const [city, setCity] = useState(property.location?.city ?? "");
  const [stateVal, setStateVal] = useState(
    property.location?.state ?? "california",
  );
  const [zip, setZip] = useState(property.location?.zip ?? "");
  const [country, setCountry] = useState(property.location?.country ?? "us");
  // Coordinates (not editable in UI, but could be added)
  const [coordinates] = useState<[number, number]>(
    property.location?.coordinates?.coordinates ?? [0, 0],
  );
  // Neighborhood
  const [neighborhoodDescription, setNeighborhoodDescription] = useState(
    property.location?.neighborhoodHighlights?.description ?? "",
  );
  const [tags, setTags] = useState(
    property.location?.neighborhoodHighlights?.tags ?? defaultNeighborhoodTags,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    property.location?.neighborhoodHighlights?.tags ?? ["Schools", "Transit"],
  );
  const [newTag, setNewTag] = useState("");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    if (!tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
    }
    setSelectedTags((prev) =>
      prev.includes(trimmedTag) ? prev : [...prev, trimmedTag],
    );
    setNewTag("");
  };

  const handleAddTagByEnter = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleNext = () => {
    setProperty({
      location: {
        address,
        unit,
        city,
        state: stateVal,
        zip,
        country,
        coordinates: { type: "Point", coordinates },
        neighborhoodHighlights: {
          description: neighborhoodDescription,
          tags: selectedTags,
        },
      },
    });
    router.push("/agent/add-property/details");
  };

  const handleSaveDraft = () => {
    localStorage.setItem("agent_add_property_draft", JSON.stringify(property));
    toast({
      title: "Draft saved",
      description: "Location details saved to your draft.",
    });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <AddPropertyStepHeader
        title="Add New Property"
        description="Enter property location and neighborhood details."
        step={2}
        totalSteps={6}
        stepLabel="Location Details"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="font-semibold flex items-center gap-2 text-sm">
                <Search className="size-4 text-primary" /> Quick Address Search
              </div>
              <Input
                placeholder="Search for an address to auto-fill (e.g. 123 Main St)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Selecting an address updates map pin placement automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Property Address</h3>
                <button className="text-xs text-primary" type="button">
                  Clear all fields
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="1234 Innovation Blvd"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit / Suite (Optional)</Label>
                  <Input
                    id="unit"
                    placeholder="Apt 4B"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Select value={stateVal} onValueChange={setStateVal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="california">California</SelectItem>
                      <SelectItem value="new-york">New York</SelectItem>
                      <SelectItem value="texas">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip / Postal Code</Label>
                  <Input
                    id="zip"
                    placeholder="94103"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uae">United Arab Emirates</SelectItem>
                    <SelectItem value="ng">Nigeria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold">Neighborhood Highlights</h3>
              <div className="space-y-2">
                <Label htmlFor="highlights">Description & Amenities</Label>
                <Textarea
                  id="highlights"
                  placeholder="Describe nearby schools, parks, transit, and other location benefits..."
                  className="min-h-24"
                  value={neighborhoodDescription}
                  onChange={(e) => setNeighborhoodDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                  onKeyDown={handleAddTagByEnter}
                  placeholder="Add custom neighborhood tag"
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1"
                  onClick={handleAddTag}
                >
                  <Plus className="size-3" /> Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                    >
                      <Badge
                        variant={isSelected ? "default" : "secondary"}
                        className="cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Pin Placement</h3>
              <div className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <Navigation className="size-3" /> GPS Active
              </div>
            </div>
            <div className="rounded-lg overflow-hidden border border-border h-72">
              <img
                src="https://maps.googleapis.com/maps/api/staticmap?center=San+Francisco,CA&zoom=11&size=600x400&maptype=roadmap&markers=color:blue%7CSan+Francisco,CA"
                alt="Map preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-primary" />
              Location verification is enabled for better listing confidence.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/agent/add-property")}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={handleNext}>Save & Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyLocationPage;
