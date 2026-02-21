"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
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
  Waves,
  Dumbbell,
  Umbrella,
  Shield,
  Car,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const amenities = [
  { icon: Waves, label: "Private Pool" },
  { icon: Dumbbell, label: "Private Gym" },
  { icon: Umbrella, label: "Beach Access" },
  { icon: Car, label: "5 Car Garage" },
  { icon: Users, label: "Maid's Room" },
  { icon: Shield, label: "24/7 Security" },
];

const PropertyDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        Home &gt; Dubai &gt; Palm Jumeirah &gt;{" "}
        <span className="text-foreground">Villa Ref: PV-5083</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
            <div className="col-span-2 row-span-2 relative">
              <Image
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
                alt="Property main"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="col-span-1 row-span-1 relative">
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400"
                alt="Property 2"
                className="object-cover"
                fill
                sizes="25vw"
              />
            </div>
            <div className="col-span-1 row-span-1 relative">
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"
                alt="Property 3"
                className="object-cover"
                fill
                sizes="25vw"
              />
            </div>
            <div className="col-span-1 row-span-1 relative">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"
                alt="Property 4"
                className="object-cover"
                fill
                sizes="25vw"
              />
            </div>
            <div className="col-span-1 row-span-1 relative">
              <Image
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400"
                alt="Property 5"
                className="object-cover"
                fill
                sizes="25vw"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                +12 Photos
              </div>
            </div>
          </div>

          {/* Title & Price */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Luxury Villa in Palm Jumeirah
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="size-4" />
                Palm Jumeirah, Dubai, UAE
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="size-3" /> Web3 Verified
                </Badge>
                <Badge variant="secondary">Premium Listing</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">AED 15,000,000</p>
              <p className="text-sm text-muted-foreground">≈ $4,084,967</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Beds", value: "5", icon: Bed },
              { label: "Baths", value: "6", icon: Bath },
              { label: "Area", value: "7,000", icon: Square },
              { label: "Type", value: "Villa", icon: MapPin },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-surface border border-border rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                Experience the pinnacle of luxury living in this exquisite
                5-bedroom villa located on the iconic Palm Jumeirah. This
                custom-designed home offers direct private beach access and
                breathtaking views of the Arabian skyline.
              </p>
              <p>
                The ground floor features a grand double-height foyer, a formal
                living room, and a state-of-the-art kitchen equipped with
                premium appliances. Floor-to-ceiling windows flood the interiors
                with natural light, seamlessly blending indoor and outdoor
                living spaces.
              </p>
              <Button variant="link" className="px-0">
                Read more →
              </Button>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.label} className="flex items-center gap-2">
                    <amenity.icon className="size-5 text-primary" />
                    <span className="text-foreground">{amenity.label}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4">
                Show all 15 amenities
              </Button>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Map placeholder</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Palm Jumeirah Fronds, Dubai, United Arab Emirates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" />
                  <AvatarFallback>JW</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">James Wilson</p>
                  <p className="text-sm text-muted-foreground">
                    Premium Properties Dubai
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  <Phone className="size-4 mr-2" /> Contact Agent
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

          {/* Price History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Price History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Price</span>
                <span className="font-semibold text-foreground">
                  AED 15,000,000
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Listed (Jan 2024)</span>
                <span className="text-foreground">AED 16,500,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Sale (2019)</span>
                <span className="text-foreground">AED 68,450,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
