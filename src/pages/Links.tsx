import { useState, useMemo } from "react";
import { useItems, useFolders, useDeleteItem, useToggleFavorite, useMoveItem, useMarkItemRead, Item } from "@/hooks/use-items";
import DashboardLayout from "@/components/DashboardLayout";
import ItemCard from "@/components/ItemCard";
import EditItemDialog from "@/components/EditItemDialog";
import ItemDetailModal from "@/components/ItemDetailModal";
import EmptyState from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/PageSkeletons";
import SearchFilters, { SearchFiltersState } from "@/components/SearchFilters";
import AddItemDialog from "@/components/AddItemDialog";
import { Link2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Links = () => {
  const { data: items = [], isLoading } = useItems();
  const { data: folders = [] } = useFolders();
  const deleteItem = useDeleteItem();
  const toggleFavorite = useToggleFavorite();
  const moveItem = useMoveItem();
  const markRead = useMarkItemRead();
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<SearchFiltersState>({
    query: "", types: [], dateRange: "all", favoritesOnly: false, tags: [],
  });

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(i => (i.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = filters.query.toLowerCase();
      const matchesSearch = q
        ? item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q) || (item.tags || []).some(t => t.includes(q))
        : true;
      const matchesType = filters.types.length > 0 ? filters.types.includes(item.type) : true;
      const matchesFavorite = filters.favoritesOnly ? item.is_favorite : true;
      const matchesTags = filters.tags.length > 0 ? filters.tags.every(t => (item.tags || []).includes(t)) : true;
      let matchesDate = true;
      if (filters.dateRange !== "all" && item.created_at) {
        const created = new Date(item.created_at);
        const now = new Date();
        if (filters.dateRange === "today") matchesDate = created.toDateString() === now.toDateString();
        else if (filters.dateRange === "week") matchesDate = now.getTime() - created.getTime() < 7 * 86400000;
        else if (filters.dateRange === "month") matchesDate = now.getTime() - created.getTime() < 30 * 86400000;
      }
      return matchesSearch && matchesType && matchesFavorite && matchesTags && matchesDate;
    });
  }, [items, filters]);

  const handleToggleFavorite = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) toggleFavorite.mutate({ id, is_favorite: !item.is_favorite });
  };

  const gridClass = viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 gold-divider" />
              <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">The Collection</p>
            </div>
            <h1 className="font-serif-display text-4xl tracking-tight leading-none flex items-center gap-3">
              <Link2 className="w-6 h-6 text-primary" strokeWidth={1.25} /> All Links
            </h1>
            <p className="text-sm text-muted-foreground mt-2">{filteredItems.length} of {items.length} items</p>
          </div>
          <AddItemDialog folders={folders} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchFilters filters={filters} onChange={setFilters} availableTags={availableTags} />
          </div>
          <div className="flex items-start border border-border/50 rounded-lg p-1 bg-card">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-8 w-8">
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="h-8 w-8">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <CardGridSkeleton count={8} columns={gridClass} />
        ) : filteredItems.length > 0 ? (
          <div className={`grid gap-4 ${gridClass}`}>
            {filteredItems.map(item => (
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
        ) : items.length === 0 ? (
          <EmptyState
            icon={Link2}
            kicker="The Collection"
            title="Nothing in the collection yet"
            description="Save your first link, note, image or video and it will appear here, neatly filed."
            action={<AddItemDialog folders={folders} />}
          />
        ) : (
          <EmptyState
            icon={Link2}
            kicker="No matches"
            title="Nothing matches those filters"
            description="Try a broader search term, or clear a filter or two to widen the view."
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

export default Links;
