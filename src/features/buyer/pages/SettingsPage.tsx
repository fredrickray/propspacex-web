"use client";

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

const SettingsPage = () => (
  <AccountSettings
    title="Account settings"
    description="Update your name, email, appearance, and password."
  >
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>
          Balances, escrow holds, and release stay on the wallet screen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/buyer/wallet">Open wallet</Link>
        </Button>
      </CardContent>
    </Card>
  </AccountSettings>
);

export default SettingsPage;
