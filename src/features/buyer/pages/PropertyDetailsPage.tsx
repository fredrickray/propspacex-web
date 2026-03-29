"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Share2,
  Heart,
  Phone,
  Calendar,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  getImageUrls,
  normalizePropertyForDetail,
  unwrapSingleProperty,
  type NormalizedPropertyDetail,
} from "@/lib/property-normalize";

const PropertyDetailsPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<NormalizedPropertyDetail | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

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

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p>Loading property…</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-6 max-w-lg mx-auto space-y-4">
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error ?? "Property not found."}
        </div>
        <Button variant="outline" asChild>
          <Link href="/buyer/search">Back to search</Link>
        </Button>
      </div>
    );
  }

  const mainImage = gallery[0] ?? detail.image;
  const thumbs = gallery.slice(1, 5);
  const extraCount = Math.max(0, gallery.length - 5);

  return (
    <div className="p-6">
      <div className="text-sm text-muted-foreground mb-4">
        Home &gt;{" "}
        <Link href="/buyer/search" className="hover:text-foreground">
          Search
        </Link>{" "}
        &gt; <span className="text-foreground">{detail.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 min-h-[240px] md:h-96 rounded-xl overflow-hidden">
            <div className="col-span-2 row-span-2 relative min-h-[200px] md:min-h-0 bg-muted">
              <Image
                src={mainImage}
                alt={detail.title}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {thumbs.map((src, i) => {
              const isLastThumb = i === thumbs.length - 1 && extraCount > 0;
              return (
                <div
                  key={`${src}-${i}`}
                  className="relative min-h-[100px] md:min-h-0 bg-muted"
                >
                  <Image
                    src={src}
                    alt=""
                    className="object-cover"
                    fill
                    sizes="25vw"
                  />
                  {isLastThumb ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                      +{extraCount} more
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {detail.title}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="size-4" />
                {detail.location}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="size-3" /> {detail.status}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {detail.type}
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-primary">{detail.price}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Beds", value: String(detail.beds), icon: Bed },
              { label: "Baths", value: String(detail.baths), icon: Bath },
              { label: "Area", value: detail.sqft, icon: Square },
              { label: "Type", value: detail.type, icon: MapPin },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface border border-border rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <stat.icon className="size-4" /> {stat.label}
                </p>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p className="whitespace-pre-wrap">{detail.description}</p>
            </CardContent>
          </Card>

          {detail.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {detail.features.map((f) => (
                    <li key={f} className="text-foreground">
                      • {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Map placeholder</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {detail.location}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/buyer/contact/${id}`}>
                    <Phone className="size-4 mr-2" /> Contact about listing
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="size-4 mr-2" /> Schedule Tour
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="icon" className="flex-1">
                  <Heart className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="flex-1">
                  <Share2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
