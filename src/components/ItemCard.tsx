import { Link2, FileText, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  id: string;
  title: string;
  description?: string;
  type: "link" | "image" | "video" | "note";
  content: string;
  thumbnailUrl?: string;
  onDelete: (id: string) => void;
}

const ItemCard = ({ id, title, description, type, content, thumbnailUrl, onDelete }: ItemCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "link":
        return <Link2 className="w-5 h-5" />;
      case "image":
        return <ImageIcon className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "note":
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "link":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "image":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "video":
        return "bg-pink-500/10 text-pink-600 border-pink-200";
      case "note":
        return "bg-accent/10 text-accent-foreground border-accent";
    }
  };

  const handleClick = () => {
    if (type === "link" && content) {
      const url = content.startsWith("http") ? content : `https://${content}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 cursor-pointer"
      onClick={handleClick}
    >
      {thumbnailUrl && (type === "image" || type === "video") && (
        <div className="w-full h-48 overflow-hidden bg-muted">
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={`${getTypeColor()} flex items-center gap-1`}>
            {getIcon()}
            <span className="capitalize">{type}</span>
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>

        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{title}</h3>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        )}

        {type === "note" && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2 whitespace-pre-wrap">{content}</p>
        )}

        {type === "link" && (
          <p className="text-xs text-primary truncate mt-2">{content}</p>
        )}
      </div>

      <div className="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
    </Card>
  );
};

export default ItemCard;
