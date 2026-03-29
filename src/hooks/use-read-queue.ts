import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/hooks/use-items";

export const useSnoozeItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: string }) => {
      const now = new Date();
      let snoozedUntil: Date;
      switch (duration) {
        case "1day": snoozedUntil = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); break;
        case "3days": snoozedUntil = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); break;
        case "1week": snoozedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
        case "1month": snoozedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
        default: snoozedUntil = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      }
      const { error } = await supabase
        .from("items")
        .update({ snoozed_until: snoozedUntil.toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { duration }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      const labels: Record<string, string> = {
        "1day": "1 day", "3days": "3 days", "1week": "1 week", "1month": "1 month",
      };
      toast({ title: "😴 Snoozed", description: `Link snoozed for ${labels[duration] || duration}.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUnsnooze = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("items")
        .update({ snoozed_until: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      toast({ title: "⏰ Unsnoozed", description: "Link is back in your queue." });
    },
  });
};

export const useSetPriority = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: string }) => {
      const { error } = await supabase
        .from("items")
        .update({ priority })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { priority }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      const icons: Record<string, string> = { high: "🔥", normal: "📌", low: "📎" };
      toast({ title: `${icons[priority] || "📌"} Priority set`, description: `Priority changed to ${priority}.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};
