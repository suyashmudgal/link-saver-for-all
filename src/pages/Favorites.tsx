import { useMemo, useState } from "react";
import { Star, Search } from "lucide-react";
import { useItems, useFolders, useDeleteItem, useToggleFavorite, useMoveItem, useMarkItemRead, Item } from "@/hooks/use-items";
import DashboardLayout from "@/components/DashboardLayout";
import ItemCard from "@/components/ItemCard";
import EditItemDialog from "@/components/EditItemDialog";
import ItemDetailModal from "@/components/ItemDetailModal";
import EmptyState from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/PageSkeletons";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Favorites = () => {
  const { data: items = [], isLoading } = useItems();
  const { data: folders = [] } = useFolders();
  const deleteItem = useDeleteItem();
  const toggleFavorite = useToggleFavorite();
  const moveItem = useMoveItem();
  const markRead = useMarkItemRead();
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const favorites = useMemo(() => {
    return items.filter(i => {
      if (!i.is_favorite) return false;
      if (query) {
        const q = query.toLowerCase();
        return i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, query]);

  const handleToggleFavorite = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) toggleFavorite.mutate({ id, is_favorite: !item.is_favorite });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 gold-divider" />
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">Kept Close</p>
          </div>
          <h1 className="font-serif-display text-4xl tracking-tight leading-none flex items-center gap-3">
            <Star className="w-6 h-6 text-primary fill-primary/30" strokeWidth={1.25} /> Favorites
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{favorites.length} favorite item{favorites.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border/50"
          />
        </div>

        {isLoading ? (
          <CardGridSkeleton count={8} />
        ) : favorites.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map(item => (
              <ItemCard
                key={item.id} id={item.id} title={item.title} description={item.description}
                type={item.type} content={item.content} thumbnailUrl={item.thumbnail_url}
                folderId={item.folder_id} createdAt={item.created_at} updatedAt={item.updated_at}
                tags={item.tags} isFavorite={item.is_favorite}
                linkStatus={item.link_status} archiveUrl={item.archive_url}
                unlockDate={item.unlock_date} futureMessage={item.future_message}
                isLocked={item.is_locked} saveReason={item.save_reason} isRead={item.is_read}
                onDelete={id => setDeleteId(id)}
                onMoveToFolder={(itemId, folderId) => moveItem.mutate({ itemId, folderId })}
                onEdit={id => { const item = items.find(i => i.id === id); if (item) setEditItem(item); }}
                onOpenDetail={id => { const found = items.find(i => i.id === id); if (found) setDetailItem(found); }}
                folders={folders} onToggleFavorite={handleToggleFavorite}
                onMarkRead={id => markRead.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Star}
            kicker="Kept Close"
            title={query ? "No favorites match that search" : "Nothing starred yet"}
            description={query
              ? "Try a different word — favorites are searched by title and content."
              : "Star anything worth returning to and it will live here, one click away."}
          />
        )}
      </div>

      <EditItemDialog item={editItem} open={!!editItem} onOpenChange={open => !open && setEditItem(null)} folders={folders} />
      <ItemDetailModal
        item={detailItem} folders={folders} open={!!detailItem}
        onOpenChange={open => !open && setDetailItem(null)}
        onEdit={id => { const found = items.find(i => i.id === id); if (found) setEditItem(found); }}
        onDelete={id => setDeleteId(id)}
        onToggleFavorite={handleToggleFavorite}
      />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) { deleteItem.mutate(deleteId); setDeleteId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Favorites;
