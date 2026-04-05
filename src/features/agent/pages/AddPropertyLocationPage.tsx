"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { usePropertyCreation } from "../context/PropertyCreationContext";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Navigation,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";
import { useToast } from "@/hooks/use-toast";
import {
  searchPlaces,
  reverseGeocode,
  type GeocodeHit,
} from "@/lib/geocoding/nominatim";
import { isUnsetLngLat } from "../lib/property-location-utils";

const PropertyLocationMap = dynamic(
  () => import("../components/PropertyLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-72 w-full animate-pulse rounded-lg bg-muted"
        aria-hidden
      />
    ),
  },
);

const defaultNeighborhoodTags = ["Schools", "Transit", "Parks", "Shopping"];

function expandLegacyCountry(code: string): string {
  const m: Record<string, string> = {
    us: "United States",
    ng: "Nigeria",
    uae: "United Arab Emirates",
  };
  return m[code.toLowerCase()] ?? code;
}

const AddPropertyLocationPage = () => {
  const router = useRouter();
  const { property, setProperty } = usePropertyCreation();
  const { toast } = useToast();

  const [quickQuery, setQuickQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeHit[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [address, setAddress] = useState(property.location?.address ?? "");
  const [unit, setUnit] = useState(property.location?.unit ?? "");
  const [city, setCity] = useState(property.location?.city ?? "");
  const [stateVal, setStateVal] = useState(property.location?.state ?? "");
  const [zip, setZip] = useState(property.location?.zip ?? "");
  const [country, setCountry] = useState(() =>
    expandLegacyCountry(property.location?.country ?? ""),
  );

  const [coordinates, setCoordinates] = useState<[number, number]>(() => {
    const c = property.location?.coordinates?.coordinates;
    if (
      c?.length === 2 &&
      Number.isFinite(c[0]) &&
      Number.isFinite(c[1]) &&
      !isUnsetLngLat(c[0], c[1])
    ) {
      return [c[0], c[1]];
    }
    return [0, 0];
  });

  const [flyToRevision, setFlyToRevision] = useState(0);

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

  useEffect(() => {
    const q = quickQuery.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setSearchOpen(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const hits = await searchPlaces(q);
        setSuggestions(hits);
        setSearchOpen(hits.length > 0);
      } catch {
        toast({
          title: "Search unavailable",
          description:
            "Could not reach the address directory. Check your connection and try again.",
          variant: "destructive",
        });
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 650);

    return () => window.clearTimeout(handle);
  }, [quickQuery, toast]);

  const applyGeocodeHit = useCallback((hit: GeocodeHit) => {
    setAddress(hit.streetLine);
    if (hit.city) setCity(hit.city);
    if (hit.state) setStateVal(hit.state);
    if (hit.postcode) setZip(hit.postcode);
    if (hit.country) setCountry(hit.country);
    setCoordinates([hit.lng, hit.lat]);
    setFlyToRevision((r) => r + 1);
    setQuickQuery("");
    setSuggestions([]);
    setSearchOpen(false);
  }, []);

  const handleLngLatChange = useCallback(
    async (lng: number, lat: number, opts?: { fly?: boolean }) => {
      setCoordinates([lng, lat]);
      if (opts?.fly) {
        setFlyToRevision((r) => r + 1);
        try {
          const hit = await reverseGeocode(lat, lng);
          if (hit) {
            if (hit.streetLine) setAddress(hit.streetLine);
            if (hit.city) setCity(hit.city);
            if (hit.state) setStateVal(hit.state);
            if (hit.postcode) setZip(hit.postcode);
            if (hit.country) setCountry(hit.country);
          }
        } catch {
          /* optional: silent — pin still updates */
        }
      }
    },
    [],
  );

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
        country: country.trim(),
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

  const clearAllFields = () => {
    setAddress("");
    setUnit("");
    setCity("");
    setStateVal("");
    setZip("");
    setCountry("");
    setCoordinates([0, 0]);
    setQuickQuery("");
    setSuggestions([]);
    setSearchOpen(false);
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
              <div className="relative">
                <Input
                  placeholder="Search for an address (e.g. 123 Main St, Lagos)…"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setSearchOpen(true);
                  }}
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={searchOpen}
                />
                {searchLoading ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                  </div>
                ) : null}
                {searchOpen && suggestions.length > 0 ? (
                  <ul
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-sm shadow-lg"
                  >
                    {suggestions.map((hit) => (
                      <li key={hit.id}>
                        <button
                          type="button"
                          className="w-full rounded-sm px-3 py-2.5 text-left hover:bg-muted"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            applyGeocodeHit(hit);
                          }}
                        >
                          <span className="line-clamp-2 text-foreground">
                            {hit.displayName}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Powered by OpenStreetMap. Pick a result to fill the form and
                place the map pin. You can also click the map to set the pin.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Property Address</h3>
                <button
                  className="text-xs text-primary hover:underline"
                  type="button"
                  onClick={clearAllFields}
                >
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
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    placeholder="California"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                  />
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
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
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
                  Add Tag
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
              <h3 className="font-semibold text-sm">Pin placement</h3>
              <div className="inline-flex items-center gap-1 text-xs text-emerald-600">
                <Navigation className="size-3" /> Interactive map
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <PropertyLocationMap
                lngLat={coordinates}
                flyToRevision={flyToRevision}
                onLngLatChange={handleLngLatChange}
                height={288}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click the map to drop a pin, or drag the pin to fine-tune. Search
              above moves the pin automatically.
            </p>
            <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-primary" />
              Coordinates are saved with your listing for map-based discovery.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/agent/add-property")}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button type="button" onClick={handleNext}>
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyLocationPage;
