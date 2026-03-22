import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, LogOut, Sparkles, Database, Search, ArrowLeft,
  FolderOpen, LayoutGrid, List, Zap, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCard from "@/components/ItemCard";
import AddItemDialog from "@/components/AddItemDialog";
import CreateFolderDialog from "@/components/CreateFolderDialog";
import FolderCard from "@/components/FolderCard";
import ThemeToggle from "@/components/ThemeToggle";
import EditItemDialog from "@/components/EditItemDialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { 
  useItems, useFolders, useDeleteItem, useDeleteFolder, 
  useUpdateFolder, useMoveItem, useMoveFolder, Item, Folder
} from "@/hooks/use-items";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ type: "folder" | "item"; id: string } | null>(null);
  const [renameDialog, setRenameDialog] = useState<Folder | null>(null);
  const [renameName, setRenameName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [editItem, setEditItem] = useState<Item | null>(null);
  const navigate = useNavigate();

  const { data: items = [], isLoading: itemsLoading, isFetching: itemsFetching } = useItems();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const deleteItem = useDeleteItem();
  const deleteFolder = useDeleteFolder();
  const updateFolder = useUpdateFolder();
  const moveItem = useMoveItem();
  const moveFolder = useMoveFolder();

  const loading = authLoading || itemsLoading || foldersLoading;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); } else { setUser(session.user); }
      setAuthLoading(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { navigate("/auth"); } else { setUser(session.user); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

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
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  // Get subfolders for selected folder
  const subfolders = useMemo(() => {
    if (!selectedFolder) return [];
    return folders.filter(f => f.parent_id === selectedFolder.id);
  }, [folders, selectedFolder]);

  // Root-level folders (no parent)
  const rootFolders = useMemo(() => {
    return folders.filter(f => !f.parent_id);
  }, [folders]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesFolder = selectedFolder ? item.folder_id === selectedFolder.id : true;
      return matchesSearch && matchesFolder;
    });
  }, [items, searchQuery, selectedFolder]);

  const unfolderedItems = useMemo(() => items.filter(item => !item.folder_id), [items]);

  const stats = useMemo(() => ({
    totalItems: items.length,
    totalFolders: folders.length,
    links: items.filter(i => i.type === "link").length,
    notes: items.filter(i => i.type === "note").length,
  }), [items, folders]);

  // Breadcrumb path for nested navigation
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {selectedFolder && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Navigate up: if folder has parent, go to parent, otherwise go to root
                    const parent = folders.find(f => f.id === selectedFolder.parent_id);
                    setSelectedFolder(parent || null);
                  }}
                  className="mr-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 14px hsl(var(--primary) / 0.35)' }}>
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">DataVault</h1>
                  {selectedFolder ? (
                    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                      <button 
                        onClick={() => setSelectedFolder(null)} 
                        className="hover:text-foreground transition-colors"
                      >
                        Home
                      </button>
                      {breadcrumb.map((folder, i) => (
                        <span key={folder.id} className="flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          <button
                            onClick={() => setSelectedFolder(folder)}
                            className={`hover:text-foreground transition-colors ${
                              i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""
                            }`}
                          >
                            {folder.name}
                          </button>
                        </span>
                      ))}
                    </nav>
                  ) : (
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{stats.totalItems} items</span>
                      <span className="text-border">•</span>
                      <span>{stats.totalFolders} folders</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {itemsFetching && (
                <Badge variant="outline" className="text-xs gap-1 hidden sm:flex animate-pulse">
                  <Zap className="w-3 h-3" />
                  Syncing
                </Badge>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card border-border/50 focus-visible:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border/50 rounded-lg p-1 bg-card">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-8 w-8">
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="h-8 w-8">
                <List className="w-4 h-4" />
              </Button>
            </div>
            <CreateFolderDialog 
              folders={folders}
              defaultParentId={selectedFolder?.id}
            />
            <AddItemDialog folders={folders} defaultFolderId={selectedFolder?.id} />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {!selectedFolder ? (
            <motion.div key="root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Folders */}
              {rootFolders.length > 0 && (!searchQuery || rootFolders.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))) && (
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
                    {rootFolders
                      .filter(f => searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
                      .map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          onClick={() => setSelectedFolder(folder)}
                          onRename={() => { setRenameName(folder.name); setRenameDialog(folder); }}
                          onDelete={() => setDeleteDialog({ type: "folder", id: folder.id })}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* Uncategorized Items */}
              {(searchQuery ? filteredItems : unfolderedItems).length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Database className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{searchQuery ? "Search Results" : "Uncategorized"}</h2>
                      <p className="text-xs text-muted-foreground">
                        {(searchQuery ? filteredItems : unfolderedItems).length} item{(searchQuery ? filteredItems : unfolderedItems).length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className={`grid gap-4 ${gridClass}`}>
                    {(searchQuery ? filteredItems : unfolderedItems).map((item) => (
                      <ItemCard
                        key={item.id} id={item.id} title={item.title} description={item.description}
                        type={item.type} content={item.content} thumbnailUrl={item.thumbnail_url}
                        folderId={item.folder_id} createdAt={item.created_at} updatedAt={item.updated_at}
                        onDelete={(id) => setDeleteDialog({ type: "item", id })}
                        onMoveToFolder={handleMoveToFolder} onEdit={handleEditItem} folders={folders}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {rootFolders.length === 0 && unfolderedItems.length === 0 && !searchQuery && (
                <div className="text-center py-24">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Database className="w-10 h-10 text-primary/60" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to DataVault</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Start by creating folders to organize your content, then add links, images, videos, or notes.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <CreateFolderDialog folders={folders} />
                    <AddItemDialog folders={folders} />
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchQuery && filteredItems.length === 0 && !rootFolders.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
                <div className="text-center py-24">
                  <Search className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
                  <h2 className="text-xl font-semibold mb-2 text-muted-foreground">No results found</h2>
                  <p className="text-muted-foreground text-sm">Try a different search term</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key={selectedFolder.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Subfolders inside selected folder */}
              {subfolders.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Subfolders ({subfolders.length})
                    </h3>
                  </div>
                  <div className={`grid gap-4 ${gridClass}`}>
                    {subfolders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onClick={() => setSelectedFolder(folder)}
                        onRename={() => { setRenameName(folder.name); setRenameDialog(folder); }}
                        onDelete={() => setDeleteDialog({ type: "folder", id: folder.id })}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Items in selected folder */}
              {filteredItems.length > 0 ? (
                <div className={`grid gap-4 ${gridClass}`}>
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id} id={item.id} title={item.title} description={item.description}
                      type={item.type} content={item.content} thumbnailUrl={item.thumbnail_url}
                      folderId={item.folder_id} createdAt={item.created_at} updatedAt={item.updated_at}
                      onDelete={(id) => setDeleteDialog({ type: "item", id })}
                      onMoveToFolder={handleMoveToFolder} onEdit={handleEditItem} folders={folders}
                    />
                  ))}
                </div>
              ) : subfolders.length === 0 ? (
                <div className="text-center py-24">
                  <FolderOpen className="w-14 h-14 mx-auto mb-4 opacity-40" style={{ color: selectedFolder.color }} />
                  <h2 className="text-xl font-semibold mb-2 text-muted-foreground">
                    {searchQuery ? "No matching items" : "This folder is empty"}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {searchQuery ? "Try a different search term" : "Add items or create subfolders to get started"}
                  </p>
                  {!searchQuery && (
                    <div className="flex items-center justify-center gap-3">
                      <CreateFolderDialog folders={folders} defaultParentId={selectedFolder.id} />
                      <AddItemDialog folders={folders} defaultFolderId={selectedFolder.id} />
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Item Dialog */}
      <EditItemDialog item={editItem} open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)} folders={folders} />

      {/* Delete Confirmation */}
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

      {/* Rename Folder Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={() => setRenameDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
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
    </div>
  );
};

export default Dashboard;
