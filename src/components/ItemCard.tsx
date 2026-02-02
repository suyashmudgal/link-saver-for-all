import { useState, useRef } from "react";
import { Link2, FileText, Image as ImageIcon, Video, Trash2, ExternalLink, MoreVertical, FolderInput, Play, Pause, File, Maximize2, X, Calendar, Clock, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import LinkPreviewCard from "./LinkPreviewCard";

interface Folder {
  id: string;
  name: string;
}

interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl: string;
}

interface ItemCardProps {
  id: string;
  title: string;
  description?: string;
  type: "link" | "image" | "video" | "note";
  content: string;
  thumbnailUrl?: string;
  folderId?: string;
  createdAt?: string;
  updatedAt?: string;
  onDelete: (id: string) => void;
  onMoveToFolder?: (itemId: string, folderId: string | null) => void;
  onEdit?: (id: string) => void;
  folders?: Folder[];
}

const ItemCard = ({ 
  id, 
  title, 
  description, 
  type, 
  content, 
  thumbnailUrl, 
  folderId,
  createdAt,
  updatedAt,
  onDelete,
  onMoveToFolder,
  onEdit,
  folders = []
}: ItemCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Try to parse content as file metadata
  const parseFileMetadata = (): FileMetadata | null => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.fileName && parsed.fileType) {
        return parsed as FileMetadata;
      }
    } catch {
      // Not JSON, treat as regular content
    }
    return null;
  };

  const fileMetadata = parseFileMetadata();
  const isFileUpload = fileMetadata !== null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getIcon = () => {
    if (isFileUpload && fileMetadata) {
      if (fileMetadata.fileType.startsWith("audio/")) {
        return <Video className="w-4 h-4" />;
      }
    }
    switch (type) {
      case "link":
        return <Link2 className="w-4 h-4" />;
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "note":
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeStyles = () => {
    if (isFileUpload && fileMetadata?.fileType.startsWith("audio/")) {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    switch (type) {
      case "link":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "image":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "video":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20";
      case "note":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const getDisplayType = () => {
    if (isFileUpload && fileMetadata?.fileType.startsWith("audio/")) {
      return "audio";
    }
    return type;
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleClick = () => {
    if (isFileUpload) {
      // Show inline preview for file uploads
      setShowPreview(true);
    } else if (type === "link" && content) {
      // Links now show preview inline - clicking card does nothing
      // User must click the explicit "Open link" button
      return;
    } else if (type === "image" || type === "video") {
      setShowPreview(true);
    } else if (type === "note") {
      // Show note preview with brief loading state
      setIsNoteLoading(true);
      setShowPreview(true);
      // Simulate brief loading for smooth UX
      setTimeout(() => setIsNoteLoading(false), 150);
    }
  };

  const renderThumbnail = () => {
    if (isFileUpload && fileMetadata) {
      const { fileType, previewUrl, fileName, fileSize } = fileMetadata;

      // Image preview
      if (fileType.startsWith("image/") && previewUrl) {
        return (
          <div className="w-full h-40 overflow-hidden bg-muted relative group/thumb">
            <img 
              src={previewUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
          </div>
        );
      }

      // Video preview
      if (fileType.startsWith("video/") && previewUrl) {
        return (
          <div className="w-full h-40 overflow-hidden bg-black relative">
            <video 
              src={previewUrl} 
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        );
      }

      // Audio preview
      if (fileType.startsWith("audio/") && previewUrl) {
        return (
          <div className="w-full p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full shrink-0"
                onClick={toggleAudio}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
              </div>
              <audio
                ref={audioRef}
                src={previewUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          </div>
        );
      }

      // PDF or document preview
      if (fileType === "application/pdf") {
        return (
          <div className="w-full h-40 overflow-hidden bg-muted flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">PDF Document</p>
            </div>
          </div>
        );
      }

      // Generic file preview
      return (
        <div className="w-full p-4 bg-muted/50">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(fileSize)} • {fileType || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // URL-based thumbnail for images/videos
    if (thumbnailUrl && (type === "image" || type === "video")) {
      return (
        <div className="w-full h-40 overflow-hidden bg-muted">
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      );
    }

    // Link preview
    if (type === "link" && !isFileUpload) {
      return (
        <div className="p-4">
          <LinkPreviewCard url={content} />
        </div>
      );
    }

    return null;
  };

  const renderPreviewDialog = () => {
    if (!showPreview) return null;

    // Note preview dialog
    if (type === "note" && !isFileUpload) {
      return (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-6 pb-4 border-b shrink-0">
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="space-y-2 min-w-0">
                  {isNoteLoading ? (
                    <>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </>
                  ) : (
                    <>
                      <DialogTitle className="text-xl font-semibold leading-tight">
                        {title}
                      </DialogTitle>
                      <DialogDescription className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created {formatDate(createdAt)}
                          </span>
                        )}
                        {updatedAt && updatedAt !== createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {formatDate(updatedAt)}
                          </span>
                        )}
                      </DialogDescription>
                    </>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6">
                {isNoteLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {content}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {!isNoteLoading && (
              <div className="p-4 border-t flex items-center justify-end gap-2 shrink-0 bg-muted/30">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(false);
                      onEdit(id);
                    }}
                    className="gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(false);
                    onDelete(id);
                  }}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      );
    }

    if (isFileUpload && fileMetadata) {
      const { fileType, previewUrl, fileName } = fileMetadata;

      return (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>

              {fileType.startsWith("image/") && previewUrl && (
                <img 
                  src={previewUrl} 
                  alt={title} 
                  className="w-full max-h-[85vh] object-contain bg-black"
                />
              )}

              {fileType.startsWith("video/") && previewUrl && (
                <video 
                  src={previewUrl} 
                  className="w-full max-h-[85vh]"
                  controls
                  autoPlay
                  playsInline
                />
              )}

              {fileType.startsWith("audio/") && previewUrl && (
                <div className="p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Video className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <audio 
                      src={previewUrl} 
                      controls 
                      autoPlay
                      className="w-full max-w-md"
                    />
                  </div>
                </div>
              )}

              {fileType === "application/pdf" && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[85vh]"
                  title={fileName}
                />
              )}

              {!fileType.startsWith("image/") && 
               !fileType.startsWith("video/") && 
               !fileType.startsWith("audio/") && 
               fileType !== "application/pdf" && (
                <div className="p-12 text-center">
                  <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    // URL-based preview
    if (type === "image" && (thumbnailUrl || content)) {
      const imageUrl = thumbnailUrl || content;
      return (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full max-h-[85vh] object-contain bg-black"
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (type === "video" && content) {
      return (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setShowPreview(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              <video 
                src={content} 
                className="w-full max-h-[85vh]"
                controls
                autoPlay
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return null;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        layout
      >
        <Card 
          className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer bg-card"
          onClick={handleClick}
        >
          {renderThumbnail()}
          
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge variant="outline" className={`${getTypeStyles()} flex items-center gap-1.5`}>
                {getIcon()}
                <span className="capitalize text-xs">{getDisplayType()}</span>
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {type === "link" && !isFileUpload && (
                    <DropdownMenuItem onClick={(e) => { 
                      e.stopPropagation(); 
                      const url = content.startsWith("http") ? content : `https://${content}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </DropdownMenuItem>
                  )}
                  {(type === "image" || type === "video" || isFileUpload) && (
                    <DropdownMenuItem onClick={(e) => { 
                      e.stopPropagation(); 
                      setShowPreview(true);
                    }}>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      View Preview
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => { 
                      e.stopPropagation(); 
                      onEdit(id);
                    }}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onMoveToFolder && folders.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                        <FolderInput className="w-4 h-4 mr-2" />
                        Move to Folder
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onMoveToFolder(id, null); }}
                          disabled={!folderId}
                        >
                          No Folder
                        </DropdownMenuItem>
                        {folders.map((folder) => (
                          <DropdownMenuItem 
                            key={folder.id}
                            onClick={(e) => { e.stopPropagation(); onMoveToFolder(id, folder.id); }}
                            disabled={folderId === folder.id}
                          >
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-semibold mb-1 line-clamp-2">{title}</h3>
            
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
            )}

            {type === "note" && !isFileUpload && (
              <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{content}</p>
            )}

            {isFileUpload && fileMetadata && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatFileSize(fileMetadata.fileSize)}
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {renderPreviewDialog()}
    </>
  );
};

export default ItemCard;
