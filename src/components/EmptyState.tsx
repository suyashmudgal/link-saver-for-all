import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, kicker, title, description, action }: EmptyStateProps) => (
  <div className="relative overflow-hidden rounded-3xl border border-border/40 py-16 px-6 text-center animate-fade-in"
    style={{ background: "var(--gradient-hero)" }}>
    <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{ background: "var(--gradient-aurora)" }} />
    <div className="relative max-w-md mx-auto">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center">
        <Icon className="w-7 h-7 text-primary" strokeWidth={1.25} />
      </div>
      {kicker && (
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-8 gold-divider" />
          <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">{kicker}</p>
          <span className="w-8 gold-divider" />
        </div>
      )}
      <h2 className="font-serif-display text-2xl md:text-3xl leading-tight mb-2">{title}</h2>
      {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
      {action && <div className="mt-6 flex items-center justify-center gap-3">{action}</div>}
    </div>
  </div>
);

export default EmptyState;
