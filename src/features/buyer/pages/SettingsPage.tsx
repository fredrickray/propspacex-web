"use client";

import { useState } from "react";
import { User, Wallet, Bell, Shield, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { id: "general", label: "General", icon: User },
  { id: "wallet", label: "Wallet & Security", icon: Wallet },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-2">
        Dashboard &gt; Account &gt; Settings
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">
        Account Settings
      </h1>
      <p className="text-muted-foreground mb-6">
        Manage your personal profile, notification preferences, connected Web3
        wallets, and security settings.
      </p>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-56 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "wallet" && <WalletSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "privacy" && <PrivacySettings />}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Profile & Contact</CardTitle>
        <CardDescription>
          Update your public profile and contact details.
        </CardDescription>
      </div>
      <Button variant="link" className="text-primary">
        Edit Public Profile
      </Button>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5">
            <Camera className="size-3" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Allowed: *.png, *.jpg, *.jpeg
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input defaultValue="Alex" />
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input defaultValue="Morgan" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input type="email" defaultValue="alex.morgan@propspace.com" />
      </div>

      <div className="space-y-2">
        <Label>Role / Title</Label>
        <Input defaultValue="Head of Acquisitions" />
      </div>

      <Button className="w-full">Save Changes</Button>
    </CardContent>
  </Card>
);

const WalletSettings = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Wallet Management</CardTitle>
          <Badge className="bg-green-500/20 text-green-600 border-0">
            Web3 Active
          </Badge>
        </div>
        <CardDescription>
          Connect your crypto wallet for proof of funds and smart contract
          interactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-full p-2">
                <Wallet className="size-4" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Connected Wallet</p>
                <p className="font-mono text-sm">0x71C . . . 8A23 ◯</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Network</p>
              <p className="text-sm">● Ethereum Mainnet</p>
            </div>
            <Button variant="destructive" size="sm">
              Disconnect
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">
                  Extra layer of security
                </p>
              </div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Hardware Key</p>
                <p className="text-xs text-muted-foreground">
                  Ledger or Trezor
                </p>
              </div>
            </div>
            <Button variant="link" size="sm" className="text-primary">
              Setup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const NotificationSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>
        Choose how you want to be notified of activity.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Email Digests</p>
            <p className="text-xs text-muted-foreground">
              Receive a weekly summary of new properties matching your criteria.
            </p>
          </div>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Instant Property Alerts</p>
            <p className="text-xs text-muted-foreground">
              Get notified immediately when a high-priority asset hits the
              market.
            </p>
          </div>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Agent Messages</p>
            <p className="text-xs text-muted-foreground">
              Allow agents to message you directly through the platform.
            </p>
          </div>
        </div>
        <Switch />
      </div>
    </CardContent>
  </Card>
);

const PrivacySettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Privacy</CardTitle>
      <CardDescription>
        Control who can see your profile and data.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Private Profile</p>
            <p className="text-xs text-muted-foreground">
              When enabled, your profile is hidden from public directories.
            </p>
          </div>
        </div>
        <Switch />
      </div>

      <div className="mt-6">
        <p className="text-destructive font-medium text-sm mb-3">Danger Zone</p>
        <div className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SettingsPage;
