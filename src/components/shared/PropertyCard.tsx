"use client";

import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PropertyCardProps {
  id?: string;
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
  badge?: string;
  isFavorited?: boolean;
  isNew?: boolean;
  isPending?: boolean;
  variant?: "landing" | "grid";
  showActions?: boolean;
}

const PropertyCard = ({
  id = "1",
  image,
  price,
  title,
  location,
  beds,
  baths,
  sqft,
  badge,
  isFavorited = false,
  isNew = false,
  isPending = false,
  variant = "landing",
  showActions = false,
}: PropertyCardProps) => {
  const [favorite, setFavorite] = useState(isFavorited);

  const getBadgeStyles = () => {
    if (isNew) return "bg-green-500 text-white";
    if (isPending) return "bg-amber-500 text-white";
    return "bg-primary text-primary-foreground";
  };

  const getBadgeText = () => {
    if (isNew) return "NEW";
    if (isPending) return "PENDING";
    return badge;
  };

  return (
    <motion.div
      className="bg-surface border border-border rounded-xl overflow-hidden group"
      whileHover={{
        y: -4,
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative overflow-hidden ${variant === "landing" ? "h-64" : "h-48"}`}
      >
        {(badge || isNew || isPending) && (
          <span
            className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded z-10 uppercase tracking-wider ${getBadgeStyles()}`}
          >
            {getBadgeText()}
          </span>
        )}
        <motion.button
          onClick={() => setFavorite(!favorite)}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart
            className={`size-4 transition-colors ${favorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-400"}`}
          />
        </motion.button>
        <motion.div
          className="w-full h-full relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={image}
            alt={title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      </div>

      <div className={variant === "landing" ? "p-5" : "p-4"}>
        <div className="flex justify-between items-start mb-2">
          <p
            className={`font-bold text-primary ${variant === "landing" ? "text-xl" : "text-xl"}`}
          >
            {price}
          </p>
          {variant === "landing" && (
            <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">
              For Sale
            </span>
          )}
        </div>
        <h3 className="font-semibold text-foreground truncate mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
          <MapPin className="size-3" />
          {location}
        </p>

        <div className="flex items-center gap-3 text-sm text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1">
            <Bed className="size-4" /> {beds} {variant === "landing" && "Beds"}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4" /> {baths}{" "}
            {variant === "landing" && "Baths"}
          </span>
          <span className="flex items-center gap-1">
            <Square className="size-4" /> {sqft}
          </span>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/buyer/property/${id}`}>
                <Eye className="size-4 mr-1" /> View Details
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              Compare
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PropertyCard;
