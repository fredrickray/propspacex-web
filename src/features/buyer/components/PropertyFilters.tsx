"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw } from "lucide-react";
import {
  AMENITY_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  PROPERTY_TYPE_OPTIONS,
  formatCompactNaira,
  isAmenityId,
  type AmenityId,
  type CatalogFilters,
} from "@/lib/catalog-query";

const BED_OPTIONS = ["Any", "1", "2", "3", "4", "5+"] as const;
const BATH_OPTIONS = ["Any", "1", "2", "3", "4+"] as const;

function readOptionalNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function minimumFromOption(option: string): number | null {
  if (option === "Any") return null;
  return Number.parseInt(option, 10);
}

function optionFromMinimum(
  value: number | null,
  options: readonly string[],
): string {
  if (value == null) return "Any";
  const plus = `${value}+`;
  if (options.includes(plus)) return plus;
  const exact = String(value);
  return options.includes(exact) ? exact : "Any";
}

type PropertyFiltersProps = {
  value: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
  onReset: () => void;
  onShowResults?: () => void;
};

const PropertyFilters = ({
  value,
  onChange,
  onReset,
  onShowResults,
}: PropertyFiltersProps) => {
  const priceValue: [number, number] = [
    value.minPrice ?? PRICE_MIN,
    value.maxPrice ?? PRICE_MAX,
  ];

  const setPrice = (next: number[]) => {
    const min = next[0] ?? PRICE_MIN;
    const max = next[1] ?? PRICE_MAX;
    onChange({
      ...value,
      minPrice: min <= PRICE_MIN ? null : min,
      maxPrice: max >= PRICE_MAX ? null : max,
    });
  };

  const toggleAmenity = (id: AmenityId, checked: boolean) => {
    const amenities = checked
      ? [...value.amenities, id]
      : value.amenities.filter((item) => item !== id);
    onChange({ ...value, amenities });
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onReset}
        >
          <RotateCcw className="size-4 mr-1" /> Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-location">Location</Label>
        <Input
          id="filter-location"
          placeholder="City, neighborhood, or ZIP"
          value={value.q}
          onChange={(event) => onChange({ ...value, q: event.target.value })}
        />
      </div>

      <div className="space-y-3">
        <Label>Price Range</Label>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatCompactNaira(priceValue[0])}</span>
          <span>{formatCompactNaira(priceValue[1])}</span>
        </div>
        <Slider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={priceValue}
          onValueChange={setPrice}
          aria-label="Price range"
        />
      </div>

      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <div className="flex gap-2">
          {BED_OPTIONS.map((option) => {
            const selected = optionFromMinimum(value.minBeds, BED_OPTIONS) === option;
            return (
              <Button
                key={option}
                type="button"
                variant={selected ? "default" : "outline"}
                size="sm"
                className="flex-1"
                aria-pressed={selected}
                onClick={() =>
                  onChange({ ...value, minBeds: minimumFromOption(option) })
                }
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bathrooms</Label>
        <div className="flex gap-2">
          {BATH_OPTIONS.map((option) => {
            const selected =
              optionFromMinimum(value.minBaths, BATH_OPTIONS) === option;
            return (
              <Button
                key={option}
                type="button"
                variant={selected ? "default" : "outline"}
                size="sm"
                className="flex-1"
                aria-pressed={selected}
                onClick={() =>
                  onChange({ ...value, minBaths: minimumFromOption(option) })
                }
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Area (m²)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            min={0}
            aria-label="Minimum area in square meters"
            value={value.minArea ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                minArea: readOptionalNumber(event.target.value),
              })
            }
          />
          <Input
            placeholder="Max"
            type="number"
            min={0}
            aria-label="Maximum area in square meters"
            value={value.maxArea ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                maxArea: readOptionalNumber(event.target.value),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select
          value={value.type || "all"}
          onValueChange={(next) =>
            onChange({ ...value, type: next === "all" ? "" : next })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.label} value={option.value || "all"}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="space-y-2">
          {AMENITY_OPTIONS.map((amenity) => (
            <div key={amenity.id} className="flex items-center gap-2">
              <Checkbox
                id={`amenity-${amenity.id}`}
                checked={value.amenities.includes(amenity.id)}
                onCheckedChange={(checked) => {
                  if (!isAmenityId(amenity.id)) return;
                  toggleAmenity(amenity.id, checked === true);
                }}
              />
              <label
                htmlFor={`amenity-${amenity.id}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {amenity.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {onShowResults ? (
        <Button type="button" className="w-full lg:hidden" onClick={onShowResults}>
          Show results
        </Button>
      ) : null}
    </div>
  );
};

export default PropertyFilters;
