"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountSettings } from "@/features/settings/account-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

function AgentWalletSettings() {
  const { toast } = useToast();
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const handleLinkMetamask = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Install MetaMask to connect a wallet to this account.",
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
        description: res.message || "Your wallet is connected to this account.",
      });
    } catch (error) {
      toast({
        title: "Could not link wallet",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>
          Payouts stay on the wallet screen. A linked wallet is stored on this account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {linkedWallet ? (
          <p className="break-all font-mono text-sm">
            {linkedWallet.slice(0, 6)}…{linkedWallet.slice(-4)}
          </p>
        ) : (
          <Button type="button" onClick={() => void handleLinkMetamask()} disabled={walletLoading}>
            {walletLoading ? "Connecting…" : "Connect MetaMask"}
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/agent/wallet">Open wallet</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AgentSettingsPage() {
  return (
    <AccountSettings
      title="Account settings"
      description="Update your name, email, appearance, and password."
    >
      <AgentWalletSettings />
    </AccountSettings>
  );
}
