"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePropertyCreation } from "../context/PropertyCreationContext";
import { ArrowLeft, Lightbulb } from "lucide-react";
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

const AddPropertyBasicInfoPage = () => {
  const router = useRouter();
  const { property, setProperty } = usePropertyCreation();
  const [title, setTitle] = useState(property.title ?? "");
  const [type, setType] = useState(property.type ?? "apartment");
  const [status, setStatus] = useState(property.status ?? "available");
  const [price, setPrice] = useState(
    property.price !== undefined ? String(property.price) : "",
  );
  const [currency, setCurrency] = useState(property.currency ?? "NGN");
  const [description, setDescription] = useState(property.description ?? "");

  const handleNext = () => {
    setProperty({
      title: title.trim(),
      type,
      status,
      price: Number(price || 0),
      currency,
      description: description.trim(),
    });
    router.push("/agent/add-property/location");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <Link
        href="/agent"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <AddPropertyStepHeader
        title="Add New Property"
        description="Fill in the core details to start your listing."
        step={1}
        totalSteps={6}
        stepLabel="Basic Info"
      />

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Property Title</Label>
              <span className="text-xs text-muted-foreground">Required</span>
            </div>
            <Input
              id="title"
              placeholder="e.g., Luxury 3-Bed Apartment in Downtown New York"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include key features like Ocean View or Newly Renovated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
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
              <Label>Listing Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Asking Price</Label>
              <Input
                id="price"
                placeholder="0.00"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="NGN">NGN (N)</SelectItem>
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
              className="min-h-36"
              placeholder="Describe the key features, amenities, and unique selling points of the property..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-start justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Mint as NFT</p>
              <p className="text-xs text-muted-foreground">
                Create a digital twin on the blockchain for transparent
                ownership history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button
          onClick={handleNext}
          disabled={!title.trim() || !price || Number(price) <= 0}
        >
          Continue to Location
        </Button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center gap-2">
        <Lightbulb className="size-4" />
        Pro Tip: Properties with detailed descriptions and at least 5 photos
        receive more inquiries.
      </div>
    </div>
  );
};

export default AddPropertyBasicInfoPage;
