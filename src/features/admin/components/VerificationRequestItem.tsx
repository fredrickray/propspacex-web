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
    <tr className="border-b border-border last:border-0 hover:bg-muted/20">
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || name}`}
            />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{name}</span>
        </div>
      </td>
      <td className="py-3 px-2 hidden sm:table-cell">
        <span className="text-sm text-muted-foreground">{type}</span>
      </td>
      <td className="py-3 px-2 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{date}</span>
      </td>
      <td className="py-3 px-2">
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
      </td>
      <td className="py-3 px-2 text-right">
        {status === "pending" && (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Check className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
