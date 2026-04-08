"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Link2,
  LogOut,
  Pencil,
  Shield,
  Sun,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ThemeAppearanceSettings } from "@/components/settings/theme-appearance-settings";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

type SettingsSectionId =
  | "profile"
  | "appearance"
  | "notifications"
  | "wallet"
  | "payouts"
  | "security";

const settingsNav: {
  id: SettingsSectionId;
  label: string;
  icon: typeof User;
}[] = [
  { id: "profile", label: "General Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "wallet", label: "Web3 Wallet", icon: Link2 },
  { id: "payouts", label: "Payouts & Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Standard Time (PST)" },
  { value: "America/Denver", label: "Mountain Standard Time (MST)" },
  { value: "America/Chicago", label: "Central Standard Time (CST)" },
  { value: "America/New_York", label: "Eastern Standard Time (EST)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Africa/Lagos", label: "West Africa Time (WAT)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
];

export default function AgentSettingsPage() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("profile");
  const sectionRefs = useRef<Partial<Record<SettingsSectionId, HTMLElement | null>>>(
    {},
  );

  const profile = useMemo(() => api.getProfile(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [bio, setBio] = useState(
    "Experienced real estate professional specializing in luxury residential and commercial properties. Committed to transparent transactions and client-first service.",
  );
  const [editingProfile, setEditingProfile] = useState(false);

  const [leadAlerts, setLeadAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const [securitySaving, setSecuritySaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    setFullName(name || "Agent");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const scrollTo = useCallback((id: SettingsSectionId) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSaveProfile = () => {
    toast({
      title: "Profile saved",
      description: "Your details are updated locally. Sync with the API when your endpoint is ready.",
    });
    setEditingProfile(false);
  };

  const handleLinkMetamask = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Install MetaMask or another Ethereum wallet to connect.",
        variant: "destructive",
      });
      return;
    }
    setWalletLoading(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const walletAddress = accounts?.[0];
      if (!walletAddress) throw new Error("No account selected");

      const res = await api.linkWeb3Wallet(walletAddress);
      setLinkedWallet(walletAddress);
      toast({
        title: "Wallet linked",
        description: res.message ?? "Your wallet is connected to this account.",
      });
    } catch (err) {
      toast({
        title: "Could not link wallet",
        description:
          err instanceof Error ? err.message : "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setWalletLoading(false);
    }
  };

  const handleSecuritySave = async () => {
    setSecuritySaving(true);
    await new Promise((r) => setTimeout(r, 600));
    toast({
      title: "Security preferences updated",
      description: "Password changes require a verified email when the API is wired.",
    });
    setSecuritySaving(false);
  };

  const initials =
    profile?.firstName?.[0] && profile?.lastName?.[0]
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "AG";

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-0 lg:flex-row lg:gap-0">
      {/* Inner settings sidebar */}
      <aside className="w-full shrink-0 border-b border-border bg-card lg:w-[260px] lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 border-b border-border px-4 py-4 lg:px-5">
          <PropSpaceLogo className="size-8 text-primary" />
          <span className="text-lg font-bold tracking-tight">PropSpace X</span>
        </div>
        <div className="px-4 py-4 lg:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Settings Menu
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage account preferences
          </p>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:px-3 lg:pb-6">
          {settingsNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                activeSection === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden border-t border-border p-3 lg:block">
          <button
            type="button"
            onClick={() => api.signout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1 bg-muted/30">
        <div className="space-y-6 p-4 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  Agent Settings
                </h1>
                <Badge
                  variant="secondary"
                  className="border border-primary/25 bg-primary/10 font-semibold text-primary"
                >
                  PRO PLAN
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground lg:text-base">
                Manage your professional profile, payout methods, and security
                preferences.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Bell className="size-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <HelpCircle className="size-5" />
                <span className="sr-only">Help</span>
              </Button>
              <Avatar className="size-9 border border-border">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Profile hero */}
          <section
            ref={(el) => {
              sectionRefs.current.profile = el;
            }}
            id="settings-profile"
            className="scroll-mt-24"
          >
            <Card className="overflow-hidden rounded-xl border-border shadow-sm">
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="relative">
                      <Avatar className="size-24 border-4 border-background shadow-md sm:size-28">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-card transition hover:bg-primary/90"
                        aria-label="Edit profile photo"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                        {fullName || "Your name"}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-emerald-600 sm:justify-start">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span className="font-medium">
                          Verified Agent | License #CA-59201
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Member since 2021 • Premier Brokerage Inc.
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="shrink-0">
                    View Public Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section
            ref={(el) => {
              sectionRefs.current.appearance = el;
            }}
            id="settings-appearance"
            className="scroll-mt-24"
          >
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Sun className="size-4 text-primary" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeAppearanceSettings />
              </CardContent>
            </Card>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Personal information */}
            <Card className="scroll-mt-24 rounded-xl border-border shadow-sm xl:col-span-2">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  Personal Information
                </CardTitle>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => setEditingProfile((e) => !e)}
                >
                  {editingProfile ? "Done" : "Edit Details"}
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!editingProfile}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!editingProfile}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-1234"
                    disabled={!editingProfile}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={timezone}
                    onValueChange={setTimezone}
                    disabled={!editingProfile}
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!editingProfile}
                    className="min-h-[120px] resize-y rounded-lg"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </button>
                  <Button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={!editingProfile}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Web3 */}
              <section
                ref={(el) => {
                  sectionRefs.current.wallet = el;
                }}
                id="settings-wallet"
                className="scroll-mt-24"
              >
                <Card className="rounded-xl border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <Wallet className="size-4 text-primary" />
                      Web3 Wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {linkedWallet ? (
                      <div className="rounded-lg border border-border bg-muted/40 p-4 text-center">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Linked wallet
                        </p>
                        <p className="mt-2 font-mono text-sm font-medium text-foreground break-all">
                          {linkedWallet.slice(0, 6)}…{linkedWallet.slice(-4)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center py-2 text-center">
                          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                            <Link2 className="size-6 text-muted-foreground" />
                          </div>
                          <p className="font-semibold text-foreground">
                            Connect Wallet
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Link a wallet to receive crypto payouts and verify
                            on-chain activity.
                          </p>
                        </div>
                        <Button
                          type="button"
                          className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                          onClick={handleLinkMetamask}
                          disabled={walletLoading}
                        >
                          {walletLoading ? "Connecting…" : "Connect MetaMask"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            toast({
                              title: "More wallets",
                              description: "WalletConnect and others can be added next.",
                            })
                          }
                        >
                          Other Wallets
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Notifications */}
              <section
                ref={(el) => {
                  sectionRefs.current.notifications = el;
                }}
                id="settings-notifications"
                className="scroll-mt-24"
              >
                <Card className="rounded-xl border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          Lead Alerts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Instant SMS for new leads
                        </p>
                      </div>
                      <Switch
                        checked={leadAlerts}
                        onCheckedChange={setLeadAlerts}
                        aria-label="Lead alerts"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          Marketing updates
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Product news and tips for agents
                        </p>
                      </div>
                      <Switch
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                        aria-label="Marketing emails"
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>

          {/* Payouts */}
          <section
            ref={(el) => {
              sectionRefs.current.payouts = el;
            }}
            id="settings-payouts"
            className="scroll-mt-24"
          >
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Payout Methods
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how you receive your commissions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Chase •••• 4242
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Primary · Checking
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                  </div>
                  <button
                    type="button"
                    className="flex min-h-[88px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                  >
                    <CreditCard className="mb-2 size-6" />
                    Add payout method
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Security */}
          <section
            ref={(el) => {
              sectionRefs.current.security = el;
            }}
            id="settings-security"
            className="scroll-mt-24"
          >
            <Card className="rounded-xl border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Security</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Keep your account protected with a strong password.
                </p>
              </CardHeader>
              <CardContent className="max-w-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className="rounded-lg"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSecuritySave}
                  disabled={securitySaving}
                >
                  {securitySaving ? "Saving…" : "Update password"}
                </Button>
              </CardContent>
            </Card>
          </section>

          <div className="pb-8 lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => api.signout()}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
