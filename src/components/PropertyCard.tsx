"use client";

import { Heart, MapPin, Bed, Bath, Square } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface PropertyCardProps {
  image: string;
  price: string;
  title: string;
  location: string;
  beds: number;
  baths: number;
  sqft: string;
  badge: string;
}

const PropertyCard = ({
  image,
  price,
  title,
  location,
  beds,
  baths,
  sqft,
  badge,
}: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border">
      <div className="relative h-64 overflow-hidden">
        <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-foreground z-10 uppercase tracking-wider">
          {badge}
        </div>
        <Image
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute bottom-3 right-3 p-2 bg-white rounded-full text-gray-500 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart
            className={`size-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-foreground">{price}</h3>
          <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">
            For Sale
          </span>
        </div>
        <p className="text-foreground font-medium mb-1 truncate">{title}</p>
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
          <MapPin className="size-4" />
          {location}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-1">
            <Bed className="size-4" /> {beds} Beds
          </div>
          <div className="flex items-center gap-1">
            <Bath className="size-4" /> {baths} Baths
          </div>
          <div className="flex items-center gap-1">
            <Square className="size-4" /> {sqft}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
