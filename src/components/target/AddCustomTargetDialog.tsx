import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface TaskItem { id: string; label: string; }
interface Section { title: string; emoji: string; color: string; tasks: TaskItem[]; }

interface Props {
  onAddSection: (section: Section) => void;
}

const COLORS = [
  "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
  "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
  "from-lime-500/20 to-green-500/20 border-lime-500/30",
  "from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30",
];

const EMOJIS = ["🎯", "📌", "🚀", "💡", "🔥", "⭐", "📝", "🏆"];

const AddCustomTargetDialog = ({ onAddSection }: Props) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"manual" | "bulk">("manual");
  const [title, setTitle] = useState("");
  const [singleTask, setSingleTask] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState("");

  const addTask = () => {
    const t = singleTask.trim();
    if (!t) return;
    setTasks((prev) => [...prev, t]);
    setSingleTask("");
  };

  const removeTask = (idx: number) => setTasks((prev) => prev.filter((_, i) => i !== idx));

  const parseBulkText = (text: string): string[] => {
    return text
      .split(/\n|,|;|\d+\.\s*|\d+\)\s*|-\s+|\*\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 200);
  };

  const handleSubmit = () => {
    const trimTitle = title.trim();
    if (!trimTitle) { toast.error("Section title is required"); return; }

    let finalTasks: string[] = [];
    if (mode === "manual") {
      finalTasks = tasks;
    } else {
      finalTasks = parseBulkText(bulkText);
    }

    if (finalTasks.length === 0) { toast.error("Add at least one task"); return; }

    const section: Section = {
      title: trimTitle,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tasks: finalTasks.map((label, i) => ({
        id: `custom-${Date.now()}-${i}`,
        label,
      })),
    };

    onAddSection(section);
    toast.success(`"${trimTitle}" added with ${finalTasks.length} tasks!`);
    setTitle(""); setTasks([]); setBulkText(""); setSingleTask("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5">
          <Plus className="w-4 h-4" /> Add Custom Target
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Add Custom Target
          </DialogTitle>
          <DialogDescription>Create your own target section or paste bulk text to auto-parse.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. React Revision, GK Practice" />
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button size="sm" variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add One by One
            </Button>
            <Button size="sm" variant={mode === "bulk" ? "default" : "outline"} onClick={() => setMode("bulk")} className="gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Paste Bulk Text
            </Button>
          </div>

          {mode === "manual" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={singleTask}
                  onChange={(e) => setSingleTask(e.target.value)}
                  placeholder="Type a task..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
                />
                <Button size="sm" onClick={addTask}>Add</Button>
              </div>
              {tasks.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-border p-2 bg-muted/30">
                  {tasks.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 rounded-md bg-background">
                      <span>{t}</span>
                      <button onClick={() => removeTask(i)} className="text-destructive text-xs hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{tasks.length} task(s) added</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Paste your targets here...\nEach line becomes a task.\n\nSupported formats:\n- Bullet points\n1. Numbered lists\nComma separated"}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {parseBulkText(bulkText).length} task(s) detected
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Target Section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomTargetDialog;
