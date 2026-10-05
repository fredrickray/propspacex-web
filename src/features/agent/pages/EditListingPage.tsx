"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bath, Bed, Car, Eye, Loader2, MapPin, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import {
  api,
  Currency,
  PropertyStatus,
  PropertyType,
  type IPropertyAmenties,
  type IPropertyLocation,
} from "@/lib/api";
import {
  getImageUrls,
  unwrapSingleProperty,
} from "@/lib/property-normalize";

type PreservedDetails = {
  coordinates: IPropertyLocation["coordinates"];
  neighborhoodHighlights?: IPropertyLocation["neighborhoodHighlights"];
  lotSize?: number;
  yearBuilt?: number;
  dimensionPropertyType?: string;
};

type EditForm = {
  title: string;
  description: string;
  type: string;
  status: string;
  purpose: "sale" | "rent";
  price: string;
  currency: string;
  address: string;
  suite: string;
  city: string;
  state: string;
  country: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  totalArea: string;
  featuresText: string;
  comfort: string;
  safety: string;
  recreation: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumberString(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return value.trim();
  }
  return "";
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  return Math.round(value).toLocaleString("en-US");
}

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toCount(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed);
}

function readPreserved(raw: Record<string, unknown>): PreservedDetails {
  const location = isRecord(raw.location) ? raw.location : {};
  const coordinates = isRecord(location.coordinates) ? location.coordinates : null;
  const pair = Array.isArray(coordinates?.coordinates)
    ? coordinates.coordinates
    : [];
  const lng = Number(pair[0]);
  const lat = Number(pair[1]);
  const size = isRecord(raw.size) ? raw.size : {};
  const dim = isRecord(size.dimensionDetails) ? size.dimensionDetails : {};
  const highlights = isRecord(location.neighborhoodHighlights)
    ? location.neighborhoodHighlights
    : undefined;

  return {
    coordinates:
      Number.isFinite(lng) && Number.isFinite(lat)
        ? { type: "Point", coordinates: [lng, lat] }
        : { type: "Point", coordinates: [0, 0] },
    neighborhoodHighlights: highlights
      ? {
          description: asString(highlights.description),
          tags: Array.isArray(highlights.tags)
            ? highlights.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        }
      : undefined,
    lotSize: toCount(asNumberString(dim.lotSize)),
    yearBuilt: toCount(asNumberString(dim.yearBuilt)),
    dimensionPropertyType: asString(dim.propertyType) || undefined,
  };
}

function readAmenities(raw: Record<string, unknown>): Pick<
  EditForm,
  "comfort" | "safety" | "recreation"
> {
  const first = Array.isArray(raw.amenities) ? raw.amenities.find(isRecord) : null;
  const join = (key: string) => {
    const list = first?.[key];
    return Array.isArray(list)
      ? list.filter((item): item is string => typeof item === "string").join("\n")
      : "";
  };
  return {
    comfort: join("comfort"),
    safety: join("safety"),
    recreation: join("recreation"),
  };
}

function readForm(raw: Record<string, unknown>): EditForm {
  const location = isRecord(raw.location) ? raw.location : {};
  const size = isRecord(raw.size) ? raw.size : {};
  const dim = isRecord(size.dimensionDetails) ? size.dimensionDetails : {};
  const features = Array.isArray(raw.features)
    ? raw.features.filter((item): item is string => typeof item === "string")
    : [];
  const price = typeof raw.price === "number" ? raw.price : Number(raw.price);

  return {
    title: asString(raw.title),
    description: asString(raw.description),
    type: asString(raw.type) || PropertyType.APARTMENT,
    status: asString(raw.status) || PropertyStatus.AVAILABLE,
    purpose: asString(raw.purpose).toLowerCase() === "rent" ? "rent" : "sale",
    price: formatPrice(price),
    currency: asString(raw.currency) || Currency.NGN,
    address: asString(location.address),
    suite: asString(location.suite),
    city: asString(location.city),
    state: asString(location.state),
    country: asString(location.country),
    bedrooms: asNumberString(size.bedrooms),
    bathrooms: asNumberString(size.bathrooms),
    parking: asNumberString(size.parkingSpaces),
    totalArea: asNumberString(dim.totalArea),
    featuresText: features.join("\n"),
    ...readAmenities(raw),
  };
}

const EditListingPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [preserved, setPreserved] = useState<PreservedDetails | null>(null);
  const [form, setForm] = useState<EditForm | null>(null);
  const [savedStatus, setSavedStatus] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing listing id.");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = unwrapSingleProperty(await api.getPropertyById(id));
        if (!isRecord(raw)) throw new Error("Could not read this listing.");
        if (cancelled) return;
        const nextForm = readForm(raw);
        setForm(nextForm);
        setSavedStatus(nextForm.status);
        setPreserved(readPreserved(raw));
        setPhotos(getImageUrls(raw));
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load this listing.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = (patch: Partial<EditForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const handlePriceChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      update({ price: "" });
      return;
    }
    update({ price: BigInt(digits).toLocaleString("en-US") });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form || !preserved || !id) return;

    const title = form.title.trim();
    const description = form.description.trim();
    const price = Number(form.price.replace(/,/g, ""));
    if (!title || !description || !form.address.trim() || !form.city.trim() || price <= 0) {
      toast({
        title: "Missing required fields",
        description: "Add a title, description, address, city, and a price above zero.",
        variant: "destructive",
      });
      return;
    }

    const amenities: IPropertyAmenties[] = [
      {
        comfort: linesToList(form.comfort),
        safety: linesToList(form.safety),
        recreation: linesToList(form.recreation),
      },
    ];

    setSaving(true);
    try {
      await api.updateProperty(id, {
        title,
        description,
        type: form.type as PropertyType,
        ...(savedStatus === "available" &&
        (form.status === "sold" || form.status === "rented")
          ? { status: form.status as PropertyStatus }
          : {}),
        purpose: form.purpose,
        price,
        currency: form.currency as Currency,
        location: {
          address: form.address.trim(),
          suite: form.suite.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
          coordinates: preserved.coordinates,
          neighborhoodHighlights: preserved.neighborhoodHighlights,
        },
        features: linesToList(form.featuresText),
        size: {
          bedrooms: toCount(form.bedrooms),
          bathrooms: toCount(form.bathrooms),
          parkingSpaces: toCount(form.parking),
          dimensionDetails: {
            totalArea: toCount(form.totalArea),
            lotSize: preserved.lotSize,
            yearBuilt: preserved.yearBuilt,
            propertyType: preserved.dimensionPropertyType,
          },
        },
        amenities,
      });
      toast({
        title: "Listing updated",
        description: "Your changes are saved.",
      });
      router.push("/agent/listings");
    } catch (saveError) {
      toast({
        title: "Update failed",
        description:
          saveError instanceof Error
            ? saveError.message
            : "The listing could not be saved.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" aria-hidden />
        Loading listing…
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error ?? "Listing not found."}
        </div>
        <Button variant="outline" asChild>
          <Link href="/agent/listings">Back to listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/agent/listings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to listings
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit listing</h1>
            <Badge variant="secondary" className="capitalize">
              {form.status}
            </Badge>
          </div>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Change what buyers read. Photos stay as uploaded.
          </p>
        </div>
        <Button type="button" variant="outline" className="gap-2" asChild>
          <Link href={`/properties/${id}`}>
            <Eye className="size-4" />
            Preview
          </Link>
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {photos.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={photos[0]}
                alt=""
                className="h-56 w-full object-cover sm:h-72"
              />
              {photos.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {photos.slice(1, 7).map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      className="h-16 w-24 shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold">Listing</h2>
                <p className="text-sm text-muted-foreground">
                  Title, price, and the description on the preview.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Property title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => update({ title: event.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Property type</Label>
                  <Select value={form.type} onValueChange={(type) => update({ type })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Offered as</Label>
                  <Select
                    value={form.purpose}
                    onValueChange={(purpose) =>
                      update({ purpose: purpose === "rent" ? "rent" : "sale" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Listing status</Label>
                  {savedStatus === "available" ? (
                    <Select
                      value={form.status}
                      onValueChange={(status) => update({ status })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      {savedStatus === "rejected"
                        ? "Rejected. An admin decides when it can go live."
                        : savedStatus === "sold"
                          ? "Sold. This listing stays off the catalog."
                          : savedStatus === "rented"
                            ? "Rented. This listing stays off the catalog."
                            : "Pending review. An admin approves it before it is available."}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="price">Asking price</Label>
                  <Input
                    id="price"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(event) => handlePriceChange(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(currency) => update({ currency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (Naira)</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="min-h-32"
                  value={form.description}
                  onChange={(event) => update({ description: event.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold">Location</h2>
                <p className="text-sm text-muted-foreground">
                  The address shown under the title. The map pin stays put.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(event) => update({ address: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suite">Suite</Label>
                  <Input
                    id="suite"
                    value={form.suite}
                    onChange={(event) => update({ suite: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(event) => update({ city: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(event) => update({ state: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(event) => update({ country: event.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <h2 className="text-base font-semibold">Size and features</h2>
                <p className="text-sm text-muted-foreground">
                  One item per line for features and amenities.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {(
                  [
                    { id: "bedrooms", label: "Bedrooms", icon: Bed, key: "bedrooms" },
                    { id: "bathrooms", label: "Bathrooms", icon: Bath, key: "bathrooms" },
                    { id: "parking", label: "Parking", icon: Car, key: "parking" },
                    { id: "area", label: "Area (m²)", icon: Square, key: "totalArea" },
                  ] as const
                ).map((field) => (
                  <div
                    key={field.id}
                    className="space-y-2 rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <Label htmlFor={field.id} className="flex items-center gap-1.5">
                      <field.icon className="size-3.5 text-muted-foreground" />
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      type="number"
                      min={0}
                      value={form[field.key]}
                      onChange={(event) =>
                        update({ [field.key]: event.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features</Label>
                <Textarea
                  id="features"
                  className="min-h-24"
                  value={form.featuresText}
                  onChange={(event) => update({ featuresText: event.target.value })}
                  placeholder="One feature per line"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="comfort">Comfort</Label>
                  <Textarea
                    id="comfort"
                    value={form.comfort}
                    onChange={(event) => update({ comfort: event.target.value })}
                    placeholder="One item per line"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="safety">Safety</Label>
                  <Textarea
                    id="safety"
                    value={form.safety}
                    onChange={(event) => update({ safety: event.target.value })}
                    placeholder="One item per line"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recreation">Recreation</Label>
                  <Textarea
                    id="recreation"
                    value={form.recreation}
                    onChange={(event) => update({ recreation: event.target.value })}
                    placeholder="One item per line"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Buyer preview
              </p>
              <div>
                <p className="text-lg font-semibold leading-snug">
                  {form.title.trim() || "Untitled listing"}
                </p>
                <p className="mt-1 text-xl font-bold text-primary">
                  {form.currency} {form.price || "0"}
                </p>
              </div>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {[form.address, form.city, form.state, form.country]
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .join(", ") || "Address not set"}
                </span>
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Bed className="size-4" /> {form.bedrooms || "0"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bath className="size-4" /> {form.bathrooms || "0"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Square className="size-4" /> {form.totalArea || "0"} m²
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/agent/listings">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
};

export default EditListingPage;
