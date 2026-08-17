import { useMemo, useState } from "react";
import {
  Link2, FileText, Image as ImageIcon, Video, ExternalLink, Pencil, Trash2,
  Share2, Star, Copy, Check, Calendar, Clock, FolderOpen, File, Loader2,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item, Folder } from "@/hooks/use-items";
import { useAuth } from "@/hooks/use-auth";
import { useCreateSharedCollection } from "@/hooks/use-shared-collections";
import { useToast } from "@/hooks/use-toast";
import LinkStatusBadge from "./LinkStatusBadge";
import { getTagColor } from "./TagInput";

interface ItemDetailModalProps {
  item: Item | null;
  folders?: Folder[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl: string;
}

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const safeUrl = (raw: string) => {
  const url = raw.startsWith("http") ? raw : `https://${raw}`;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const ItemDetailModal = ({ item, folders = [], open, onOpenChange, onEdit, onDelete, onToggleFavorite }: ItemDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createCollection = useCreateSharedCollection();
  const [copied, setCopied] = useState(false);

  const fileMeta = useMemo<FileMetadata | null>(() => {
    if (!item) return null;
    try {
      const parsed = JSON.parse(item.content);
      return parsed?.fileName && parsed?.fileType ? (parsed as FileMetadata) : null;
    } catch {
      return null;
    }
  }, [item]);

  if (!item) return null;

  const folder = folders.find(f => f.id === item.folder_id);
  const externalUrl = item.type === "link" && !fileMeta ? safeUrl(item.content) : null;

  const TypeIcon = item.type === "link" ? Link2 : item.type === "image" ? ImageIcon : item.type === "video" ? Video : FileText;

  const handleCopy = async () => {
    const value = externalUrl || fileMeta?.previewUrl || item.content;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const handleShare = () => {
    if (!user) return;
    createCollection.mutate({
      title: item.title,
      description: item.description || "Shared from Info Trunk",
      item_ids: [item.id],
      user_id: user.id,
    });
  };

  const renderMedia = () => {
    const previewUrl = fileMeta?.previewUrl;
    const fileType = fileMeta?.fileType || "";

    if ((fileType.startsWith("image/") && previewUrl) || (item.type === "image" && (item.thumbnail_url || safeUrl(item.content)))) {
      const src = previewUrl || item.thumbnail_url || safeUrl(item.content) || "";
      return (
        <div className="rounded-2xl overflow-hidden border border-border/40 bg-black/40">
          <img src={src} alt={item.title} className="w-full max-h-[52vh] object-contain" loading="lazy" />
        </div>
      );
    }

    if ((fileType.startsWith("video/") && previewUrl) || (item.type === "video" && (previewUrl || safeUrl(item.content)))) {
      const src = previewUrl || safeUrl(item.content) || "";
      return (
        <div className="rounded-2xl overflow-hidden border border-border/40 bg-black">
          <video src={src} controls playsInline className="w-full max-h-[52vh]" />
        </div>
      );
    }

    if (fileType.startsWith("audio/") && previewUrl) {
      return (
        <div className="rounded-2xl border border-border/40 p-5" style={{ background: "var(--gradient-hero)" }}>
          <audio src={previewUrl} controls className="w-full" />
        </div>
      );
    }

    if (fileType === "application/pdf" && previewUrl) {
      return <iframe src={previewUrl} title={item.title} className="w-full h-[52vh] rounded-2xl border border-border/40 bg-card" />;
    }

    if (fileMeta) {
      return (
        <div className="rounded-2xl border border-border/40 p-5 flex items-center gap-4 bg-card/60">
          <File className="w-8 h-8 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{fileMeta.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(fileMeta.fileSize)} · {fileMeta.fileType}</p>
          </div>
        </div>
      );
    }

    if (item.type === "note") {
      return (
        <div className="rounded-2xl border border-border/40 p-5 bg-card/60">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{item.content}</p>
        </div>
      );
    }

    if (externalUrl) {
      return (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer"
          className="block rounded-2xl border border-border/40 p-5 bg-card/60 hover:border-primary/40 transition-colors group">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Destination</p>
          <p className="text-sm text-primary break-all group-hover:underline">{externalUrl}</p>
        </a>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden border-border/40 bg-card/95 backdrop-blur-2xl">
        <div className="relative px-6 pt-6 pb-5 border-b border-border/40" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute -top-20 -right-10 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: "var(--gradient-aurora)" }} />
          <div className="relative pr-8">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="w-6 gold-divider" />
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary gap-1.5 text-[10px] uppercase tracking-[0.2em]">
                <TypeIcon className="w-3 h-3" /> {item.type}
              </Badge>
              {item.link_status && item.type === "link" && <LinkStatusBadge status={item.link_status} archiveUrl={item.archive_url} compact />}
              {item.is_favorite && <Star className="w-4 h-4 fill-primary text-primary" />}
            </div>
            <DialogTitle className="font-serif-display text-2xl md:text-3xl leading-tight">{item.title}</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              {item.created_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(item.created_at)}</span>}
              {item.updated_at && item.updated_at !== item.created_at && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {formatDate(item.updated_at)}</span>
              )}
              {folder && <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {folder.name}</span>}
            </DialogDescription>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-5">
            {renderMedia()}

            {item.description && <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>}

            {item.save_reason && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Why it was saved</p>
                <p className="text-sm italic">{item.save_reason}</p>
              </div>
            )}

            {(item.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(item.tags || []).map(tag => (
                  <Badge key={tag} variant="outline" className={getTagColor(tag)}>{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-t border-border/40 bg-background/60 backdrop-blur-xl">
          {externalUrl && (
            <Button asChild size="sm" className="rounded-xl gap-2">
              <a href={externalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /> Open</a>
            </Button>
          )}
          <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />} Copy
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={handleShare} disabled={createCollection.isPending}>
            {createCollection.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Share
          </Button>
          {onToggleFavorite && (
            <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={() => onToggleFavorite(item.id)}>
              <Star className={`w-4 h-4 ${item.is_favorite ? "fill-primary text-primary" : ""}`} />
              {item.is_favorite ? "Unfavorite" : "Favorite"}
            </Button>
          )}
          <div className="flex-1" />
          {onEdit && (
            <Button size="sm" variant="ghost" className="rounded-xl gap-2" onClick={() => { onOpenChange(false); onEdit(item.id); }}>
              <Pencil className="w-4 h-4" /> Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" className="rounded-xl gap-2 text-destructive hover:text-destructive"
              onClick={() => { onOpenChange(false); onDelete(item.id); }}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailModal;
