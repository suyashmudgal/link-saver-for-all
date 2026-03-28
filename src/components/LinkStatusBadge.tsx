import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Archive } from "lucide-react";

interface LinkStatusBadgeProps {
  status?: string;
  archiveUrl?: string;
  compact?: boolean;
}

const LinkStatusBadge = ({ status, archiveUrl, compact = false }: LinkStatusBadgeProps) => {
  if (!status || status === "unchecked") {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] gap-1">
        <Loader2 className="w-3 h-3" />
        {!compact && "Checking"}
      </Badge>
    );
  }

  if (status === "alive") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] gap-1">
        <CheckCircle className="w-3 h-3" />
        {!compact && "Live"}
      </Badge>
    );
  }

  if (status === "redirected") {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] gap-1">
        <AlertTriangle className="w-3 h-3" />
        {!compact && "Redirected"}
      </Badge>
    );
  }

  if (status === "dead") {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1">
          <XCircle className="w-3 h-3" />
          {!compact && "Dead"}
        </Badge>
        {archiveUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px] gap-1 text-primary hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              window.open(archiveUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <Archive className="w-3 h-3" />
            Archive
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default LinkStatusBadge;
