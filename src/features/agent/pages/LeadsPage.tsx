"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Search, CalendarDays, MessageSquare } from "lucide-react";

type LeadStatus = "new" | "contacted" | "viewing";

type Lead = {
  id: string;
  name: string;
  property: string;
  email: string;
  phone: string;
  source: string;
  date: string;
  status: LeadStatus;
  avatarUrl?: string;
};

const leads: Lead[] = [
  {
    id: "1",
    name: "Ahmed Al-Rashid",
    property: "Marina Bay Tower - Unit 1204",
    email: "ahmed@email.com",
    phone: "+971 50 123 4567",
    source: "Website",
    date: "Feb 27, 2026",
    status: "new",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
  },
  {
    id: "2",
    name: "Priya Sharma",
    property: "Palm Jumeirah Villa #8",
    email: "priya@email.com",
    phone: "+971 55 234 5678",
    source: "Referral",
    date: "Feb 26, 2026",
    status: "contacted",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  {
    id: "3",
    name: "John Mitchell",
    property: "Downtown Heights - Penthouse",
    email: "john@email.com",
    phone: "+971 52 345 6789",
    source: "Website",
    date: "Feb 25, 2026",
    status: "viewing",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
  {
    id: "4",
    name: "Fatima Hassan",
    property: "Marina Bay Tower - Unit 804",
    email: "fatima@email.com",
    phone: "+971 56 456 7890",
    source: "Social Media",
    date: "Feb 25, 2026",
    status: "new",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
  },
  {
    id: "5",
    name: "Mike Eissien",
    property: "Downtown Heights - Penthouse",
    email: "mike@email.com",
    phone: "+971 56 456 7890",
    source: "Social Media",
    date: "Feb 25, 2026",
    status: "new",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
  },
  {
    id: "6",
    name: "Yousef Al-Rashid",
    property: "Marina Bay Tower - Unit 804",
    email: "yousef@email.com",
    phone: "+971 56 456 7890",
    source: "Social Media",
    date: "Feb 25, 2026",
    status: "new",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
  },
  {
    id: "7",
    name: "Taha Al-Rashid",
    property: "Downtown Heights - Penthouse",
    email: "taha@email.com",
    phone: "+971 56 456 7890",
    source: "Social Media",
    date: "Feb 25, 2026",
    status: "new",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
  },
];

const badgeVariant = (status: LeadStatus) => {
  if (status === "new") return "default";
  if (status === "contacted") return "secondary";
  return "outline";
};

const LeadsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | LeadStatus>("all");

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const statusMatch = status === "all" || lead.status === status;
      const query = search.trim().toLowerCase();
      const textMatch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.property.toLowerCase().includes(query);
      return statusMatch && textMatch;
    });
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">
          Track and manage your property inquiries
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value: "all" | LeadStatus) => setStatus(value)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="viewing">Viewing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((lead) => (
          <div
            key={lead.id}
            className="rounded-xl border border-border bg-card p-4 flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <Avatar className="size-10">
                <AvatarImage src={lead.avatarUrl} />
                <AvatarFallback>{lead.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{lead.name}</p>
                  <Badge variant={badgeVariant(lead.status)} className="capitalize">
                    {lead.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{lead.property}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {lead.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" />
                    {lead.phone}
                  </span>
                  <span>Source: {lead.source}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {lead.date}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="size-4" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="size-4" />
                Message
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadsPage;
