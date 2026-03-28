import { Lock, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface TimeCapsuleCardProps {
  unlockDate: string;
  futureMessage?: string;
  isLocked: boolean;
}

const formatCountdown = (targetDate: string): string => {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return "Opening soon...";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `Opens in ${days}d ${hours}h`;
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `Opens in ${hours}h ${mins}m`;
};

export const LockedCapsuleCard = ({ unlockDate }: { unlockDate: string }) => {
  const [countdown, setCountdown] = useState(formatCountdown(unlockDate));

  useEffect(() => {
    const timer = setInterval(() => setCountdown(formatCountdown(unlockDate)), 60000);
    return () => clearInterval(timer);
  }, [unlockDate]);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="p-6 text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">Locked Capsule 🔒</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{countdown}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          This content will be revealed on{" "}
          {new Date(unlockDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </Card>
  );
};

export const FutureMessageBox = ({ message }: { message: string }) => (
  <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
    <p className="text-xs text-muted-foreground mb-1 font-medium">💌 Message from past you:</p>
    <p className="text-sm italic leading-relaxed">"{message}"</p>
  </div>
);

export const CapsuleBadge = () => (
  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1">
    <Lock className="w-3 h-3" />
    Capsule
  </Badge>
);

export default TimeCapsuleCardProps;
