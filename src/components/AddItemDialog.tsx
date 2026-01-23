import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["link", "image", "video", "note"]),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

interface Folder {
  id: string;
  name: string;
}

interface AddItemDialogProps {
  onItemAdded: () => void;
  folders?: Folder[];
  defaultFolderId?: string;
}

const AddItemDialog = ({ onItemAdded, folders = [], defaultFolderId }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"link" | "image" | "video" | "note">("link");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [folderId, setFolderId] = useState<string>(defaultFolderId || "none");
  const { toast } = useToast();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("link");
    setContent("");
    setThumbnailUrl("");
    setFolderId(defaultFolderId || "none");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = itemSchema.safeParse({
        title,
        description: description || undefined,
        type,
        content,
        thumbnailUrl: thumbnailUrl || undefined,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add items.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("items").insert({
        user_id: user.id,
        title: validation.data.title,
        description: validation.data.description,
        type: validation.data.type,
        content: validation.data.content,
        thumbnail_url: validation.data.thumbnailUrl,
        folder_id: folderId === "none" ? null : folderId,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Item added to your vault.",
      });

      resetForm();
      setOpen(false);
      onItemAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary hover:opacity-90 shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {folders.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              {type === "note" ? "Note Content" : type === "link" ? "URL" : `${type} URL`}
            </Label>
            {type === "note" ? (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                required
                disabled={loading}
                rows={4}
              />
            ) : (
              <Input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={type === "link" ? "https://example.com" : "Enter URL"}
                required
                disabled={loading}
              />
            )}
          </div>

          {(type === "image" || type === "video") && (
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnail"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={loading}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
