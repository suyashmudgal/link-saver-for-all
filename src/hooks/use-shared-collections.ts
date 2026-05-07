import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SharedCollection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  share_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface SharedCollectionItem {
  id: string;
  collection_id: string;
  item_id: string;
  added_at: string;
}

export const useSharedCollections = () => {
  return useQuery({
    queryKey: ["shared_collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_collections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get item counts
      const collections = data || [];
      const counts = await Promise.all(
        collections.map(async (c) => {
          const { count } = await supabase
            .from("shared_collection_items")
            .select("*", { count: "exact", head: true })
            .eq("collection_id", c.id);
          return { ...c, item_count: count || 0 };
        })
      );
      return counts as SharedCollection[];
    },
  });
};

export const useCreateSharedCollection = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (input: { title: string; description?: string; item_ids: string[]; user_id: string }) => {
      const { data: collection, error } = await supabase
        .from("shared_collections")
        .insert({ title: input.title, description: input.description, user_id: input.user_id })
        .select()
        .single();
      if (error) throw error;

      if (input.item_ids.length > 0) {
        const { error: itemsError } = await supabase
          .from("shared_collection_items")
          .insert(input.item_ids.map((item_id) => ({ collection_id: collection.id, item_id })));
        if (itemsError) throw itemsError;
      }
      return collection;
    },
    onSuccess: (collection) => {
      qc.invalidateQueries({ queryKey: ["shared_collections"] });
      const shareUrl = `${window.location.origin}/shared/${collection.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Collection created!", description: "Share link copied to clipboard." });
    },
    onError: (e: Error) => {
      toast({ title: "Error creating collection", description: e.message, variant: "destructive" });
    },
  });
};

export const useToggleCollectionActive = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("shared_collections").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { is_active }) => {
      qc.invalidateQueries({ queryKey: ["shared_collections"] });
      toast({ title: is_active ? "Link activated" : "Link deactivated" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

export const useDeleteSharedCollection = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shared_collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shared_collections"] });
      toast({ title: "Collection deleted" });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
};

// Public fetch (no auth needed)
export const usePublicCollection = (token: string) => {
  return useQuery({
    queryKey: ["public_collection", token],
    enabled: !!token,
    queryFn: async () => {
      const { data: collections, error } = await supabase
        .rpc("get_shared_collection_by_token", { _token: token });
      if (error) throw error;
      const collection = Array.isArray(collections) ? collections[0] : collections;
      if (!collection) throw new Error("Collection not found");

      const { data: collectionItems, error: itemsError } = await supabase
        .from("shared_collection_items")
        .select("item_id")
        .eq("collection_id", collection.id);
      if (itemsError) throw itemsError;

      const itemIds = (collectionItems || []).map((ci) => ci.item_id);
      if (itemIds.length === 0) return { collection, items: [] };

      const { data: items, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .in("id", itemIds);
      if (fetchError) throw fetchError;

      return { collection, items: items || [] };
    },
  });
};
