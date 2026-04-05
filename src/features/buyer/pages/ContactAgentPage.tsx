"use client";

import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CheckCircle,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

const ContactAgentPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const defaultMessage =
    intent === "tour"
      ? "I would like to schedule a tour of this property. Please share your availability.\n\nThank you."
      : "Hi, I'm interested in this listing. I'd appreciate more details and next steps.\n\nThank you.";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PropSpaceLogo className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">
              PropSpace X
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Buying as</span>
            <span className="font-medium">John Doe</span>
            <Avatar className="size-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href={`/buyer/property/${id || "1"}`}
          className="inline-flex items-center text-primary text-sm hover:underline mb-4"
        >
          <ArrowLeft className="size-4 mr-1" /> Back to Listing
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-1">
          {intent === "tour" ? "Schedule a tour" : "Contact Agent"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {intent === "tour"
            ? "Pick a time to visit this property with the listing agent."
            : "Get in touch with the listing agent for this property."}
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Agent Info & Property */}
          <div className="space-y-6">
            {/* Agent Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Sarah Jenkins</h3>
                      <CheckCircle className="size-4 text-primary fill-primary/20" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Senior Broker | Luxe Realty
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ● Agent active online - 1m
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button variant="outline" className="w-full">
                    <Phone className="size-4 mr-2" /> Call
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="size-4 mr-2" /> WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src="/placeholder.svg"
                      alt="Property"
                      className="object-cover"
                      fill
                      sizes="160px"
                    />
                    <Badge className="absolute bottom-2 left-2 bg-primary">
                      For Sale
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      REF. PA-0328
                    </p>
                    <h4 className="font-semibold text-foreground">
                      Oceanview Penthouse
                    </h4>
                    <p className="text-xl font-bold text-primary mt-1">
                      $2,500,000
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center mt-2">
                      <MapPin className="size-3 mr-1" /> 123 Marina Blvd,
                      Downtown District
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Send Message</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 bg-green-500 rounded-full" />
                  Web3 ID
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      FULL NAME
                    </Label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      EMAIL
                    </Label>
                    <Input type="email" defaultValue="john.doe@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    PHONE NUMBER
                  </Label>
                  <Input type="tel" defaultValue="+1 (555) 000-0000" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    QUICK TOPIC
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      Schedule Viewing
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      Is price negotiable?
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    >
                      Request Floorplan
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    MESSAGE
                  </Label>
                  <Textarea
                    key={intent ?? "default"}
                    rows={4}
                    defaultValue={defaultMessage}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox id="mortgage" />
                  <label
                    htmlFor="mortgage"
                    className="text-sm text-muted-foreground leading-tight"
                  >
                    I am interested in mortgage pre-approval
                    <span className="block text-xs">
                      Get connected with our lending partners.
                    </span>
                  </label>
                </div>

                <Button className="w-full" size="lg">
                  Send Inquiry →
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By sending this, you agree to PropSpace X{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactAgentPage;
