"use client";

import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";

/** Profile cookie is only available in the browser. Stay null until mount so SSR matches. */
export function useSignedInProfile(): User | null {
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    setProfile(api.getProfile());
  }, []);

  return profile;
}
