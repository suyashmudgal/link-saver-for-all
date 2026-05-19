import { useState, useEffect, Suspense, lazy, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, Flame, Trophy, Zap, AlertTriangle, RotateCcw, Clock, Calendar, History } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { HISTORY_KEY, type ChallengeRecord } from "@/pages/TargetHistory";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TargetSection from "@/components/target/TargetSection";
import AddCustomTargetDialog from "@/components/target/AddCustomTargetDialog";
import TargetCompletionDialog from "@/components/target/TargetCompletionDialog";
import { toast } from "sonner";

const TargetScene = lazy(() => import("@/components/target/TargetScene"));

interface TaskItem { id: string; label: string; }
interface Section { title: string; emoji: string; color: string; tasks: TaskItem[]; }

const STORAGE_KEY = "infotrunk-target-challenge";
const CUSTOM_SECTIONS_KEY = "infotrunk-target-custom-sections";
const START_DATE_KEY = "infotrunk-target-start-date";
const DELETED_TASKS_KEY = "infotrunk-target-deleted-tasks";
const ARCHIVED_KEY = "infotrunk-target-archived-cycles";

const defaultSections: Section[] = [
  {
    title: "DSA (Mandatory)", emoji: "🧠",
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
    tasks: [
      { id: "dsa-oops-1", label: "OOPs Class - 1" },
      { id: "dsa-oops-2", label: "OOPs Class - 2" },
      { id: "dsa-oops-3", label: "OOPs Class - 3" },
      { id: "dsa-const", label: "const Keyword" },
      { id: "dsa-init-list", label: "Initialization List" },
      { id: "dsa-macros", label: "MACROS" },
      { id: "dsa-shallow-deep", label: "Shallow Copy vs Deep Copy" },
      { id: "dsa-local-global", label: "Local vs Global Variables" },
      { id: "dsa-static", label: "Static Keyword In Class" },
      { id: "dsa-abstract", label: "Abstraction In C++" },
      { id: "dsa-inline", label: "Inline Functions" },
      { id: "dsa-friend", label: "Friend Keyword In C++" },
      { id: "dsa-private-ctor", label: "Can Constructor Be Made Private" },
      { id: "dsa-virtual", label: "Virtual Constructor vs Virtual Destructor" },
      { id: "dsa-practice-q", label: "🎯 Practice Day: DSA Questions" },
      { id: "dsa-practice-rev", label: "🎯 Practice Day: Previous Questions Revision" },
      { id: "dsa-practice-logic", label: "🎯 Practice Day: Logic Building" },
    ],
  },
  {
    title: "Aptitude", emoji: "📐",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    tasks: [
      { id: "apt-mixture", label: "Mixture and Alligation" },
      { id: "apt-numbers", label: "Numbers" },
      { id: "apt-partnership", label: "Partnership" },
      { id: "apt-percentages", label: "Percentages" },
      { id: "apt-permutation", label: "Permutation" },
      { id: "apt-pipes", label: "Pipes and Cistern" },
      { id: "apt-practice-q", label: "🎯 Practice Day: Aptitude Questions" },
      { id: "apt-practice-speed", label: "🎯 Practice Day: Speed Improvement" },
      { id: "apt-practice-formula", label: "🎯 Practice Day: Formula Revision" },
    ],
  },
  {
    title: "English", emoji: "📖",
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    tasks: [
      { id: "eng-d1", label: "Day 1 — Create 1 English Video" },
      { id: "eng-d2", label: "Day 2 — Create 1 English Video" },
      { id: "eng-d3", label: "Day 3 — Create 1 English Video" },
      { id: "eng-d4", label: "Day 4 — Create 1 English Video" },
      { id: "eng-d5", label: "Day 5 — Create 1 English Video" },
      { id: "eng-d6", label: "Day 6 — Create 1 English Video" },
      { id: "eng-d7", label: "Day 7 — Create 1 English Video" },
    ],
  },
  {
    title: "Deep Learning", emoji: "🤖",
    color: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    tasks: [
      { id: "dl-keras", label: "Keras Tuning" },
      { id: "dl-cnn-1", label: "CNN - 1" },
      { id: "dl-cnn-2", label: "CNN - 2" },
      { id: "dl-cnn-3", label: "CNN - 3" },
      { id: "dl-cnn-4", label: "CNN - 4" },
      { id: "dl-cnn-5", label: "CNN - 5" },
      { id: "dl-bp-cnn-1", label: "Backpropagation CNN - 1" },
      { id: "dl-bp-cnn-2", label: "Backpropagation CNN - 2" },
      { id: "dl-cat-dog", label: "Cat vs Dog Image Classification Project" },
      { id: "dl-rev-concepts", label: "🎯 Revision Day: DL Concepts" },
      { id: "dl-rev-cnn", label: "🎯 Revision Day: CNN Flow" },
      { id: "dl-rev-notes", label: "🎯 Revision Day: Notes + Important Points" },
    ],
  },
  {
    title: "Python Revision", emoji: "🐍",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    tasks: [
      { id: "py-1", label: "Variables & Data Types" },
      { id: "py-2", label: "Loops & Conditions" },
      { id: "py-3", label: "Functions" },
      { id: "py-4", label: "List, Tuple, Set, Dictionary" },
      { id: "py-5", label: "List Comprehension" },
      { id: "py-6", label: "Lambda, map, filter" },
      { id: "py-7", label: "Exception Handling" },
      { id: "py-8", label: "File Handling" },
      { id: "py-9", label: "OOP" },
      { id: "py-10", label: "Decorators" },
      { id: "py-11", label: "Generators" },
      { id: "py-12", label: "Iterators" },
    ],
  },
  {
    title: "SQL", emoji: "🗃️",
    color: "from-sky-500/20 to-indigo-500/20 border-sky-500/30",
    tasks: [
      { id: "sql-1", label: "SELECT, WHERE, ORDER BY, LIMIT" },
      { id: "sql-2", label: "DISTINCT, AND, OR, NOT" },
      { id: "sql-3", label: "BETWEEN, IN, LIKE" },
      { id: "sql-4", label: "COUNT, SUM, AVG, MIN, MAX" },
      { id: "sql-5", label: "GROUP BY" },
      { id: "sql-6", label: "HAVING" },
      { id: "sql-7", label: "INNER JOIN" },
      { id: "sql-8", label: "LEFT JOIN" },
      { id: "sql-9", label: "RIGHT JOIN" },
      { id: "sql-10", label: "FULL JOIN" },
    ],
  },
];

