import { MapPin, Bell, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SavedSearchCardProps {
  id: string;
  name: string;
  location: string;
  filters: string[];
  matchCount: number;
  alertsEnabled: boolean;
  lastUpdated: string;
  onRun?: () => void;
  onDelete?: () => void;
  onToggleAlerts?: () => void;
}

const SavedSearchCard = ({
  name,
  location,
  filters,
  matchCount,
  alertsEnabled,
  lastUpdated,
  onRun,
  onDelete,
  onToggleAlerts,
}: SavedSearchCardProps) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            {alertsEnabled ? (
              <Badge variant="secondary" className="mt-1">
                <Bell className="size-3 mr-1" /> Alerts On
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-1 text-xs">
                Alerts off
              </Badge>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{lastUpdated}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline">{location}</Badge>
        {filters.map((filter, index) => (
          <Badge key={index} variant="outline">{filter}</Badge>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">
          {matchCount} properties match
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleAlerts}
            disabled={!onToggleAlerts}
            title="Toggle alerts"
          >
            <Bell className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
            disabled={!onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
          <Button type="button" size="sm" onClick={onRun} disabled={!onRun}>
            <Play className="size-4 mr-1" /> Run
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavedSearchCard;
