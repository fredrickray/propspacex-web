"use client";

import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";

/** Profile cookie is only available in the browser. Stay null until mount so SSR matches. */
export function useSignedInProfile(): User | null {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    const sync = () => setProfile(api.getProfile());
    sync();
    window.addEventListener("propspacex-profile-updated", sync);
    return () => window.removeEventListener("propspacex-profile-updated", sync);
  }, []);

  return profile;
}
