"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const listings = [
  {
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=120",
    property: "Marina Bay Tower - Unit 1204",
    type: "Apartment",
    price: "AED 2,500,000",
    status: "active",
    views: 342,
    inquiries: 18,
    listed: "Jan 15, 2026",
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120",
    property: "Palm Jumeirah Villa #8",
    type: "Villa",
    price: "AED 12,800,000",
    status: "active",
    views: 278,
    inquiries: 12,
    listed: "Jan 10, 2026",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=120",
    property: "Downtown Heights - Penthouse",
    type: "Penthouse",
    price: "AED 8,200,000",
    status: "pending",
    views: 195,
    inquiries: 8,
    listed: "Jan 8, 2026",
  },
  {
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=120",
    property: "Business Bay Studio",
    type: "Studio",
    price: "AED 750,000",
    status: "active",
    views: 156,
    inquiries: 5,
    listed: "Jan 5, 2026",
  },
  {
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=120",
    property: "JBR 2BR Sea View",
    type: "Apartment",
    price: "AED 3,100,000",
    status: "sold",
    views: 410,
    inquiries: 22,
    listed: "Dec 20, 2025",
  },
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120",
    property: "Arabian Ranches Villa",
    type: "Villa",
    price: "AED 5,600,000",
    status: "draft",
    views: 0,
    inquiries: 0,
    listed: "Feb 25, 2026",
  },
];

const statusVariant = (status: string): "default" | "secondary" | "outline" => {
  if (status === "active") return "default";
  if (status === "pending") return "secondary";
  return "outline";
};

const MyListingsPage = () => {
  const { toast } = useToast();
  const [notice, setNotice] = useState<"published" | "preview" | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const isPublished = url.searchParams.get("published") === "true";
    const isPreview = url.searchParams.get("preview") === "true";

    if (isPublished) {
      setNotice("published");
      toast({
        title: "Property published",
        description: "Your listing is now live and visible to buyers.",
      });
    } else if (isPreview) {
      setNotice("preview");
      toast({
        title: "Preview mode",
        description: "You are viewing this page from preview action.",
      });
    }

    if (isPublished || isPreview) {
      url.searchParams.delete("published");
      url.searchParams.delete("preview");
      window.history.replaceState({}, "", url.pathname);
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice === "published"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {notice === "published"
            ? "Success: your property has been published."
            : "Preview loaded from the review screen."}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            My Listings
          </h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>

        <Button className="gap-2 h-11 px-5" asChild>
          <Link href="/agent/add-property">
            <Plus className="size-4" />
            Add Property
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search listings..." className="pl-9 h-11" />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[140px] h-11">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Property
                </th>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Type
                </th>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Price
                </th>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Status
                </th>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Views
                </th>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Inquiries
                </th>
                <th className="text-left text-sm font-semibold text-muted-foreground px-4 py-4">
                  Listed
                </th>
                <th className="w-12 px-4 py-4" />
              </tr>
            </thead>

            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.property}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.image}
                        alt={listing.property}
                        className="h-12 w-16 rounded-lg object-cover"
                      />
                      <p className="font-semibold text-foreground whitespace-nowrap">
                        {listing.property}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground font-medium">
                    {listing.type}
                  </td>
                  <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">
                    {listing.price}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={statusVariant(listing.status)}
                      className="capitalize"
                    >
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-foreground">{listing.views}</td>
                  <td className="px-4 py-4 text-foreground">
                    {listing.inquiries}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                    {listing.listed}
                  </td>
                  <td className="px-4 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyListingsPage;
