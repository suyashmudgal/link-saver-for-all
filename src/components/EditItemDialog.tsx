import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, X, RefreshCw } from "lucide-react";
import { useUpdateItem, Item, Folder } from "@/hooks/use-items";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["link", "image", "video", "note"]),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

interface EditItemDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders?: Folder[];
}

const EditItemDialog = ({ item, open, onOpenChange, folders = [] }: EditItemDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"link" | "image" | "video" | "note">("link");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [folderId, setFolderId] = useState<string>("none");
  const [refreshingPreview, setRefreshingPreview] = useState(false);
  const { toast } = useToast();

  const updateItem = useUpdateItem();

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setType(item.type);
      setContent(item.content);
      setThumbnailUrl(item.thumbnail_url || "");
      setFolderId(item.folder_id || "none");
    }
  }, [item]);

  const handleRefreshPreview = async () => {
    if (type !== "link" || !content) return;

    setRefreshingPreview(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-link-preview", {
        body: { url: content },
      });

      if (error) throw error;

      if (data?.title && !title) {
        setTitle(data.title);
      }
      if (data?.description && !description) {
        setDescription(data.description);
      }
      if (data?.image) {
        setThumbnailUrl(data.image);
      }

      toast({
        title: "Preview refreshed",
        description: "Metadata has been updated from the link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh link preview.",
        variant: "destructive",
      });
    } finally {
      setRefreshingPreview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

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
      return;
    }

    updateItem.mutate({
      id: item.id,
      title: validation.data.title,
      description: validation.data.description,
      type: validation.data.type,
      content: validation.data.content,
      thumbnail_url: validation.data.thumbnailUrl,
      folder_id: folderId === "none" ? null : folderId,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const isFormValid = title.trim() && content.trim();

  // Check if content is file upload (JSON metadata)
  const isFileUpload = (() => {
    try {
      const parsed = JSON.parse(content);
      return !!(parsed.fileName && parsed.fileType);
    } catch {
      return false;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select 
                value={type} 
                onValueChange={(value: any) => setType(value)}
                disabled={isFileUpload}
              >
                <SelectTrigger id="edit-type">
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
                <Label htmlFor="edit-folder">Folder</Label>
                <Select value={folderId} onValueChange={setFolderId}>
                  <SelectTrigger id="edit-folder">
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
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              required
              disabled={updateItem.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              disabled={updateItem.isPending}
            />
          </div>

          {!isFileUpload && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-content">
                  {type === "note" ? "Note Content" : type === "link" ? "URL" : `${type} URL`}
                </Label>
                {type === "link" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshPreview}
                    disabled={refreshingPreview || !content}
                    className="h-7 text-xs gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshingPreview ? "animate-spin" : ""}`} />
                    Refresh Preview
                  </Button>
                )}
              </div>
              {type === "note" ? (
                <Textarea
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  required
                  disabled={updateItem.isPending}
                  rows={6}
                />
              ) : (
                <Input
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={type === "link" ? "https://example.com" : "Enter URL"}
                  required
                  disabled={updateItem.isPending}
                />
              )}
            </div>
          )}

          {isFileUpload && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This is an uploaded file. The file content cannot be changed, but you can edit the title, description, and folder.
              </p>
            </div>
          )}

          {!isFileUpload && (type === "link" || type === "image" || type === "video") && (
            <div className="space-y-2">
              <Label htmlFor="edit-thumbnail">Thumbnail URL (Optional)</Label>
              <Input
                id="edit-thumbnail"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={updateItem.isPending}
              />
              {thumbnailUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border bg-muted">
                  <img 
                    src={thumbnailUrl} 
                    alt="Thumbnail preview" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateItem.isPending}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateItem.isPending || !isFormValid}
              className="flex-1 bg-gradient-to-r from-primary to-primary"
            >
              {updateItem.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
