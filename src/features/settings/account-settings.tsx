"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, type User } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeAppearanceSettings } from "@/components/settings/theme-appearance-settings";

function initials(user: Pick<User, "firstName" | "lastName" | "email">) {
  const letters = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  return letters || user.email.slice(0, 2).toUpperCase() || "PS";
}

function roleLabel(role: string) {
  if (role === "admin") return "Admin";
  if (role === "agent") return "Agent";
  if (role === "buyer") return "Buyer";
  return "Account";
}

export function AccountSettings({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cached = api.getProfile();
    if (cached) {
      setUser(cached);
      setFirstName(cached.firstName);
      setLastName(cached.lastName);
      setEmail(cached.email);
    }
    void (async () => {
      try {
        const next = await api.fetchProfile();
        if (cancelled) return;
        setUser(next);
        setFirstName(next.firstName);
        setLastName(next.lastName);
        setEmail(next.email);
        setLoadError("");
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load your profile.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async () => {
    const nextFirst = firstName.trim();
    const nextLast = lastName.trim();
    const nextEmail = email.trim();
    if (!nextFirst || !nextLast || !nextEmail.includes("@")) {
      toast({
        title: "Check the profile fields",
        description: "First name, last name, and a valid email are required.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const next = await api.updateMyProfile({
        firstName: nextFirst,
        lastName: nextLast,
        email: nextEmail,
      });
      setUser(next);
      setFirstName(next.firstName);
      setLastName(next.lastName);
      setEmail(next.email);
      toast({ title: "Profile saved" });
    } catch (error) {
      toast({
        title: "Could not save profile",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendReset = async () => {
    const target = (user?.email || email).trim();
    if (!target) return;
    setResetting(true);
    try {
      const result = await api.requestPasswordReset(target);
      toast({
        title: "Reset email sent",
        description: result.message || `Check ${target} for the reset link.`,
      });
    } catch (error) {
      toast({
        title: "Could not send reset email",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const removeAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteMyAccount();
    } catch (error) {
      setDeleting(false);
      toast({
        title: "Could not delete account",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Name and email are stored on your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading profile
            </p>
          ) : null}
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : null}
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback>
                {initials({
                  firstName,
                  lastName,
                  email: email || user?.email || "",
                })}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {[firstName, lastName].filter(Boolean).join(" ") || "Your name"}
              </p>
              <p className="text-sm text-muted-foreground">
                {user ? roleLabel(user.appRole) : "Account"}
                {user?.isVerified ? " · Email verified" : " · Email not verified"}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-first-name">First name</Label>
              <Input
                id="settings-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-last-name">Last name</Label>
              <Input
                id="settings-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <Button type="button" onClick={() => void saveProfile()} disabled={saving || loading}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Light, dark, or match this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeAppearanceSettings />
        </CardContent>
      </Card>

      {children}

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            A reset link is sent to the email on this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => void sendReset()}
            disabled={resetting || !(user?.email || email)}
          >
            {resetting ? "Sending…" : "Email me a reset link"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            This removes the account and signs you out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={deleting || loading}>
                {deleting ? "Deleting…" : "Delete account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this account?</AlertDialogTitle>
                <AlertDialogDescription>
                  {email || "This account"} will be removed. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void removeAccount()}>
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
