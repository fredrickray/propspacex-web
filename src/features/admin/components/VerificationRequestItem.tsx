import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VerificationRequestItemProps {
  name: string;
  type: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  avatarSeed?: string;
}

export function VerificationRequestItem({
  name,
  type,
  date,
  status,
  avatarSeed,
}: VerificationRequestItemProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <Avatar className="size-10">
        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || name}`} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:block">{date}</span>
      <Badge
        variant={
          status === "pending"
            ? "outline"
            : status === "approved"
            ? "default"
            : "destructive"
        }
        className="capitalize"
      >
        {status}
      </Badge>
      {status === "pending" && (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50">
            <Check className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
