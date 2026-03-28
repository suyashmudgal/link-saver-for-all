import { useState } from "react";
import { Brain, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface RecallContextButtonProps {
  title: string;
  saveReason?: string;
  savedDate?: string;
}

const RecallContextButton = ({ title, saveReason, savedDate }: RecallContextButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recall, setRecall] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecall = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setRecall(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("recall-context", {
        body: {
          title,
          save_reason: saveReason,
          saved_date: savedDate
            ? new Date(savedDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : undefined,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setRecall(data?.recall || "No context available.");
    } catch (e: any) {
      setError(e?.message || "Failed to recall context.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-primary"
        onClick={(e) => {
          e.stopPropagation();
          handleRecall();
        }}
      >
        <Brain className="w-3 h-3" />
        Recall
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Context Recall
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium line-clamp-2">{title}</p>
            {saveReason && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">Your reason:</p>
                <p className="text-sm italic">"{saveReason}"</p>
              </div>
            )}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 min-h-[80px]">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : (
                <p className="text-sm leading-relaxed">{recall}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecallContextButton;
