import { Link2, FileText, Image as ImageIcon, Video, Trash2, ExternalLink, MoreVertical, FolderInput } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface Folder {
  id: string;
  name: string;
}

interface ItemCardProps {
  id: string;
  title: string;
  description?: string;
  type: "link" | "image" | "video" | "note";
  content: string;
  thumbnailUrl?: string;
  folderId?: string;
  onDelete: (id: string) => void;
  onMoveToFolder?: (itemId: string, folderId: string | null) => void;
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
  onDelete,
  onMoveToFolder,
  folders = []
}: ItemCardProps) => {
  const getIcon = () => {
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

  const handleClick = () => {
    if (type === "link" && content) {
      const url = content.startsWith("http") ? content : `https://${content}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
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
        {thumbnailUrl && (type === "image" || type === "video") && (
          <div className="w-full h-40 overflow-hidden bg-muted">
            <img 
              src={thumbnailUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge variant="outline" className={`${getTypeStyles()} flex items-center gap-1.5`}>
              {getIcon()}
              <span className="capitalize text-xs">{type}</span>
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
                {type === "link" && (
                  <DropdownMenuItem onClick={(e) => { 
                    e.stopPropagation(); 
                    const url = content.startsWith("http") ? content : `https://${content}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
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

          {type === "note" && (
            <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{content}</p>
          )}

          {type === "link" && (
            <p className="text-xs text-primary truncate flex items-center gap-1 mt-2">
              <ExternalLink className="w-3 h-3" />
              {content}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
