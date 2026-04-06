"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bath,
  Bed,
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  Phone,
  Share2,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import {
  getImageUrls,
  normalizePropertyForDetail,
  unwrapSingleProperty,
  type NormalizedPropertyDetail,
} from "@/lib/property-normalize";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FAVORITES_KEY = "propspacex_favorite_property_ids";

const PropertyReadOnlyMap = dynamic(
  () => import("../components/PropertyReadOnlyMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-64 w-full animate-pulse rounded-lg bg-muted"
        aria-hidden
      />
    ),
  },
);

function formatPropertyType(value: string) {
  if (!value || value === "—") return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatStatusLabel(value: string) {
  if (!value || value === "—") return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function readFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

const PropertyDetailsPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<NormalizedPropertyDetail | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing property id.");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await api.getPropertyById(id);
        const unwrapped = unwrapSingleProperty(raw);
        const normalized = normalizePropertyForDetail(unwrapped);
        if (cancelled) return;
        if (!normalized) {
          setError("Could not read this listing.");
          setDetail(null);
          setGallery([]);
          return;
        }
        setDetail(normalized);
        setGallery(getImageUrls(unwrapped));
        setActiveImageIndex(0);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load property.",
          );
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setSaved(readFavoriteIds().includes(id));
  }, [id]);

  const images = useMemo(() => {
    if (gallery.length > 0) return gallery;
    if (detail?.image) return [detail.image];
    return [];
  }, [gallery, detail?.image]);

  const mainImage = images[activeImageIndex] ?? images[0] ?? "";
  const otherSlots = images
    .map((src, globalIndex) => ({ src, globalIndex }))
    .filter(({ globalIndex }) => globalIndex !== activeImageIndex);
  const thumbSlots = otherSlots.slice(0, 4);
  const extraCount = Math.max(0, otherSlots.length - 4);

  const openLightboxAt = useCallback((index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleShare = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const title = detail?.title ?? "PropSpace X listing";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      /* dismissed share sheet or unsupported — try clipboard */
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share this listing with anyone.",
      });
    } catch {
      toast({
        title: "Could not copy",
        description: url,
        variant: "destructive",
      });
    }
  }, [detail?.title, toast]);

  const toggleFavorite = useCallback(() => {
    if (!id) return;
    const ids = readFavoriteIds();
    const next = saved ? ids.filter((x) => x !== id) : [...ids, id];
    writeFavoriteIds(next);
    setSaved(!saved);
    toast({
      title: saved ? "Removed from favorites" : "Saved to favorites",
      description: saved
        ? "You can add it again anytime."
        : "We stored this on this device for now.",
    });
  }, [id, saved, toast]);

  const lightboxNext = useCallback(() => {
    setActiveImageIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  const lightboxPrev = useCallback(() => {
    setActiveImageIndex((i) =>
      images.length ? (i - 1 + images.length) % images.length : 0,
    );
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen || images.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "ArrowLeft") lightboxPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, images.length, lightboxNext, lightboxPrev]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <p>Loading property…</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error ?? "Property not found."}
        </div>
        <Button variant="outline" asChild>
          <Link href="/buyer/search">Back to search</Link>
        </Button>
      </div>
    );
  }

  const typeLabel = formatPropertyType(detail.type);
  const statusLabel = formatStatusLabel(detail.status);

  return (
    <div className="mx-auto max-w-6xl p-4 pb-12 sm:p-6">
      <nav
        className="mb-6 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/buyer" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/buyer/search" className="hover:text-foreground">
              Search
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="line-clamp-2 font-medium text-foreground">
            {detail.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Gallery */}
          <div className="space-y-2">
            <div
              className={cn(
                "grid min-h-[220px] gap-2 overflow-hidden rounded-xl md:h-[420px]",
                images.length <= 1
                  ? "grid-cols-1"
                  : "grid-cols-2 md:grid-cols-4 md:grid-rows-2",
              )}
            >
              <button
                type="button"
                onClick={() => openLightboxAt(activeImageIndex)}
                className={cn(
                  "relative min-h-[200px] bg-muted text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring md:min-h-0",
                  images.length <= 1
                    ? "col-span-1"
                    : "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
                )}
                aria-label={`View main photo, ${activeImageIndex + 1} of ${images.length}`}
              >
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={`${detail.title} — photo ${activeImageIndex + 1} of ${images.length}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : null}
                <span className="sr-only">Open gallery</span>
              </button>

              {images.length > 1
                ? thumbSlots.map(({ src, globalIndex }, slotIdx) => {
                    const isLast =
                      slotIdx === thumbSlots.length - 1 && extraCount > 0;
                    return (
                      <button
                        key={`${src}-${globalIndex}`}
                        type="button"
                        onClick={() => openLightboxAt(globalIndex)}
                        className="relative min-h-[96px] bg-muted outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring md:min-h-0"
                        aria-label={`Photo ${globalIndex + 1} of ${images.length}`}
                      >
                        <Image
                          src={src}
                          alt=""
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                        />
                        {isLast ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                            +{extraCount} more
                          </div>
                        ) : null}
                      </button>
                    );
                  })
                : null}
            </div>
            {images.length > 1 ? (
              <p className="text-xs text-muted-foreground">
                Tap the main image or a thumbnail to view the gallery.{" "}
                {images.length} photos.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {detail.title}
              </h1>
              <p className="mt-2 flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{detail.location}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1 capitalize">
                  <CheckCircle className="size-3" aria-hidden />
                  {statusLabel}
                </Badge>
                <Badge variant="secondary">{typeLabel}</Badge>
              </div>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">
                {detail.price}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {(
              [
                { label: "Beds", value: String(detail.beds), icon: Bed },
                { label: "Baths", value: String(detail.baths), icon: Bath },
                { label: "Area (m²)", value: detail.sqft, icon: Square },
                { label: "Type", value: typeLabel, icon: Building2 },
              ] as const
            ).map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-3 text-center shadow-sm sm:p-4"
              >
                <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground sm:text-sm">
                  <stat.icon className="size-3.5 shrink-0 sm:size-4" />
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {detail.description}
              </p>
            </CardContent>
          </Card>

          {detail.features.length > 0 ? (
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid list-inside list-disc grid-cols-1 gap-1.5 text-sm text-foreground marker:text-primary md:grid-cols-2">
                  {detail.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {detail.coordinates ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <PropertyReadOnlyMap
                    lngLat={detail.coordinates}
                    height={280}
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
                  <p className="px-4 text-center text-sm text-muted-foreground">
                    Map preview is unavailable for this listing (no coordinates
                    on file).
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{detail.location}</p>
              <p className="text-xs text-muted-foreground">
                Map shows an approximate area. Verify the exact address with the
                agent before visiting.
              </p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card className="rounded-xl border-border shadow-sm">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/buyer/contact/${id}`}>
                    <Phone className="mr-2 size-4" />
                    Contact about listing
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/buyer/contact/${id}?intent=tour`}>
                    <Calendar className="mr-2 size-4" />
                    Schedule tour
                  </Link>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={saved ? "secondary" : "ghost"}
                  size="icon"
                  className="flex-1"
                  onClick={toggleFavorite}
                  aria-pressed={saved}
                  aria-label={
                    saved ? "Remove from favorites" : "Save to favorites"
                  }
                >
                  <Heart
                    className={cn("size-4", saved && "fill-current text-red-500")}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-1"
                  onClick={handleShare}
                  aria-label="Share listing"
                >
                  <Share2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-[min(96vw,56rem)] border-0 bg-transparent p-0 shadow-none"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            Property photos, image {activeImageIndex + 1} of {images.length}
          </DialogTitle>
          {images.length > 0 ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black sm:aspect-video">
              <Image
                src={images[activeImageIndex]}
                alt=""
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
              {images.length > 1 ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-md"
                    onClick={lightboxPrev}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-md"
                    onClick={lightboxNext}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                  <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyDetailsPage;
