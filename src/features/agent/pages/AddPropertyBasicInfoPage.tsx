"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";

const AddPropertyBasicInfoPage = () => {
  const router = useRouter();

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
            />
            <p className="text-xs text-muted-foreground">
              Include key features like Ocean View or Newly Renovated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select defaultValue="apartment">
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Listing Status</Label>
              <Select defaultValue="for-sale">
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for-sale">For Sale</SelectItem>
                  <SelectItem value="for-rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Asking Price</Label>
              <Input id="price" placeholder="$ 0.00" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="aed">AED (د.إ)</SelectItem>
                  <SelectItem value="ngn">NGN (₦)</SelectItem>
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
            <Switch />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" asChild>
              <Link href="/agent/listings">Cancel</Link>
            </Button>
            <Button onClick={() => router.push("/agent/add-property/location")}>
              Continue to Location
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex items-center gap-2">
        <Lightbulb className="size-4" />
        Pro Tip: Properties with detailed descriptions and at least 5 photos
        receive more inquiries.
      </div>
    </div>
  );
};

export default AddPropertyBasicInfoPage;
