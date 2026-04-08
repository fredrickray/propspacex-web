"use client";

import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CheckCircle,
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { api } from "@/lib/api";
import {
  normalizePropertyForDetail,
  unwrapSingleProperty,
  type NormalizedPropertyDetail,
} from "@/lib/property-normalize";
import { useCommunications } from "@/features/communications/communications-context";
import { useToast } from "@/components/ui/use-toast";

const ContactAgentPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");
  const propertyId = typeof id === "string" ? id : "";
  const { submitContactLead } = useCommunications();
  const { toast } = useToast();

  const [detail, setDetail] = useState<NormalizedPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex@example.com");
  const [phone, setPhone] = useState("+1 (555) 000-0000");
  const [message, setMessage] = useState(
    intent === "tour"
      ? "I would like to schedule a tour of this property. Please share your availability.\n\nThank you."
      : "Hi, I'm interested in this listing. I'd appreciate more details and next steps.\n\nThank you.",
  );

  useEffect(() => {
    setMessage(
      intent === "tour"
        ? "I would like to schedule a tour of this property. Please share your availability.\n\nThank you."
        : "Hi, I'm interested in this listing. I'd appreciate more details and next steps.\n\nThank you.",
    );
  }, [intent]);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const raw = await api.getPropertyById(propertyId);
      const row = normalizePropertyForDetail(unwrapSingleProperty(raw));
      setDetail(row);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    setSubmitting(true);
    try {
      const { conversationId } = submitContactLead({
        propertyId,
        propertyTitle: detail.title,
        buyerName: name.trim(),
        buyerEmail: email.trim(),
        phone: phone.trim(),
        intent,
        message: message.trim(),
      });
      toast({
        title: "Inquiry sent",
        description: "Your thread is in Messages. The agent can reply with a quote under Deals.",
      });
      router.push(`/buyer/messages?conv=${encodeURIComponent(conversationId)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PropSpaceLogo className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">PropSpace X</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Buying as</span>
            <span className="font-medium">{name || "Guest"}</span>
            <Avatar className="size-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{(name || "G").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href={`/buyer/property/${propertyId || "1"}`}
          className="inline-flex items-center text-primary text-sm hover:underline mb-4"
        >
          <ArrowLeft className="size-4 mr-1" /> Back to listing
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-1">
          {intent === "tour" ? "Schedule a tour" : "Contact agent"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {intent === "tour"
            ? "Pick a time to visit with the listing agent."
            : "Start a thread — quotes and escrow funding continue in your dashboard."}
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12">
            <Loader2 className="size-6 animate-spin" />
            Loading listing…
          </div>
        ) : !detail ? (
          <p className="text-destructive">We could not load this property.</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>LA</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">Listing agent</h3>
                        <CheckCircle className="size-4 text-primary fill-primary/20" />
                      </div>
                      <p className="text-sm text-muted-foreground">Verified on PropSpace X</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button type="button" variant="outline" className="w-full" disabled>
                      <Phone className="size-4 mr-2" /> Call
                    </Button>
                    <Button type="button" variant="outline" className="w-full" disabled>
                      <MessageSquare className="size-4 mr-2" /> WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-40 h-28 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={detail.image}
                        alt=""
                        className="object-cover"
                        fill
                        sizes="160px"
                      />
                      <Badge className="absolute bottom-2 left-2 bg-primary">{detail.badge}</Badge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Ref. {propertyId}</p>
                      <h4 className="font-semibold text-foreground line-clamp-2">{detail.title}</h4>
                      <p className="text-xl font-bold text-primary mt-1">{detail.price}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-2">
                        <MapPin className="size-3 mr-1 shrink-0" />
                        <span className="line-clamp-2">{detail.location}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-6">Send inquiry</h3>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ca-name">Full name</Label>
                      <Input
                        id="ca-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ca-email">Email</Label>
                      <Input
                        id="ca-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ca-phone">Phone</Label>
                    <Input
                      id="ca-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ca-msg">Message</Label>
                    <Textarea
                      id="ca-msg"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="mortgage" />
                    <label htmlFor="mortgage" className="text-sm text-muted-foreground leading-tight">
                      I am interested in mortgage pre-approval
                    </label>
                  </div>
                  <Button className="w-full" size="lg" type="submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Send inquiry →"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    By sending, you agree to PropSpace X terms and privacy policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAgentPage;
