import { FolderOpen, ChevronRight, MoreVertical, Edit2, Trash2, MoveRight, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  parent_id?: string | null;
  itemCount?: number;
  subfolderCount?: number;
}

interface FolderCardProps {
  folder: Folder;
  allFolders?: Folder[];
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
  onMove?: (folderId: string, newParentId: string | null) => void;
  onShare?: (folderId: string) => void;
}

const FolderCard = ({ folder, allFolders = [], onClick, onRename, onDelete, onMove, onShare }: FolderCardProps) => {
  const getDescendantIds = (id: string): string[] => {
    const children = allFolders.filter(f => f.parent_id === id);
    return [id, ...children.flatMap(c => getDescendantIds(c.id))];
  };

  const excludeIds = new Set(getDescendantIds(folder.id));
  const moveTargets = allFolders.filter(f => !excludeIds.has(f.id));
  const canMoveToRoot = !!folder.parent_id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden cursor-pointer hover-lift gradient-border"
        onClick={onClick}
      >
        <div 
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${folder.color}, ${folder.color}88)` }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03] rounded-xl"
          style={{ backgroundColor: folder.color }}
        />
        
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
              style={{ 
                backgroundColor: `${folder.color}15`,
                boxShadow: `0 4px 12px ${folder.color}20`
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
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {onShare && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(folder.id); }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Folder
                  </DropdownMenuItem>
                )}
                {onMove && (moveTargets.length > 0 || canMoveToRoot) && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <MoveRight className="w-4 h-4 mr-2" />
                      Move to
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {canMoveToRoot && (
                        <>
                          <DropdownMenuItem onClick={() => onMove(folder.id, null)}>
                            <FolderOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                            Root (no parent)
                          </DropdownMenuItem>
                          {moveTargets.length > 0 && <DropdownMenuSeparator />}
                        </>
                      )}
                      {moveTargets.map(t => (
                        <DropdownMenuItem key={t.id} onClick={() => onMove(folder.id, t.id)}>
                          <FolderOpen className="w-4 h-4 mr-2" style={{ color: t.color }} />
                          {t.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
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