const TargetPage = () => {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const [customSections, setCustomSections] = useState<Section[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_SECTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [startDate, setStartDate] = useState<Date>(() => {
    try {
      const saved = localStorage.getItem(START_DATE_KEY);
      if (saved) return new Date(saved);
      const now = new Date();
      localStorage.setItem(START_DATE_KEY, now.toISOString());
      return now;
    } catch { return new Date(); }
  });

  const [showCompletion, setShowCompletion] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 7, hours: 0, minutes: 0, seconds: 0 });

  const [deletedTaskIds, setDeletedTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DELETED_TASKS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  useEffect(() => {
    localStorage.setItem(DELETED_TASKS_KEY, JSON.stringify([...deletedTaskIds]));
  }, [deletedTaskIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_SECTIONS_KEY, JSON.stringify(customSections));
  }, [customSections]);

  // Countdown timer
  useEffect(() => {
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tick = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const visibleDefaultSections = defaultSections
    .map((s) => ({ ...s, tasks: s.tasks.filter((t) => !deletedTaskIds.has(t.id)) }))
    .filter((s) => s.tasks.length > 0);
  const allSections = [...visibleDefaultSections, ...customSections];
  const totalTasks = allSections.flatMap((s) => s.tasks).length;
  const completedCount = allSections.flatMap((s) => s.tasks).filter((t) => completed.has(t.id)).length;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      // Check if all done after toggle
      const newCount = allSections.flatMap((s) => s.tasks).filter((t) => next.has(t.id)).length;
      if (newCount === totalTasks && totalTasks > 0) {
        setTimeout(() => setShowCompletion(true), 300);
      }
      return next;
    });
  }, [allSections, totalTasks]);

  const resetProgress = () => {
    setCompleted(new Set());
    setDeletedTaskIds(new Set());
    const now = new Date();
    localStorage.setItem(START_DATE_KEY, now.toISOString());
    setStartDate(now);
    toast.success("Progress reset! Fresh start 💪");
  };

  const addCustomSection = (section: Section) => {
    setCustomSections((prev) => [...prev, section]);
  };

  const deleteCustomSection = (idx: number) => {
    const section = customSections[idx];
    setCompleted((prev) => {
      const next = new Set(prev);
      section.tasks.forEach((t) => next.delete(t.id));
      return next;
    });
    setCustomSections((prev) => prev.filter((_, i) => i !== idx));
    toast.success("Section removed");
  };

  const deleteTaskFromSection = (sectionIdx: number, taskId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    setCustomSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx ? { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) } : s
      )
    );
    toast.success("Target removed");
  };

  const deleteDefaultTask = (taskId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    setDeletedTaskIds((prev) => new Set(prev).add(taskId));
    toast.success("Target removed");
  };

  const timerExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  // Auto-archive when timer expires: save report, clear tasks, restart cycle
  useEffect(() => {
    if (!timerExpired) return;
    try {
      const archived: string[] = JSON.parse(localStorage.getItem(ARCHIVED_KEY) || "[]");
      const cycleId = startDate.toISOString();
      if (archived.includes(cycleId)) return;

      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const sections = allSections.map((s) => ({
        title: s.title,
        emoji: s.emoji,
        done: s.tasks.filter((t) => completed.has(t.id)).length,
        total: s.tasks.length,
      }));
      const record: ChallengeRecord = {
        id: cycleId,
        startDate: cycleId,
        endDate: endDate.toISOString(),
        totalTasks,
        completedTasks: completedCount,
        percent: progress,
        sections,
      };
      const history: ChallengeRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      history.unshift(record);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(ARCHIVED_KEY, JSON.stringify([...archived, cycleId]));

      // Clear tasks and start a fresh 7-day cycle
      setCompleted(new Set());
      setDeletedTaskIds(new Set());
      const now = new Date();
      localStorage.setItem(START_DATE_KEY, now.toISOString());
      setStartDate(now);

      toast.success("Challenge ended — report saved to Target History 📊", {
        action: { label: "View", onClick: () => navigate("/target-history") },
        duration: 8000,
      });
    } catch (e) {
      console.error("Failed to archive challenge:", e);
    }
  }, [timerExpired, startDate, allSections, completed, totalTasks, completedCount, progress, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Completion Dialog */}
        <TargetCompletionDialog open={showCompletion} onClose={() => setShowCompletion(false)} />

        {/* 3D Scene */}
        <Suspense fallback={<div className="w-full h-32 md:h-40 rounded-2xl bg-muted/30 animate-pulse" />}>
          <TargetScene />
        </Suspense>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">7 Days Challenge</h1>
                <p className="text-sm text-muted-foreground">No excuses. Just execution.</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will uncheck every task and restart the 7-day timer. Your custom target sections will remain. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetProgress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex justify-end mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/target-history")} className="gap-1.5 text-muted-foreground hover:text-foreground rounded-xl">
              <History className="w-3.5 h-3.5" /> View History
            </Button>
          </div>

          {/* Countdown Timer */}
          <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-lg p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Time Remaining</span>
              {timerExpired && <span className="text-xs text-destructive font-bold ml-auto">⏰ Time's Up!</span>}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl md:text-3xl font-extrabold tabular-nums text-foreground">{String(value).padStart(2, "0")}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Started: {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              <span className="ml-auto">
                Deadline: {new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm md:text-base leading-relaxed">
                <p className="font-bold text-foreground">Bhai sun dhyaan se ⚠️</p>
                <p className="text-muted-foreground">Tu already kaafi time waste kar chuka hai. Aise hi chalta raha na toh life mein kuch achieve karna mushkil ho jayega.</p>
                <p className="text-muted-foreground">Free Fire aur faltu distractions band kar de 🎮❌</p>
                <p className="text-muted-foreground">Ab serious hone ka time aa gaya hai.</p>
                <p className="font-semibold text-foreground mt-3">Yeh tera 7 din ka challenge hai — no excuses ⚡</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 rounded-2xl border border-border/40 bg-card/70 backdrop-blur-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-sm">Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">{completedCount} / {totalTasks} completed</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{progress}% done</span>
            {progress === 100 && (
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Challenge Complete! 🎉
              </span>
            )}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {visibleDefaultSections.map((section, idx) => (
            <TargetSection
              key={section.title}
              section={section}
              index={idx}
              completed={completed}
              onToggle={toggle}
              onDeleteTask={deleteDefaultTask}
            />
          ))}

          {customSections.map((section, idx) => (
            <TargetSection
              key={`custom-${idx}`}
              section={section}
              index={visibleDefaultSections.length + idx}
              completed={completed}
              onToggle={toggle}
              isCustom
              onDeleteSection={() => deleteCustomSection(idx)}
              onDeleteTask={(taskId) => deleteTaskFromSection(idx, taskId)}
            />
          ))}
        </div>

        {/* Add Custom Target */}
        <div className="mt-6 flex justify-center">
          <AddCustomTargetDialog onAddSection={addCustomSection} />
        </div>

        {/* Bottom Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-10 mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center"
        >
          <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-base md:text-lg font-bold text-foreground mb-2">
            If you complete this in 7 days, you are ahead of 90% of people.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Now decide — <span className="text-destructive">distraction</span> or{" "}
            <span className="text-primary font-bold">success</span>.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TargetPage;
