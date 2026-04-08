"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export function ThemeAppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-24 animate-pulse rounded-lg bg-muted"
        aria-hidden
      />
    );
  }

  const value = theme ?? "system";

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base">Theme</Label>
        <p className="text-sm text-muted-foreground">
          Choose how PropSpace X looks. System follows your device setting.
        </p>
      </div>
      <RadioGroup
        value={value}
        onValueChange={(v) => setTheme(v)}
        className="grid gap-3 sm:grid-cols-3"
      >
        {(
          [
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" },
            { id: "system", label: "System" },
          ] as const
        ).map((opt) => (
          <label
            key={opt.id}
            htmlFor={`theme-${opt.id}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
              value === opt.id
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50",
            )}
          >
            <RadioGroupItem value={opt.id} id={`theme-${opt.id}`} />
            <span className="text-sm font-medium leading-none">{opt.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
