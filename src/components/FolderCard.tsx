import { FolderOpen, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  itemCount?: number;
}

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

const FolderCard = ({ folder, onClick, onRename, onDelete }: FolderCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50"
        onClick={onClick}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: folder.color }}
        />
        
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${folder.color}20` }}
            >
              <FolderOpen className="w-6 h-6" style={{ color: folder.color }} />
            </div>
            
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
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{folder.name}</h3>
          
          {folder.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {folder.description}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            {folder.itemCount || 0} {folder.itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div 
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: folder.color }}
        />
      </Card>
    </motion.div>
  );
};

export default FolderCard;
