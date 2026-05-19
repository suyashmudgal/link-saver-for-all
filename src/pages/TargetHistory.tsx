import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { History, Trophy, TrendingUp, Trash2, Target as TargetIcon, Calendar, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const HISTORY_KEY = "infotrunk-target-history";

export interface ChallengeRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  percent: number;
  sections: { title: string; emoji: string; done: number; total: number }[];
}

const rating = (p: number) => {
  if (p >= 90) return { label: "Legendary", color: "text-emerald-500", emoji: "🏆", note: "Outstanding execution. You crushed it — keep this rhythm and your next challenge will feel effortless." };
  if (p >= 70) return { label: "Strong", color: "text-primary", emoji: "💪", note: "Solid work. Tighten the gaps and you'll hit 100% next cycle." };
  if (p >= 50) return { label: "Decent", color: "text-amber-500", emoji: "⚡", note: "Halfway there. Cut distractions and double down on weak sections." };
  if (p >= 25) return { label: "Needs Work", color: "text-orange-500", emoji: "⚠️", note: "Inconsistent. Block fixed study hours and reduce phone time." };
  return { label: "Restart", color: "text-destructive", emoji: "🔥", note: "Honestly — this didn't happen. Reset, pick fewer tasks, build the habit first." };
};

const TargetHistoryPage = () => {
  const [records, setRecords] = useState<ChallengeRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });

  const stats = useMemo(() => {
    if (!records.length) return null;
    const avg = Math.round(records.reduce((a, r) => a + r.percent, 0) / records.length);
    const best = Math.max(...records.map((r) => r.percent));
    return { avg, best, count: records.length };
  }, [records]);

  const deleteRecord = (id: string) => {
    const next = records.filter((r) => r.id !== id);
    setRecords(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    toast.success("Report removed");
  };

  const clearAll = () => {
    setRecords([]);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    toast.success("History cleared");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "var(--gradient-primary)" }}>
                <History className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">Target History</h1>
                <p className="text-sm text-muted-foreground">Reports from every 7-day challenge.</p>
              </div>
            </div>
            {records.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl">
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                    <AlertDialogDescription>This deletes every saved challenge report. Cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Clear</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Challenges", value: stats.count, icon: TargetIcon },
                { label: "Average", value: `${stats.avg}%`, icon: TrendingUp },
                { label: "Best", value: `${stats.best}%`, icon: Trophy },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Icon className="w-4 h-4" /> <span className="text-xs uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="text-2xl font-extrabold">{value}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {records.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-lg p-12 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">No challenge reports yet</p>
            <p className="text-sm text-muted-foreground">Finish your 7-day challenge and a full report will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((r, idx) => {
              const rt = rating(r.percent);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * idx }}
                  className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-lg p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{rt.emoji}</span>
                        <span className={`font-bold ${rt.color}`}>{rt.label}</span>
                        <span className="text-xs text-muted-foreground">· {r.percent}% score</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} —{" "}
                        {new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <button onClick={() => deleteRecord(r.id)} className="p-1.5 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Delete report">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{r.completedTasks} of {r.totalTasks} tasks completed</span>
                      <span className="font-bold text-foreground">{r.percent}%</span>
                    </div>
                    <Progress value={r.percent} className="h-2.5 rounded-full" />
                  </div>

                  {r.sections.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      {r.sections.map((s) => {
                        const sp = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
                        return (
                          <div key={s.title} className="rounded-xl bg-muted/40 p-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold truncate">{s.emoji} {s.title}</span>
                              <span className="text-[10px] text-muted-foreground">{s.done}/{s.total}</span>
                            </div>
                            <Progress value={sp} className="h-1.5 rounded-full" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">What this means</p>
                    <p className="text-sm text-foreground">{rt.note}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TargetHistoryPage;
