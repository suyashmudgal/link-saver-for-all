import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";

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
  // Link Decay
  link_status?: string;
  archive_url?: string;
  last_checked_at?: string;
  // Time Capsule
  unlock_date?: string;
  future_message?: string;
  is_locked?: boolean;
  // Context Memory
  save_reason?: string;
  // Read tracking
  is_read?: boolean;
  // Priority Read Queue
  snoozed_until?: string;
  priority?: string;
  read_at?: string;
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
  itemsByUser: (userId?: string) => ["items", userId ?? "anonymous"] as const,
  folders: ["folders"] as const,
  foldersWithCounts: ["folders", "withCounts"] as const,
  foldersWithCountsByUser: (userId?: string) => ["folders", "withCounts", userId ?? "anonymous"] as const,
};

export const useItems = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.itemsByUser(user?.id),
    enabled: !!user && !authLoading,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id)
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
  const { user, loading: authLoading } = useAuth();
  const { data: items = [] } = useItems();

  return useQuery({
    queryKey: queryKeys.foldersWithCountsByUser(user?.id),
    enabled: !!user && !authLoading,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id)
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
      // Fetch item before deleting for undo
      const { data: item } = await supabase.from("items").select("*").eq("id", id).single();
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
      return item;
    },
    onSuccess: (deletedItem) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "🗑️ Deleted",
        description: deletedItem ? `"${deletedItem.title}" removed.` : "Item removed from your vault.",
        action: deletedItem ? (
          <ToastAction altText="Undo" onClick={async () => {
            const { id: _id, created_at, updated_at, ...rest } = deletedItem;
            await supabase.from("items").insert({ ...rest, id: _id });
            queryClient.invalidateQueries({ queryKey: queryKeys.items });
            queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
          }}>
            Undo
          </ToastAction>
        ) : undefined,
      });
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
    onSuccess: (_, { id, is_favorite }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      toast({
        title: is_favorite ? "⭐ Added to Favorites" : "💔 Removed from Favorites",
        description: is_favorite ? "You can find it in your Favorites tab." : "Item unfavorited.",
        action: (
          <ToastAction altText="Undo" onClick={async () => {
            await supabase.from("items").update({ is_favorite: !is_favorite }).eq("id", id);
            queryClient.invalidateQueries({ queryKey: queryKeys.items });
          }}>
            Undo
          </ToastAction>
        ),
      });
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
      const { data: prev } = await supabase.from("items").select("folder_id").eq("id", itemId).single();
      const { error } = await supabase.from("items").update({ folder_id: folderId }).eq("id", itemId);
      if (error) throw error;
      return prev?.folder_id ?? null;
    },
    onSuccess: (prevFolderId, { itemId, folderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: folderId ? "📁 Moved to Folder" : "📤 Removed from Folder",
        description: folderId ? "Item organized into folder." : "Item moved to root.",
        action: (
          <ToastAction altText="Undo" onClick={async () => {
            await supabase.from("items").update({ folder_id: prevFolderId }).eq("id", itemId);
            queryClient.invalidateQueries({ queryKey: queryKeys.items });
            queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
          }}>
            Undo
          </ToastAction>
        ),
      });
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("items")
      .select("id, title, content")
      .eq("user_id", user.id)
      .eq("content", url)
      .limit(1);
    return data && data.length > 0 ? data[0] as Item : null;
  };
};

// Mark item as read
export const useMarkItemRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("items").update({ is_read: true }).eq("id", id);
      if (error) throw error;
      // Also record the visit
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("link_visits").insert({ link_id: id, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  });
};
