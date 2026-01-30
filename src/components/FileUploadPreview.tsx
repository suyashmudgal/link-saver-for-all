import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileText,
  Play,
  Pause,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Safe file formats for preview
const SAFE_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const SAFE_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const SAFE_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];
const SAFE_PDF_TYPES = ["application/pdf"];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface FileUploadPreviewProps {
  onFileSelect?: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

interface PreviewState {
  file: File | null;
  previewUrl: string | null;
  fileType: "image" | "video" | "audio" | "pdf" | "unsupported" | null;
  loading: boolean;
  error: string | null;
}

const FileUploadPreview = ({
  onFileSelect,
  onFileRemove,
  accept = "*/*",
  maxSize = MAX_FILE_SIZE,
  className,
  disabled = false
}: FileUploadPreviewProps) => {
  const [preview, setPreview] = useState<PreviewState>({
    file: null,
    previewUrl: null,
    fileType: null,
    loading: false,
    error: null
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const getFileType = (mimeType: string): PreviewState["fileType"] => {
    if (SAFE_IMAGE_TYPES.includes(mimeType)) return "image";
    if (SAFE_VIDEO_TYPES.includes(mimeType)) return "video";
    if (SAFE_AUDIO_TYPES.includes(mimeType)) return "audio";
    if (SAFE_PDF_TYPES.includes(mimeType)) return "pdf";
    return "unsupported";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = useCallback((file: File) => {
    // Clear previous preview
    if (preview.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }

    // Validate file size
    if (file.size > maxSize) {
      setPreview({
        file: null,
        previewUrl: null,
        fileType: null,
        loading: false,
        error: `File size exceeds ${formatFileSize(maxSize)} limit`
      });
      return;
    }

    setPreview(prev => ({ ...prev, loading: true, error: null }));

    const fileType = getFileType(file.type);
    
    // Create object URL for preview (fast, doesn't block UI)
    const previewUrl = URL.createObjectURL(file);

    // Quick preview generation
    setTimeout(() => {
      setPreview({
        file,
        previewUrl,
        fileType,
        loading: false,
        error: null
      });

      onFileSelect?.(file);
    }, 100); // Small delay for smooth UX
  }, [maxSize, onFileSelect, preview.previewUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    if (preview.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setPreview({
      file: null,
      previewUrl: null,
      fileType: null,
      loading: false,
      error: null
    });
    setAudioPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemove?.();
  }, [preview.previewUrl, onFileRemove]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  }, [audioPlaying]);

  const getFileIcon = () => {
    switch (preview.fileType) {
      case "image": return <FileImage className="w-8 h-8 text-purple-500" />;
      case "video": return <FileVideo className="w-8 h-8 text-pink-500" />;
      case "audio": return <FileAudio className="w-8 h-8 text-green-500" />;
      case "pdf": return <FileText className="w-8 h-8 text-red-500" />;
      default: return <File className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const renderPreview = () => {
    if (!preview.file || !preview.previewUrl) return null;

    switch (preview.fileType) {
      case "image":
        return (
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={preview.previewUrl}
              alt={preview.file.name}
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
        );

      case "video":
        return (
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={preview.previewUrl}
              className="w-full h-full object-contain"
              controls
              muted
              playsInline
              preload="metadata"
            />
          </div>
        );

      case "audio":
        return (
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
            >
              {audioPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{preview.file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(preview.file.size)}</p>
            </div>
            <audio
              ref={audioRef}
              src={preview.previewUrl}
              onEnded={() => setAudioPlaying(false)}
              className="hidden"
            />
          </div>
        );

      case "pdf":
        return (
          <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            <iframe
              src={`${preview.previewUrl}#page=1&view=FitH`}
              className="w-full h-full border-0"
              title={preview.file.name}
            />
          </div>
        );

      default:
        // Unsupported file - show metadata card
        return (
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{preview.file.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(preview.file.size)}</span>
                <span>•</span>
                <span>{preview.file.type || "Unknown type"}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {preview.file ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 space-y-4">
              {preview.loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-2" />
                  <p className="text-sm text-muted-foreground">Loading preview...</p>
                </div>
              ) : (
                <>
                  {renderPreview()}
                  
                  {/* File info and actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon()}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{preview.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(preview.file.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleReplace(); }}
                        disabled={disabled}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card
              className={cn(
                "border-2 border-dashed transition-all duration-200 cursor-pointer",
                isDragOver && "border-primary bg-primary/5",
                disabled && "opacity-50 cursor-not-allowed",
                preview.error && "border-destructive"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                  isDragOver ? "bg-primary/10" : "bg-muted"
                )}>
                  <Upload className={cn(
                    "w-6 h-6 transition-colors",
                    isDragOver ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                
                <p className="text-sm font-medium mb-1">
                  {isDragOver ? "Drop file here" : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Max file size: {formatFileSize(maxSize)}
                </p>

                {preview.error && (
                  <div className="flex items-center gap-2 mt-4 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{preview.error}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadPreview;
