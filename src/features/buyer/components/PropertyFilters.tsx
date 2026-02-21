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

const PropertyFilters = () => {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <RotateCcw className="size-4 mr-1" /> Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input placeholder="City, neighborhood, or ZIP" />
      </div>

      <div className="space-y-3">
        <Label>Price Range</Label>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>$100k</span>
          <span>$10M+</span>
        </div>
        <Slider defaultValue={[200000, 5000000]} min={100000} max={10000000} step={50000} />
      </div>

      <div className="space-y-2">
        <Label>Bedrooms</Label>
        <div className="flex gap-2">
          {["Any", "1", "2", "3", "4", "5+"].map((num) => (
            <Button
              key={num}
              variant={num === "2" ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bathrooms</Label>
        <div className="flex gap-2">
          {["Any", "1", "2", "3", "4+"].map((num) => (
            <Button
              key={num}
              variant={num === "Any" ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Area (sq ft)</Label>
        <div className="flex gap-2">
          <Input placeholder="Min" type="number" />
          <Input placeholder="Max" type="number" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Property Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="space-y-2">
          {["Pool", "Garage", "Garden", "Gym", "Security"].map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox id={amenity} />
              <label htmlFor={amenity} className="text-sm text-foreground cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full">Apply Filters</Button>
    </div>
  );
};

export default PropertyFilters;
