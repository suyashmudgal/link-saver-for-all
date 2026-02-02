import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  LogOut, 
  Sparkles, 
  Database, 
  Search, 
  ArrowLeft,
  FolderOpen,
  LayoutGrid,
  List,
  Zap
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useItems, 
  useFolders, 
  useDeleteItem, 
  useDeleteFolder, 
  useUpdateFolder, 
  useMoveItem,
  Item,
  Folder
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

  // React Query hooks for cached data
  const { data: items = [], isLoading: itemsLoading, isFetching: itemsFetching } = useItems();
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const deleteItem = useDeleteItem();
  const deleteFolder = useDeleteFolder();
  const updateFolder = useUpdateFolder();
  const moveItem = useMoveItem();

  const loading = authLoading || itemsLoading || foldersLoading;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setAuthLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDeleteItem = (id: string) => {
    deleteItem.mutate(id);
    setDeleteDialog(null);
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder.mutate(id);
    setDeleteDialog(null);
    setSelectedFolder(null);
  };

  const handleRenameFolder = () => {
    if (!renameDialog || !renameName.trim()) return;
    updateFolder.mutate({ id: renameDialog.id, name: renameName.trim() });
    setRenameDialog(null);
  };

  const handleMoveToFolder = (itemId: string, folderId: string | null) => {
    moveItem.mutate({ itemId, folderId });
  };

  const handleEditItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setEditItem(item);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Memoized filtered items for performance
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = searchQuery
        ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesFolder = selectedFolder
        ? item.folder_id === selectedFolder.id
        : true;

      return matchesSearch && matchesFolder;
    });
  }, [items, searchQuery, selectedFolder]);

  // Items without folder for root view
  const unfolderedItems = useMemo(() => {
    return items.filter(item => !item.folder_id);
  }, [items]);

  // Stats for header
  const stats = useMemo(() => ({
    totalItems: items.length,
    totalFolders: folders.length,
    links: items.filter(i => i.type === "link").length,
    notes: items.filter(i => i.type === "note").length,
  }), [items, folders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {selectedFolder && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFolder(null)}
                  className="mr-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">DataVault</h1>
                  {selectedFolder ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FolderOpen className="w-3 h-3" style={{ color: selectedFolder.color }} />
                      {selectedFolder.name}
                    </p>
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
              {/* Cache status indicator */}
              {itemsFetching && (
                <Badge variant="outline" className="text-xs gap-1 hidden sm:flex">
                  <Zap className="w-3 h-3 animate-pulse" />
                  Syncing
                </Badge>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 focus-visible:ring-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border/50 rounded-lg p-1 bg-card">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            {!selectedFolder && <CreateFolderDialog />}
            <AddItemDialog 
              folders={folders}
              defaultFolderId={selectedFolder?.id}
            />
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!selectedFolder ? (
            // Root View - Show Folders and Unfoldered Items
            <motion.div
              key="root"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Folders Section */}
              {folders.length > 0 && (
                <section className="mb-10">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    Folders
                    <span className="text-sm font-normal text-muted-foreground">
                      ({folders.length})
                    </span>
                  </h2>
                  <div className={`grid gap-4 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                      : "grid-cols-1"
                  }`}>
                    {folders
                      .filter(f => searchQuery 
                        ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) 
                        : true
                      )
                      .map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          onClick={() => setSelectedFolder(folder)}
                          onRename={() => {
                            setRenameName(folder.name);
                            setRenameDialog(folder);
                          }}
                          onDelete={() => setDeleteDialog({ type: "folder", id: folder.id })}
                        />
                      ))}
                  </div>
                </section>
              )}

              {/* Unfoldered Items Section */}
              {(searchQuery ? filteredItems : unfolderedItems).length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    {searchQuery ? "Search Results" : "Uncategorized Items"}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({searchQuery ? filteredItems.length : unfolderedItems.length})
                    </span>
                  </h2>
                  <div className={`grid gap-4 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                      : "grid-cols-1"
                  }`}>
                    {(searchQuery ? filteredItems : unfolderedItems).map((item) => (
                      <ItemCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        type={item.type}
                        content={item.content}
                        thumbnailUrl={item.thumbnail_url}
                        folderId={item.folder_id}
                        createdAt={item.created_at}
                        updatedAt={item.updated_at}
                        onDelete={(id) => setDeleteDialog({ type: "item", id })}
                        onMoveToFolder={handleMoveToFolder}
                        onEdit={handleEditItem}
                        folders={folders}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty State */}
              {folders.length === 0 && unfolderedItems.length === 0 && !searchQuery && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Database className="w-10 h-10 text-primary/60" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Welcome to DataVault
                  </h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Start by creating folders to organize your content, then add links, images, videos, or notes.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <CreateFolderDialog />
                    <AddItemDialog folders={folders} />
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchQuery && filteredItems.length === 0 && folders.filter(f => 
                f.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-2xl font-semibold mb-2 text-muted-foreground">
                    No results found
                  </h2>
                  <p className="text-muted-foreground">
                    Try a different search term
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            // Folder View - Show Items in Selected Folder
            <motion.div
              key={selectedFolder.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {filteredItems.length > 0 ? (
                <div className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                    : "grid-cols-1"
                }`}>
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      type={item.type}
                      content={item.content}
                      thumbnailUrl={item.thumbnail_url}
                      folderId={item.folder_id}
                      createdAt={item.created_at}
                      updatedAt={item.updated_at}
                      onDelete={(id) => setDeleteDialog({ type: "item", id })}
                      onMoveToFolder={handleMoveToFolder}
                      onEdit={handleEditItem}
                      folders={folders}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FolderOpen 
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    style={{ color: selectedFolder.color }}
                  />
                  <h2 className="text-2xl font-semibold mb-2 text-muted-foreground">
                    {searchQuery ? "No matching items" : "This folder is empty"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? "Try a different search term" : "Add items to this folder to get started"}
                  </p>
                  {!searchQuery && (
                    <AddItemDialog 
                      folders={folders}
                      defaultFolderId={selectedFolder.id}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Edit Item Dialog */}
      <EditItemDialog
        item={editItem}
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        folders={folders}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteDialog?.type === "folder" ? "Folder" : "Item"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === "folder" 
                ? "This will delete the folder. Items inside will be moved to the root level."
                : "This action cannot be undone. This item will be permanently deleted."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteDialog?.type === "folder") {
                  handleDeleteFolder(deleteDialog.id);
                } else if (deleteDialog?.type === "item") {
                  handleDeleteItem(deleteDialog.id);
                }
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
              <Input
                id="rename"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRenameDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleRenameFolder} disabled={updateFolder.isPending}>
                {updateFolder.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Rename"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
