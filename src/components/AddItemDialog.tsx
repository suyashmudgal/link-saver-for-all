import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Link2, Upload, AlertTriangle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreateItem, useCheckDuplicate, detectLinkType, Folder } from "@/hooks/use-items";
import { z } from "zod";
import FileUploadPreview from "./FileUploadPreview";
import TagInput from "./TagInput";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  type: z.enum(["link", "image", "video", "note"]),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
  thumbnailUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

interface AddItemDialogProps {
  folders?: Folder[];
  defaultFolderId?: string;
}

const AddItemDialog = ({ folders = [], defaultFolderId }: AddItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"link" | "image" | "video" | "note">("link");
  const [content, setContent] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [folderId, setFolderId] = useState<string>(defaultFolderId || "none");
  const [inputMode, setInputMode] = useState<"url" | "file">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [saveReason, setSaveReason] = useState("");
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [futureMessage, setFutureMessage] = useState("");
  const { toast } = useToast();
  const createItem = useCreateItem();
  const checkDuplicate = useCheckDuplicate();

  const resetForm = () => {
    setTitle(""); setDescription(""); setType("link"); setContent(""); setThumbnailUrl("");
    setFolderId(defaultFolderId || "none"); setInputMode("url"); setUploadedFile(null);
    setTags([]); setDuplicateWarning(null);
    if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
  };

  const getFileType = (mimeType: string): "image" | "video" | "note" | "link" => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "video";
    return "note";
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    setType(getFileType(file.type));
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
  };

  // Auto-fetch metadata and detect type when URL changes
  const handleContentChange = async (url: string) => {
    setContent(url);
    setDuplicateWarning(null);

    if (type !== "note" && url.length > 8 && (url.startsWith("http") || url.includes("."))) {
      // Auto-detect type
      const detectedType = detectLinkType(url);
      setType(detectedType);

      // Check duplicate
      const dup = await checkDuplicate(url);
      if (dup) {
        setDuplicateWarning(`This link is already saved as "${dup.title}"`);
      }

      // Auto-fetch metadata
      if (!title && !fetchingMeta) {
        setFetchingMeta(true);
        try {
          const { data } = await supabase.functions.invoke("fetch-link-preview", { body: { url } });
          if (data?.success && data?.data) {
            if (data.data.title && !title) setTitle(data.data.title);
            if (data.data.description && !description) setDescription(data.data.description);
            if (data.data.image) setThumbnailUrl(data.data.image);
          }
        } catch { /* ignore */ } finally { setFetchingMeta(false); }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Error", description: "You must be logged in.", variant: "destructive" }); return; }

    let finalContent = content;
    if (inputMode === "file" && uploadedFile) {
      finalContent = JSON.stringify({
        fileName: uploadedFile.name, fileSize: uploadedFile.size,
        fileType: uploadedFile.type, previewUrl: filePreviewUrl || ""
      });
    }

    const validation = itemSchema.safeParse({
      title, description: description || undefined, type, content: finalContent,
      thumbnailUrl: thumbnailUrl || undefined,
    });
    if (!validation.success) { toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" }); return; }

    createItem.mutate({
      user_id: user.id, title: validation.data.title, description: validation.data.description,
      type: validation.data.type, content: validation.data.content,
      thumbnail_url: validation.data.thumbnailUrl,
      folder_id: folderId === "none" ? undefined : folderId,
      tags,
      is_favorite: false,
    }, { onSuccess: () => { resetForm(); setOpen(false); } });
  };

  const isFormValid = () => {
    if (!title.trim()) return false;
    if (inputMode === "url") return content.trim().length > 0;
    return uploadedFile !== null;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary hover:opacity-90 shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Item</DialogTitle></DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "file")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center gap-2"><Link2 className="w-4 h-4" /> URL / Text</TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label>Folder</Label>
                    <Select value={folderId} onValueChange={setFolderId}>
                      <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Folder</SelectItem>
                        {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{type === "note" ? "Note Content" : type === "link" ? "URL" : `${type} URL`}</Label>
                {type === "note" ? (
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note here..." required disabled={createItem.isPending} rows={4} />
                ) : (
                  <div className="space-y-1">
                    <Input value={content} onChange={(e) => handleContentChange(e.target.value)} placeholder={type === "link" ? "https://example.com" : "Enter URL"} required disabled={createItem.isPending} />
                    {fetchingMeta && <p className="text-xs text-muted-foreground animate-pulse">Fetching metadata...</p>}
                    {duplicateWarning && (
                      <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {duplicateWarning}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {(type === "image" || type === "video") && (
                <div className="space-y-2">
                  <Label>Thumbnail URL (Optional)</Label>
                  <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://example.com/image.jpg" disabled={createItem.isPending} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="file" className="space-y-4 mt-4">
              {folders.length > 0 && (
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Select value={folderId} onValueChange={setFolderId}>
                    <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Folder</SelectItem>
                      {folders.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <FileUploadPreview onFileSelect={handleFileSelect} onFileRemove={handleFileRemove} disabled={createItem.isPending} />
              {uploadedFile && (
                <p className="text-xs text-muted-foreground">Detected type: <span className="capitalize font-medium text-foreground">{type}</span></p>
              )}
            </TabsContent>
          </Tabs>

          {/* Common fields */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title" required disabled={createItem.isPending} />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why is this link important?" disabled={createItem.isPending} />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput tags={tags} onChange={setTags} disabled={createItem.isPending} placeholder="e.g., DSA, Learning, Fun" />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createItem.isPending} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createItem.isPending || !isFormValid()} className="flex-1 bg-gradient-to-r from-primary to-primary">
              {createItem.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
