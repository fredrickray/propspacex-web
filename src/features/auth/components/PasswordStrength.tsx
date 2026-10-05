import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  tone?: "default" | "inverse";
  columns?: 1 | 2;
  showHeading?: boolean;
}

const requirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

export const PasswordStrength = ({
  password,
  tone = "default",
  columns = 1,
  showHeading = true,
}: PasswordStrengthProps) => {
  const inverse = tone === "inverse";

  return (
    <div className="space-y-2">
      {showHeading ? (
        <p
          className={cn(
            "text-sm font-medium",
            inverse ? "text-white/80" : "text-foreground",
          )}
        >
          Requirements
        </p>
      ) : null}
      <ul className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
        {requirements.map((req) => {
          const passed = req.test(password);
          return (
            <li key={req.label} className="flex items-center gap-2 text-sm">
              {passed ? (
                <Check
                  className={cn("size-4 shrink-0", inverse ? "text-white" : "text-green-600")}
                />
              ) : (
                <X
                  className={cn(
                    "size-4 shrink-0",
                    inverse ? "text-white/50" : "text-muted-foreground",
                  )}
                />
              )}
              <span
                className={cn(
                  passed
                    ? inverse
                      ? "text-white"
                      : "text-foreground"
                    : inverse
                      ? "text-white/70"
                      : "text-muted-foreground",
                )}
              >
                {req.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
