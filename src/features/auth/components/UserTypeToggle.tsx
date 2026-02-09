import { cn } from "@/lib/utils";

type UserType = "buyer" | "agent";

interface UserTypeToggleProps {
  value: UserType;
  onChange: (value: UserType) => void;
}

export const UserTypeToggle = ({ value, onChange }: UserTypeToggleProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        Join as a
      </label>
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => onChange("buyer")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            value === "buyer" 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Buyer
        </button>
        <button
          type="button"
          onClick={() => onChange("agent")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            value === "agent" 
              ? "bg-primary text-primary-foreground" 
              : "bg-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Agent / Owner
        </button>
      </div>
    </div>
  );
};
