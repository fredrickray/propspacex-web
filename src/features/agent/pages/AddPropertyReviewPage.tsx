"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  Edit3,
  Eye,
  Mail,
  Phone,
  Rocket,
  Ruler,
  Save,
  ShowerHead,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddPropertyStepHeader from "../components/AddPropertyStepHeader";

const AddPropertyReviewPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const draftPayload = {
    title: "Luxury Penthouse with Bay View",
    type: "Residential Apartment",
    location: "128 Marina Blvd, District 4, San Francisco, CA 94123",
    beds: 3,
    baths: 2.5,
    sqft: 2450,
    updatedAt: new Date().toISOString(),
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      localStorage.setItem(
        "agent_add_property_draft",
        JSON.stringify(draftPayload),
      );
      toast({
        title: "Draft saved",
        description: "Your property draft has been saved successfully.",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePreview = () => {
    localStorage.setItem(
      "agent_add_property_preview",
      JSON.stringify(draftPayload),
    );
    toast({
      title: "Preview ready",
      description: "Opening property preview from your draft.",
    });
    router.push("/agent/listings?preview=true");
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      localStorage.removeItem("agent_add_property_draft");
      toast({
        title: "Property published",
        description: "Your listing is now live on PropSpace X.",
      });
      router.push("/agent/listings?published=true");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="text-sm text-muted-foreground">
        Properties / Add New /{" "}
        <span className="text-foreground">Review & Publish</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_320px] gap-5 items-start">
        <div className="space-y-5">
          <AddPropertyStepHeader
            title="Review Property Details"
            description="Please review all information below. Once published, the property will be live on the PropSpace X network."
            step={4}
            totalSteps={4}
            stepLabel="Review & Publish"
            completionLabel="100% Complete"
          />

          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xl font-semibold">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Basic Information
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Edit3 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Property Title
                    </p>
                    <p className="text-lg font-semibold">
                      Luxury Penthouse with Bay View
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Address
                    </p>
                    <p className="font-medium">128 Marina Blvd, District 4</p>
                    <p className="text-muted-foreground">
                      San Francisco, CA 94123
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Property Type
                    </p>
                    <p className="text-lg font-semibold">
                      Residential Apartment
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-2">
                      Specs
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md bg-muted p-2 text-center">
                        <Ruler className="size-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-semibold leading-none">2,450</p>
                        <p className="text-xs text-muted-foreground">sqft</p>
                      </div>
                      <div className="rounded-md bg-muted p-2 text-center">
                        <BedDouble className="size-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-semibold leading-none">3</p>
                        <p className="text-xs text-muted-foreground">Beds</p>
                      </div>
                      <div className="rounded-md bg-muted p-2 text-center">
                        <ShowerHead className="size-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-semibold leading-none">2.5</p>
                        <p className="text-xs text-muted-foreground">Baths</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-2xl font-semibold">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Media Gallery
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Edit3 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-lg bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {i === 3 ? "+12 more" : `Photo ${i + 1}`}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-2xl font-semibold">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Description & Amenities
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Edit3 className="size-4" />
                </Button>
              </div>
              <p className="text-muted-foreground">
                Experience luxury living at its finest in this stunning
                penthouse apartment. Featuring panoramic views of the bay,
                floor-to-ceiling windows, and a private terrace perfect for
                entertaining.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-2xl font-semibold">Publish Property</h3>
              <Button
                className="w-full h-11 gap-2"
                onClick={handlePublish}
                disabled={isPublishing || isSavingDraft}
              >
                <Rocket className="size-4" /> Publish Now
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isPublishing}
                >
                  <Save className="size-4 mr-1" /> Save Draft
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handlePreview}
                  disabled={isSavingDraft || isPublishing}
                >
                  <Eye className="size-4 mr-1" /> Preview
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                By publishing, you agree to the Terms of Service.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-slate-950 text-white">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">Web3 Integration</p>
                  <p className="text-sm text-slate-300">
                    Blockchain verification
                  </p>
                </div>
                <div className="w-9 h-5 rounded-full bg-primary relative">
                  <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" />
                </div>
              </div>

              <div className="rounded-lg bg-white/10 p-3 space-y-1">
                <p className="text-xs text-slate-300">Connected Wallet</p>
                <p className="font-medium inline-flex items-center gap-2">
                  <Wallet className="size-4" /> 0x71C...9A23
                </p>
              </div>

              <p className="text-xs text-slate-300">Est. Gas Fee: 0.002 ETH</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-xs uppercase text-muted-foreground font-semibold">
                Listing Agent
              </p>
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100" />
                  <AvatarFallback>JW</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">James Wilson</p>
                  <p className="text-sm text-muted-foreground">
                    PropSpace Premier
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2">
                  <Mail className="size-4" /> james.wilson@propspace.com
                </p>
                <p className="inline-flex items-center gap-2">
                  <Phone className="size-4" /> +1 (415) 555-0123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button
        variant="ghost"
        className="gap-2"
        onClick={() => router.push("/agent/add-property/verification")}
      >
        <ArrowLeft className="size-4" /> Back to Verification
      </Button>
    </div>
  );
};

export default AddPropertyReviewPage;
