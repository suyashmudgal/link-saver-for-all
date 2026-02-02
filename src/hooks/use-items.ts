import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Item {
  id: string;
  title: string;
  description?: string;
  type: "link" | "image" | "video" | "note";
  content: string;
  thumbnail_url?: string;
  folder_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  itemCount?: number;
}

// Query keys for cache management
export const queryKeys = {
  items: ["items"] as const,
  folders: ["folders"] as const,
  foldersWithCounts: ["folders", "withCounts"] as const,
};

// Fetch all items with caching
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
    staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });
};

// Fetch all folders with item counts
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
      // Add item counts to folders
      return folders.map(folder => ({
        ...folder,
        itemCount: items.filter(item => item.folder_id === folder.id).length
      }));
    },
  });
};

// Create item mutation
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<Item, "id" | "created_at" | "updated_at"> & { user_id: string }) => {
      const { data, error } = await supabase
        .from("items")
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch items
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Success!",
        description: "Item added to your vault.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item.",
        variant: "destructive",
      });
    },
  });
};

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Item> & { id: string }) => {
      const { data, error } = await supabase
        .from("items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Updated",
        description: "Item updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item.",
        variant: "destructive",
      });
    },
  });
};

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Deleted",
        description: "Item removed from your vault.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item.",
        variant: "destructive",
      });
    },
  });
};

// Move item to folder mutation
export const useMoveItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemId, folderId }: { itemId: string; folderId: string | null }) => {
      const { error } = await supabase
        .from("items")
        .update({ folder_id: folderId })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: (_, { folderId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Moved",
        description: folderId ? "Item moved to folder." : "Item removed from folder.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to move item.",
        variant: "destructive",
      });
    },
  });
};

// Create folder mutation
export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (folder: { name: string; description?: string; color: string; icon: string; user_id: string }) => {
      const { data, error } = await supabase
        .from("folders")
        .insert(folder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Created!",
        description: "Folder created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create folder.",
        variant: "destructive",
      });
    },
  });
};

// Update folder mutation
export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Folder> & { id: string }) => {
      const { data, error } = await supabase
        .from("folders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Renamed",
        description: "Folder renamed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to rename folder.",
        variant: "destructive",
      });
    },
  });
};

// Delete folder mutation
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.foldersWithCounts });
      toast({
        title: "Deleted",
        description: "Folder deleted. Items moved to root.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder.",
        variant: "destructive",
      });
    },
  });
};
