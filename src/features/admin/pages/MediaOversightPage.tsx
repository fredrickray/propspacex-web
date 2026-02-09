"use client";

import { useState } from "react";
import {
  HardDrive,
  AlertTriangle,
  Image as ImageIcon,
  TrendingUp,
  Search,
  Check,
  Flag,
  Trash2,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "../components/StatCard";

const mediaItems = [
  {
    id: 1,
    title: "Living Room...",
    property: "ID: #P5156123",
    status: "pending",
    flagged: false,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300",
  },
  {
    id: 2,
    title: "Front Yard S...",
    property: "ID: #P1156234",
    status: "pending",
    flagged: true,
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=300",
  },
  {
    id: 3,
    title: "Kitchen Tour",
    property: "ID: #P1256345",
    status: "approved",
    flagged: false,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300",
  },
  {
    id: 4,
    title: "Lease Agreem...",
    property: "ID: #P1356456",
    status: "pending",
    flagged: false,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300",
  },
  {
    id: 5,
    title: "Backyard Pool",
    property: "ID: #P1456567",
    status: "approved",
    flagged: false,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300",
  },
  {
    id: 6,
    title: "Upload #892",
    property: "ID: #P5987123",
    status: "pending",
    flagged: true,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300",
  },
  {
    id: 7,
    title: "Master Bath...",
    property: "ID: #P1256789",
    status: "approved",
    flagged: false,
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=300",
  },
  {
    id: 8,
    title: "Drone Shot...",
    property: "ID: #P1456890",
    status: "pending",
    flagged: false,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=300",
  },
  {
    id: 9,
    title: "Garage B",
    property: "ID: #P5623456",
    status: "rejected",
    flagged: false,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
  },
  {
    id: 10,
    title: "Street View...",
    property: "ID: #P1234890",
    status: "pending",
    flagged: true,
    image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=300",
  },
];

export function MediaOversightPage() {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedItems.length === mediaItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mediaItems.map((i) => i.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Home / Admin / <span className="text-foreground">Media Oversight</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Media Oversight</h1>
        <p className="text-muted-foreground text-sm">
          Monitor uploaded content, review flagged items, and manage storage
          policies.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Storage"
          value="4.2 TB"
          change="+1% growth"
          changeType="neutral"
          icon={HardDrive}
        />
        <StatCard
          title="Flagged Items"
          value="12"
          change="Awaiting review"
          changeType="neutral"
          icon={AlertTriangle}
        />
        <StatCard
          title="Media Count"
          value="15,402"
          change="+120 today"
          changeType="positive"
          icon={ImageIcon}
        />
        <StatCard
          title="Duplicate Rate"
          value="1.5%"
          change="-0.3% improvement"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Media Grid */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, IP5 hash, or uploader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selection Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedItems.length === mediaItems.length}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">
              Selected {selectedItems.length}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedItems.length === 0}
              className="gap-1"
            >
              <Check className="size-4" />
              Select All
            </Button>
            <Button
              size="sm"
              disabled={selectedItems.length === 0}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="size-4" />
              Bulk Approve
            </Button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                selectedItems.includes(item.id)
                  ? "border-primary"
                  : "border-transparent hover:border-primary/50"
              }`}
            >
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="bg-white/80"
                />
              </div>
              {item.flagged && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="destructive" className="text-xs gap-1">
                    <Flag className="size-3" />
                    Flagged
                  </Badge>
                </div>
              )}
              <Image
                src={item.image}
                alt={item.title}
                className="w-full h-32 object-cover"
                width={300}
                height={128}
              />
              <div className="p-2 bg-card">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.property}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge
                    variant={
                      item.status === "approved"
                        ? "default"
                        : item.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className={`text-xs ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : ""
                    }`}
                  >
                    {item.status}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="size-6">
                      <Eye className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-destructive"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-center text-sm text-muted-foreground">
          <span>Page 1 of 42</span>
        </div>
      </div>
    </div>
  );
}
