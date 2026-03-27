import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export interface Item {
  id: string;
  title: string;
  description?: string;
  type: "link" | "image" | "video" | "note";
  content: string;
  thumbnail_url?: string;
  folder_id?: string;
  tags?: string[];
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parent_id?: string | null;
  itemCount?: number;
  subfolderCount?: number;
}

export const queryKeys = {
  items: ["items"] as const,
  folders: ["folders"] as const,
  foldersWithCounts: ["folders", "withCounts"] as const,
};

export const useItems = () => {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Item[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useFolders = () => {
  const { data: items = [] } = useItems();
  return useQuery({
    queryKey: queryKeys.foldersWithCounts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Folder[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    select: (folders) => {
      return folders.map(folder => ({
        ...folder,
        itemCount: items.filter(item => item.folder_id === folder.id).length,
        subfolderCount: folders.filter(f => f.parent_id === folder.id).length,
      }));
    },
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (item: Omit<Item, "id" | "created_at" | "updated_at"> & { user_id: string }) => {
      const { data, error } = await supabase.from("items").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "✅ Item saved!",
        description: `"${data.title}" added to your vault.`,
        action: (
          <ToastAction altText="Undo" onClick={async () => {
            await supabase.from("items").delete().eq("id", data.id);
            queryClient.invalidateQueries({ queryKey: queryKeys.items });
            queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
          }}>
            Undo
          </ToastAction>
        ),
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add item.", variant: "destructive" });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase.from("items").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Updated", description: "Item updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update item.", variant: "destructive" });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Deleted", description: "Item removed from your vault." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete item.", variant: "destructive" });
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase.from("items").update({ is_favorite }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { is_favorite }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      toast({ title: is_favorite ? "⭐ Favorited" : "Unfavorited", description: is_favorite ? "Added to favorites." : "Removed from favorites." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useMoveItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ itemId, folderId }: { itemId: string; folderId: string | null }) => {
      const { error } = await supabase.from("items").update({ folder_id: folderId }).eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Moved", description: folderId ? "Item moved to folder." : "Item removed from folder." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to move item.", variant: "destructive" });
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (folder: { name: string; description?: string; color: string; icon: string; user_id: string; parent_id?: string }) => {
      const { data, error } = await supabase.from("folders").insert(folder).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Created!", description: "Folder created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create folder.", variant: "destructive" });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Folder> & { id: string }) => {
      const { data, error } = await supabase.from("folders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Renamed", description: "Folder renamed successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to rename folder.", variant: "destructive" });
    },
  });
};

export const useMoveFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ folderId, parentId }: { folderId: string; parentId: string | null }) => {
      const { error } = await supabase.from("folders").update({ parent_id: parentId }).eq("id", folderId);
      if (error) throw error;
    },
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Moved", description: parentId ? "Folder moved successfully." : "Folder moved to root." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to move folder.", variant: "destructive" });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("folders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({ title: "Deleted", description: "Folder deleted. Items moved to root." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete folder.", variant: "destructive" });
    },
  });
};

// Utility: detect link type from URL
export const detectLinkType = (url: string): "link" | "video" | "image" | "note" => {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com")) return "video";
  if (lower.includes("github.com") || lower.includes("gitlab.com") || lower.includes("bitbucket.org")) return "link";
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(lower)) return "image";
  if (/\.(mp4|webm|mov|avi)(\?|$)/i.test(lower)) return "video";
  return "link";
};

// Check for duplicate URL
export const useCheckDuplicate = () => {
  return async (url: string): Promise<Item | null> => {
    const { data } = await supabase
      .from("items")
      .select("id, title, content")
      .eq("content", url)
      .limit(1);
    return data && data.length > 0 ? data[0] as Item : null;
  };
};
