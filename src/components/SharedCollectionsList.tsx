import { useState } from "react";
import { useSharedCollections, useToggleCollectionActive, useDeleteSharedCollection } from "@/hooks/use-shared-collections";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, Trash2, ExternalLink, Share2, Check } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { ListRowsSkeleton } from "@/components/PageSkeletons";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SharedCollectionsList = () => {
  const { data: collections = [], isLoading } = useSharedCollections();
  const toggleActive = useToggleCollectionActive();
  const deleteCollection = useDeleteSharedCollection();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getShareUrl = (token: string) => `${window.location.origin}/shared/${token}`;

  const copyLink = (token: string, id: string) => {
    navigator.clipboard.writeText(getShareUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <ListRowsSkeleton count={3} />;

  if (collections.length === 0) {
    return (
      <EmptyState
        icon={Share2}
        kicker="Published"
        title="No shared collections yet"
        description="Share a folder or a single item from the dashboard and the public link will be listed here."
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {collections.map((c) => (
          <Card key={c.id} className="p-4 hover-lift">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{c.title}</h3>
                  <Badge variant={c.is_active ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {c.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {c.item_count} item{c.item_count !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {c.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={c.is_active}
                  onCheckedChange={(checked) => toggleActive.mutate({ id: c.id, is_active: checked })}
                />
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => copyLink(c.share_token, c.id)}
                >
                  {copiedId === c.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={() => window.open(getShareUrl(c.share_token), "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteId(c.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shared collection?</AlertDialogTitle>
            <AlertDialogDescription>The public link will stop working immediately.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => { if (deleteId) { deleteCollection.mutate(deleteId); setDeleteId(null); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SharedCollectionsList;
