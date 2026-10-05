"use client";

import { AccountSettings } from "@/features/settings/account-settings";

export function SettingsPage() {
  return (
    <AccountSettings
      title="Account settings"
      description="Update the name and email on this admin account."
    />
  );
}
