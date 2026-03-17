import { FolderOpen, ChevronRight, MoreVertical, Edit2, Trash2 } from "lucide-react";
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
  subfolderCount?: number;
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
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border-border/50 hover:border-primary/30 gradient-border"
        onClick={onClick}
      >
        {/* Colored accent strip at top */}
        <div 
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${folder.color}, ${folder.color}88)` }}
        />

        {/* Subtle background tint */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundColor: folder.color }}
        />
        
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm"
              style={{ 
                backgroundColor: `${folder.color}18`,
                boxShadow: `0 2px 8px ${folder.color}15`
              }}
            >
              <FolderOpen className="w-5 h-5" style={{ color: folder.color }} />
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

          <h3 className="font-semibold text-base mb-1 line-clamp-1">{folder.name}</h3>
          
          {folder.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {folder.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">
                {folder.itemCount || 0} {folder.itemCount === 1 ? "item" : "items"}
              </span>
              {(folder.subfolderCount ?? 0) > 0 && (
                <span className="text-xs text-muted-foreground">
                  • {folder.subfolderCount} subfolder{folder.subfolderCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <ChevronRight 
              className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" 
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FolderCard;
