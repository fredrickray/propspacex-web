import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

const requirements = [
  { label: "At least 12 characters", test: (p: string) => p.length >= 12 },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const passedCount = requirements.filter(r => r.test(password)).length;
  const strength = passedCount === 0 ? 0 : (passedCount / requirements.length) * 100;
  
  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };
  
  const getStrengthColor = () => {
    if (strength <= 25) return "bg-destructive";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3">
      {password && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Password Strength:</span>
            <span className={cn(
              "font-medium",
              strength <= 25 && "text-destructive",
              strength > 25 && strength <= 50 && "text-orange-500",
              strength > 50 && strength <= 75 && "text-yellow-500",
              strength > 75 && "text-green-500"
            )}>
              {getStrengthLabel()}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-300", getStrengthColor())}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Requirements:</p>
        <div className="grid grid-cols-2 gap-2">
          {requirements.map((req, index) => {
            const passed = req.test(password);
            return (
              <div 
                key={index}
                className="flex items-center gap-2 text-sm"
              >
                {passed ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <X className="size-4 text-muted-foreground" />
                )}
                <span className={cn(
                  passed ? "text-foreground" : "text-muted-foreground"
                )}>
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
