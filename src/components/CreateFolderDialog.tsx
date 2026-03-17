import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Loader2, Palette, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreateFolder, Folder } from "@/hooks/use-items";
import { z } from "zod";

const folderSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(300, "Description must be less than 300 characters").optional(),
  color: z.string().optional(),
});

interface CreateFolderDialogProps {
  trigger?: React.ReactNode;
  folders?: Folder[];
  defaultParentId?: string;
}

const FOLDER_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6b7280", // Gray
];

const CreateFolderDialog = ({ trigger, folders = [], defaultParentId }: CreateFolderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [parentId, setParentId] = useState<string>(defaultParentId || "none");
  const { toast } = useToast();
  const createFolder = useCreateFolder();

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor(FOLDER_COLORS[0]);
    setParentId(defaultParentId || "none");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = folderSchema.safeParse({
      name,
      description: description || undefined,
      color,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create folders.",
        variant: "destructive",
      });
      return;
    }

    createFolder.mutate({
      user_id: user.id,
      name: validation.data.name,
      description: validation.data.description,
      color: validation.data.color || FOLDER_COLORS[0],
      icon: "folder",
      parent_id: parentId === "none" ? undefined : parentId,
    }, {
      onSuccess: () => {
        resetForm();
        setOpen(false);
      },
    });
  };

  // Only show root-level folders as parent options (no deep nesting)
  const parentOptions = folders.filter(f => !(f as any).parent_id);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5">
            <FolderPlus className="w-4 h-4" />
            New Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-primary" />
            </div>
            Create New Folder
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., YouTube, Projects, Study"
              required
              disabled={createFolder.isPending}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-description">Description (Optional)</Label>
            <Textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this folder..."
              disabled={createFolder.isPending}
              rows={2}
            />
          </div>

          {/* Parent Folder selection for subfolders */}
          {parentOptions.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                Parent Folder (Optional)
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="No parent — root level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="text-muted-foreground">No parent — root level</span>
                  </SelectItem>
                  {parentOptions.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full inline-block" 
                          style={{ backgroundColor: folder.color }} 
                        />
                        {folder.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a parent to create this as a subfolder
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              Folder Color
            </Label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    color === c 
                      ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110 shadow-lg" 
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {name.trim() && (
            <div className="rounded-xl border border-border/50 p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">Preview</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <FolderOpen className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  {description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
                  )}
                  {parentId !== "none" && (
                    <p className="text-xs text-primary mt-0.5">
                      Inside: {parentOptions.find(f => f.id === parentId)?.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createFolder.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createFolder.isPending || !name.trim()}
              className="flex-1"
            >
              {createFolder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Folder
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
