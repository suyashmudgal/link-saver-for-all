import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useItems, useFolders, useDeleteItem, useDeleteFolder, 
  useUpdateFolder, useMoveItem, useMoveFolder, useToggleFavorite, useMarkItemRead, Item, Folder
} from "@/hooks/use-items";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Loader2, Database, FolderOpen, LayoutGrid, List, Zap, 
  ChevronRight, ArrowLeft, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import ItemCard from "@/components/ItemCard";
import FolderCard from "@/components/FolderCard";
import AddItemDialog from "@/components/AddItemDialog";
import CreateFolderDialog from "@/components/CreateFolderDialog";
import EditItemDialog from "@/components/EditItemDialog";
import CreateShareDialog from "@/components/CreateShareDialog";
import SearchFilters, { SearchFiltersState } from "@/components/SearchFilters";

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ type: "folder" | "item"; id: string } | null>(null);
  const [renameDialog, setRenameDialog] = useState<Folder | null>(null);
  const [renameName, setRenameName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [filters, setFilters] = useState<SearchFiltersState>({
    query: "", types: [], dateRange: "all", favoritesOnly: false, tags: [],
  });

  const { data: items = [], isLoading: itemsLoading, isFetching: itemsFetching } = useItems();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const deleteItem = useDeleteItem();
  const deleteFolder = useDeleteFolder();
  const updateFolder = useUpdateFolder();
  const moveItem = useMoveItem();
  const moveFolder = useMoveFolder();
  const toggleFavorite = useToggleFavorite();
  const markRead = useMarkItemRead();

  const loading = itemsLoading || foldersLoading;

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(i => (i.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [items]);

  const handleDeleteItem = (id: string) => { deleteItem.mutate(id); setDeleteDialog(null); };
  const handleDeleteFolder = (id: string) => { deleteFolder.mutate(id); setDeleteDialog(null); setSelectedFolder(null); };
  const handleRenameFolder = () => {
    if (!renameDialog || !renameName.trim()) return;
    updateFolder.mutate({ id: renameDialog.id, name: renameName.trim() });
    setRenameDialog(null);
  };
  const handleMoveToFolder = (itemId: string, folderId: string | null) => { moveItem.mutate({ itemId, folderId }); };
  const handleMoveFolder = (folderId: string, parentId: string | null) => { moveFolder.mutate({ folderId, parentId }); };
  const handleEditItem = (id: string) => { const item = items.find(i => i.id === id); if (item) setEditItem(item); };
  const handleToggleFavorite = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) toggleFavorite.mutate({ id, is_favorite: !item.is_favorite });
  };
  const handleMarkRead = (id: string) => { markRead.mutate(id); };

  const handleExportCSV = () => {
    const headers = ["Title", "Type", "URL/Content", "Description", "Tags", "Favorite", "Folder", "Created At"];
    const rows = items.map(item => {
      const folder = folders.find(f => f.id === item.folder_id);
      return [
        item.title,
        item.type,
        item.content,
        item.description || "",
        (item.tags || []).join("; "),
        item.is_favorite ? "Yes" : "No",
        folder?.name || "",
        new Date(item.created_at).toLocaleDateString(),
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infotrunk-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const subfolders = useMemo(() => {
    if (!selectedFolder) return [];
    return folders.filter(f => f.parent_id === selectedFolder.id);
  }, [folders, selectedFolder]);

  const rootFolders = useMemo(() => folders.filter(f => !f.parent_id), [folders]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = filters.query.toLowerCase();
      const matchesSearch = q
        ? item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          (item.tags || []).some(t => t.includes(q))
        : true;
      const matchesFolder = selectedFolder ? item.folder_id === selectedFolder.id : true;
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

      return matchesSearch && matchesFolder && matchesType && matchesFavorite && matchesTags && matchesDate;
    });
  }, [items, filters, selectedFolder]);

  const unfolderedItems = useMemo(() => filteredItems.filter(item => !item.folder_id), [filteredItems]);

  const stats = useMemo(() => ({
    totalItems: items.length,
    totalFolders: folders.length,
    links: items.filter(i => i.type === "link").length,
    favorites: items.filter(i => i.is_favorite).length,
  }), [items, folders]);

  const breadcrumb = useMemo(() => {
    if (!selectedFolder) return [];
    const path: Folder[] = [];
    let current: Folder | undefined = selectedFolder;
    while (current) {
      path.unshift(current);
      current = folders.find(f => f.id === current?.parent_id);
    }
    return path;
  }, [selectedFolder, folders]);

  const gridClass = viewMode === "grid" 
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
    : "grid-cols-1";

  const hasActiveFilters = filters.types.length > 0 || filters.dateRange !== "all" || filters.favoritesOnly || filters.tags.length > 0;
  const showFilteredResults = filters.query || hasActiveFilters;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            {selectedFolder && (
              <Button
                variant="ghost" size="icon"
                onClick={() => {
                  const parent = folders.find(f => f.id === selectedFolder.parent_id);
                  setSelectedFolder(parent || null);
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {selectedFolder ? selectedFolder.name : "Dashboard"}
              </h1>
              {selectedFolder ? (
                <nav className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <button onClick={() => setSelectedFolder(null)} className="hover:text-foreground transition-colors">Home</button>
                  {breadcrumb.map((folder, i) => (
                    <span key={folder.id} className="flex items-center gap-1">
                      <ChevronRight className="w-3 h-3" />
                      <button
                        onClick={() => setSelectedFolder(folder)}
                        className={`hover:text-foreground transition-colors ${i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}`}
                      >
                        {folder.name}
                      </button>
                    </span>
                  ))}
                </nav>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {stats.totalItems} items · {stats.totalFolders} folders · {stats.favorites} favorites
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search, Filters & Actions */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchFilters filters={filters} onChange={setFilters} availableTags={availableTags} />
            </div>
            <div className="flex items-start gap-2">
              <div className="flex items-center border border-border/50 rounded-lg p-1 bg-card">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-8 w-8">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="h-8 w-8">
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <CreateFolderDialog folders={folders} defaultParentId={selectedFolder?.id} />
              <AddItemDialog folders={folders} defaultFolderId={selectedFolder?.id} />
              <CreateShareDialog />
              {items.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!selectedFolder ? (
              <motion.div key="root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Folders */}
                {!showFilteredResults && rootFolders.length > 0 && (
                  <section className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Folders</h2>
                        <p className="text-xs text-muted-foreground">{rootFolders.length} folder{rootFolders.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${gridClass}`}>
                      {rootFolders.map((folder) => (
                        <FolderCard
                          key={folder.id} folder={folder} allFolders={folders}
                          onClick={() => setSelectedFolder(folder)}
                          onRename={() => { setRenameName(folder.name); setRenameDialog(folder); }}
                          onDelete={() => setDeleteDialog({ type: "folder", id: folder.id })}
                          onMove={handleMoveFolder}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Items */}
                {(showFilteredResults ? filteredItems : unfolderedItems).length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Database className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{showFilteredResults ? "Results" : "Uncategorized"}</h2>
                        <p className="text-xs text-muted-foreground">
                          {(showFilteredResults ? filteredItems : unfolderedItems).length} item{(showFilteredResults ? filteredItems : unfolderedItems).length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${gridClass}`}>
                      {(showFilteredResults ? filteredItems : unfolderedItems).map((item) => (
                        <ItemCard
                          key={item.id} id={item.id} title={item.title} description={item.description}
                          type={item.type} content={item.content} thumbnailUrl={item.thumbnail_url}
                          folderId={item.folder_id} createdAt={item.created_at} updatedAt={item.updated_at}
                          tags={item.tags} isFavorite={item.is_favorite}
                          linkStatus={item.link_status} archiveUrl={item.archive_url}
                          unlockDate={item.unlock_date} futureMessage={item.future_message}
                          isLocked={item.is_locked} saveReason={item.save_reason} isRead={item.is_read}
                          onDelete={(id) => setDeleteDialog({ type: "item", id })}
                          onMoveToFolder={handleMoveToFolder} onEdit={handleEditItem} folders={folders}
                          onToggleFavorite={handleToggleFavorite} onMarkRead={handleMarkRead}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty */}
                {rootFolders.length === 0 && unfolderedItems.length === 0 && !showFilteredResults && (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Database className="w-10 h-10 text-primary/60" />
                    </div>
                     <h2 className="text-2xl font-bold mb-2">🎉 Welcome to Info Trunk!</h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      You have no saved links yet. Start by creating your first folder, then add links, images, videos, or notes.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <CreateFolderDialog folders={folders} />
                      <AddItemDialog folders={folders} />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key={selectedFolder.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {subfolders.length > 0 && (
                  <section className="mb-8">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Subfolders ({subfolders.length})</h3>
                    <div className={`grid gap-4 ${gridClass}`}>
                      {subfolders.map((folder) => (
                        <FolderCard
                          key={folder.id} folder={folder} allFolders={folders}
                          onClick={() => setSelectedFolder(folder)}
                          onRename={() => { setRenameName(folder.name); setRenameDialog(folder); }}
                          onDelete={() => setDeleteDialog({ type: "folder", id: folder.id })}
                          onMove={handleMoveFolder}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {filteredItems.length > 0 ? (
                  <div className={`grid gap-4 ${gridClass}`}>
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id} id={item.id} title={item.title} description={item.description}
                        type={item.type} content={item.content} thumbnailUrl={item.thumbnail_url}
                        folderId={item.folder_id} createdAt={item.created_at} updatedAt={item.updated_at}
                        tags={item.tags} isFavorite={item.is_favorite}
                        linkStatus={item.link_status} archiveUrl={item.archive_url}
                        unlockDate={item.unlock_date} futureMessage={item.future_message}
                        isLocked={item.is_locked} saveReason={item.save_reason} isRead={item.is_read}
                        onDelete={(id) => setDeleteDialog({ type: "item", id })}
                        onMoveToFolder={handleMoveToFolder} onEdit={handleEditItem} folders={folders}
                        onToggleFavorite={handleToggleFavorite} onMarkRead={handleMarkRead}
                      />
                    ))}
                  </div>
                ) : subfolders.length === 0 ? (
                  <div className="text-center py-24">
                    <FolderOpen className="w-14 h-14 mx-auto mb-4 opacity-40" style={{ color: selectedFolder.color }} />
                    <h2 className="text-xl font-semibold mb-2 text-muted-foreground">This folder is empty</h2>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <CreateFolderDialog folders={folders} defaultParentId={selectedFolder.id} />
                      <AddItemDialog folders={folders} defaultFolderId={selectedFolder.id} />
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <EditItemDialog item={editItem} open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)} folders={folders} />

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog?.type === "folder" ? "Folder" : "Item"}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === "folder" 
                ? "This will delete the folder and its subfolders. Items inside will be moved to the root level."
                : "This action cannot be undone. This item will be permanently deleted."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteDialog?.type === "folder") handleDeleteFolder(deleteDialog.id);
                else if (deleteDialog?.type === "item") handleDeleteItem(deleteDialog.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rename">Folder Name</Label>
              <Input id="rename" value={renameName} onChange={(e) => setRenameName(e.target.value)} placeholder="Enter new name" className="h-11" />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRenameDialog(null)}>Cancel</Button>
              <Button onClick={handleRenameFolder} disabled={updateFolder.isPending}>
                {updateFolder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rename"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
