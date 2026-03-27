import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useItems, Item } from "@/hooks/use-items";
import { useCreateSharedCollection } from "@/hooks/use-shared-collections";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Share2, Link2, FileText, Image as ImageIcon, Video } from "lucide-react";

const typeIcon = (type: string) => {
  switch (type) {
    case "link": return <Link2 className="w-3.5 h-3.5" />;
    case "note": return <FileText className="w-3.5 h-3.5" />;
    case "image": return <ImageIcon className="w-3.5 h-3.5" />;
    case "video": return <Video className="w-3.5 h-3.5" />;
    default: return null;
  }
};

const CreateShareDialog = () => {
  const { user } = useAuth();
  const { data: items = [] } = useItems();
  const createCollection = useCreateSharedCollection();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleCreate = async () => {
    if (!user || !title.trim() || selectedIds.size === 0) return;
    await createCollection.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      item_ids: Array.from(selectedIds),
      user_id: user.id,
    });
    setOpen(false);
    setTitle("");
    setDescription("");
    setSelectedIds(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share Collection</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Shared Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Link Collection" />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A curated set of useful links..." rows={2} />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Label>Select Items ({selectedIds.size} selected)</Label>
              <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
                {selectedIds.size === items.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0 max-h-[250px] border rounded-lg">
              <div className="p-2 space-y-1">
                {items.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggle(item.id)}
                    />
                    <span className="text-muted-foreground">{typeIcon(item.type)}</span>
                    <span className="text-sm truncate flex-1">{item.title}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{item.type}</Badge>
                  </label>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No items to share yet.</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || selectedIds.size === 0 || createCollection.isPending}
            className="w-full"
          >
            {createCollection.isPending ? "Creating..." : `Create & Get Link (${selectedIds.size} items)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShareDialog;
