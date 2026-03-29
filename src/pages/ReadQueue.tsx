import { useState, useMemo } from "react";
import { BookOpen, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ItemCard from "@/components/ItemCard";
import { useItems, useDeleteItem, useToggleFavorite, useMoveItem, useMarkItemRead, useFolders } from "@/hooks/use-items";
import { useSnoozeItem, useSetPriority, useUnsnooze } from "@/hooks/use-read-queue";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

const ReadQueue = () => {
  const { user } = useAuth();
  const { data: items = [] } = useItems();
  const { data: folders = [] } = useFolders();
  const deleteItem = useDeleteItem();
  const toggleFavorite = useToggleFavorite();
  const moveItem = useMoveItem();
  const markRead = useMarkItemRead();

  const now = new Date();

  const unreadItems = useMemo(() => {
    return items
      .filter(item => !item.is_read && (!item.snoozed_until || new Date(item.snoozed_until) <= now))
      .sort((a, b) => {
        const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
        const pA = priorityOrder[a.priority || "normal"] ?? 1;
        const pB = priorityOrder[b.priority || "normal"] ?? 1;
        if (pA !== pB) return pA - pB;
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      });
  }, [items, now]);

  const snoozedItems = useMemo(() => {
    return items
      .filter(item => item.snoozed_until && new Date(item.snoozed_until) > now)
      .sort((a, b) => new Date(a.snoozed_until!).getTime() - new Date(b.snoozed_until!).getTime());
  }, [items, now]);

  const getTimeUntil = (dateStr: string) => {
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Soon";
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Read Queue
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {unreadItems.length} links waiting to be read · {snoozedItems.length} snoozed
            </p>
          </div>
        </div>

        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queue" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Queue ({unreadItems.length})
            </TabsTrigger>
            <TabsTrigger value="snoozed" className="gap-2">
              <Clock className="w-4 h-4" />
              Snoozed ({snoozedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            {unreadItems.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">All caught up! 🎉</p>
                <p className="text-sm">No unread links in your queue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unreadItems.map(item => (
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
                    tags={item.tags}
                    isFavorite={item.is_favorite}
                    linkStatus={item.link_status}
                    archiveUrl={item.archive_url}
                    unlockDate={item.unlock_date}
                    futureMessage={item.future_message}
                    isLocked={item.is_locked}
                    saveReason={item.save_reason}
                    isRead={item.is_read}
                    priority={item.priority}
                    snoozedUntil={item.snoozed_until}
                    onDelete={(id) => deleteItem.mutate(id)}
                    onMoveToFolder={(itemId, folderId) => moveItem.mutate({ itemId, folderId })}
                    onEdit={() => {}}
                    onToggleFavorite={(id) => toggleFavorite.mutate({ id, is_favorite: !item.is_favorite })}
                    onMarkRead={(id) => markRead.mutate(id)}
                    folders={folders}
                    showSnooze
                    showPriority
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="snoozed">
            {snoozedItems.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No snoozed links</p>
                <p className="text-sm">Snooze a link to see it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snoozedItems.map(item => (
                  <div key={item.id} className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        Resurfaces in {getTimeUntil(item.snoozed_until!)}
                      </Badge>
                    </div>
                    <ItemCard
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      type={item.type}
                      content={item.content}
                      thumbnailUrl={item.thumbnail_url}
                      folderId={item.folder_id}
                      createdAt={item.created_at}
                      updatedAt={item.updated_at}
                      tags={item.tags}
                      isFavorite={item.is_favorite}
                      linkStatus={item.link_status}
                      archiveUrl={item.archive_url}
                      saveReason={item.save_reason}
                      isRead={item.is_read}
                      priority={item.priority}
                      snoozedUntil={item.snoozed_until}
                      onDelete={(id) => deleteItem.mutate(id)}
                      onToggleFavorite={(id) => toggleFavorite.mutate({ id, is_favorite: !item.is_favorite })}
                      onMarkRead={(id) => markRead.mutate(id)}
                      folders={folders}
                      showSnooze
                      showPriority
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReadQueue;
