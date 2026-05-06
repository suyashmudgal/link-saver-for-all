import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

interface TaskItem { id: string; label: string; }
interface Section { title: string; emoji: string; color: string; tasks: TaskItem[]; }

interface Props {
  section: Section;
  index: number;
  completed: Set<string>;
  onToggle: (id: string) => void;
  isCustom?: boolean;
  onDeleteSection?: () => void;
  onDeleteTask?: (taskId: string) => void;
}

const TargetSection = ({ section, index, completed, onToggle, isCustom, onDeleteSection, onDeleteTask }: Props) => {
  const sectionDone = section.tasks.filter((t) => completed.has(t.id)).length;
  const sectionTotal = section.tasks.length;
  const sectionComplete = sectionDone === sectionTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`rounded-2xl border bg-gradient-to-br ${section.color} bg-card p-5`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{section.emoji}</span>
          <h2 className="text-lg font-bold">{section.title}</h2>
          {sectionComplete && <CheckCircle2 className="w-5 h-5 text-accent" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-background/60 text-muted-foreground">
            {sectionDone}/{sectionTotal}
          </span>
          {isCustom && onDeleteSection && (
            <button onClick={onDeleteSection} className="p-1 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {section.tasks.map((task) => {
          const done = completed.has(task.id);
          return (
            <div
              key={task.id}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                done ? "bg-accent/10 text-muted-foreground" : "hover:bg-background/50"
              }`}
            >
              <button onClick={() => onToggle(task.id)} className="flex items-center gap-3 flex-1 text-left">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                )}
                <span className={`text-sm transition-all ${done ? "line-through opacity-60" : "text-foreground"}`}>
                  {task.label}
                </span>
              </button>
              {onDeleteTask && (
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TargetSection;
