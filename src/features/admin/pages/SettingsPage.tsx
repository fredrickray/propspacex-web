"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Users,
  Plug,
  Upload,
  Globe,
  DollarSign,
  Clock,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";

export function SettingsPage() {
  const [walletAuth, setWalletAuth] = useState(true);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        Home / Admin / <span className="text-foreground">Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure platform behavior, user roles, and security permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Discard</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="size-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" />
            <span className="hidden sm:inline">Security & Auth</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="size-4" />
            <span className="hidden sm:inline">User Roles</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Plug className="size-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-6">Platform Identity</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="size-20 bg-muted rounded-lg flex items-center justify-center text-primary">
                    <PropSpaceLogo className="size-12" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="size-4" />
                      Upload New
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 512x512px PNG
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    defaultValue="PropSpace X"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    defaultValue="admin@propspacex.com"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="size-4" />
                  Default Currency
                </Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">United States Dollar</SelectItem>
                    <SelectItem value="eur">Euro</SelectItem>
                    <SelectItem value="gbp">British Pound</SelectItem>
                    <SelectItem value="aed">UAE Dirham</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Timezone
                </Label>
                <Select defaultValue="gmt4">
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmt4">
                      GMT+04:00 Eastern Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="gmt0">GMT+00:00 London</SelectItem>
                    <SelectItem value="gmt8">GMT+08:00 Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Web3 Configuration */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Wallet className="size-5" />
              Web3 Configuration
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Wallet Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to sign up and sign in using their crypto
                    wallets (MetaMask, WalletConnect).
                  </p>
                </div>
                <Switch checked={walletAuth} onCheckedChange={setWalletAuth} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Blockchain Network</Label>
                  <Select defaultValue="ethereum">
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                      <SelectItem value="optimism">Optimism</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Required Confirmation Blocks</Label>
                  <Input type="number" defaultValue="12" />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Irreversible actions that affect the entire platform. Proceed with
              caution.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                Reset Platform Data
              </Button>
              <Button variant="destructive">Enter Maintenance Mode</Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-6">Authentication Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Auto-logout after inactivity
                  </p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Login Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Email alerts for new logins
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-6">User Roles & Permissions</h3>
            <div className="space-y-4">
              {["Super Admin", "Admin", "Moderator", "Agent", "Buyer"].map(
                (role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/shapes/svg?seed=${role}`}
                        />
                        <AvatarFallback>{role.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{role}</p>
                        <p className="text-sm text-muted-foreground">
                          {role === "Super Admin"
                            ? "Full access to all settings"
                            : role === "Admin"
                              ? "Manage users and content"
                              : role === "Moderator"
                                ? "Review and approve content"
                                : role === "Agent"
                                  ? "List and manage properties"
                                  : "Browse and save properties"}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit Permissions
                    </Button>
                  </div>
                ),
              )}
            </div>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-6">Connected Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "MetaMask", status: "connected", icon: Wallet },
                { name: "WalletConnect", status: "connected", icon: Wallet },
                {
                  name: "Stripe Payments",
                  status: "disconnected",
                  icon: DollarSign,
                },
                { name: "Google Maps", status: "connected", icon: Globe },
              ].map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center">
                      <service.icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p
                        className={`text-xs ${
                          service.status === "connected"
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {service.status === "connected"
                          ? "Connected"
                          : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      service.status === "connected" ? "outline" : "default"
                    }
                    size="sm"
                  >
                    {service.status === "connected" ? "Configure" : "Connect"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
