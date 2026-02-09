import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityItemProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
  time: string;
}

export function RecentActivityItem({
  icon: Icon,
  iconColor = "text-primary",
  title,
  description,
  time,
}: RecentActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div
        className={cn(
          "size-8 rounded-full flex items-center justify-center bg-primary/10 shrink-0",
          iconColor
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}
