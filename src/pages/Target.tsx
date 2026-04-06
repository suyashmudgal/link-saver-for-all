import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Circle, Flame, Trophy, Zap, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";

interface TaskItem {
  id: string;
  label: string;
}

interface Section {
  title: string;
  emoji: string;
  color: string;
  tasks: TaskItem[];
}

const STORAGE_KEY = "infotrunk-target-challenge";

const sections: Section[] = [
  {
    title: "DSA (Mandatory)",
    emoji: "🧠",
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
    tasks: [
      { id: "dsa-1", label: "Last Occurrence Of A Char" },
      { id: "dsa-2", label: "Reverse A String (RE)" },
      { id: "dsa-3", label: "Add Strings (RE)" },
      { id: "dsa-4", label: "Palindrome Check (RE)" },
      { id: "dsa-5", label: "Remove All Occurrences of a Substring" },
      { id: "dsa-6", label: "Print All Subarrays Using RE" },
      { id: "dsa-7", label: "Buy & Sell Stocks" },
      { id: "dsa-8", label: "House Robber Problem" },
      { id: "dsa-9", label: "Integer to English Words" },
      { id: "dsa-10", label: "Wild Card Matching" },
      { id: "dsa-11", label: "Perfect Squares" },
      { id: "dsa-12", label: "Minimum Cost For Tickets" },
      { id: "dsa-13", label: "Number Of Dice Roll With Target Sum" },
      { id: "dsa-14", label: "DnC Level 1, 2, 3, 4" },
    ],
  },
  {
    title: "Aptitude",
    emoji: "📐",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    tasks: [
      { id: "apt-1", label: "Mensuration" },
      { id: "apt-2", label: "Mensuration 2D" },
      { id: "apt-3", label: "Mensuration 3D" },
      { id: "apt-4", label: "Ages" },
      { id: "apt-5", label: "Averages" },
      { id: "apt-6", label: "Basic Calculation Tricks" },
      { id: "apt-7", label: "Boat & Stream" },
    ],
  },
  {
    title: "English",
    emoji: "📖",
    color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    tasks: [
      { id: "eng-1", label: "Watch 1 English video daily (Total 7 days)" },
    ],
  },
  {
    title: "Deep Learning",
    emoji: "🤖",
    color: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    tasks: [
      { id: "dl-1", label: "Vanishing Gradient Problem & Sigmoid" },
      { id: "dl-2", label: "Sigmoid Activation Function (1.0 & 2.0)" },
      { id: "dl-3", label: "Tanh Activation Function" },
      { id: "dl-4", label: "ReLU, Leaky ReLU, Parametric ReLU" },
      { id: "dl-5", label: "ELU Activation Function" },
      { id: "dl-6", label: "Softmax" },
      { id: "dl-7", label: "Which Activation Function to Use" },
      { id: "dl-8", label: "Loss Function vs Cost Function" },
      { id: "dl-9", label: "Regression Cost Function" },
      { id: "dl-10", label: "Classification Loss Functions" },
      { id: "dl-11", label: "Which Loss Function to Use" },
      { id: "dl-12", label: "Gradient Descent Optimizers" },
    ],
  },
  {
    title: "Python Revision",
    emoji: "🐍",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    tasks: [
      { id: "py-1", label: "Variables, Data Types" },
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
    title: "SQL",
    emoji: "🗃️",
    color: "from-sky-500/20 to-indigo-500/20 border-sky-500/30",
    tasks: [
      { id: "sql-1", label: "SELECT, WHERE, ORDER BY, LIMIT" },
      { id: "sql-2", label: "DISTINCT, AND, OR, NOT" },
      { id: "sql-3", label: "BETWEEN, IN, LIKE" },
      { id: "sql-4", label: "COUNT, SUM, AVG, MIN, MAX" },
      { id: "sql-5", label: "GROUP BY" },
      { id: "sql-6", label: "HAVING" },
      { id: "sql-7", label: "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL JOIN" },
    ],
  },
];

const allTasks = sections.flatMap((s) => s.tasks);
const totalTasks = allTasks.length;

const TargetPage = () => {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed]);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = completed.size;
  const progress = Math.round((completedCount / totalTasks) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">7 Days Challenge</h1>
              <p className="text-sm text-muted-foreground">No excuses. Just execution.</p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm md:text-base leading-relaxed">
                <p className="font-bold text-foreground">Bhai sun dhyaan se ⚠️</p>
                <p className="text-muted-foreground">
                  Tu already kaafi time waste kar chuka hai. Aise hi chalta raha na toh life mein kuch achieve karna mushkil ho jayega.
                </p>
                <p className="text-muted-foreground">
                  Free Fire aur faltu distractions band kar de 🎮❌
                </p>
                <p className="text-muted-foreground">
                  Ab serious hone ka time aa gaya hai.
                </p>
                <p className="font-semibold text-foreground mt-3">
                  Yeh tera 7 din ka challenge hai — no excuses ⚡
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-sm">Progress</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {completedCount} / {totalTasks} completed
            </span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{progress}% done</span>
            {progress === 100 && (
              <span className="text-xs font-bold text-accent flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Challenge Complete! 🎉
              </span>
            )}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sIdx) => {
            const sectionDone = section.tasks.filter((t) => completed.has(t.id)).length;
            const sectionTotal = section.tasks.length;
            const sectionComplete = sectionDone === sectionTotal;

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * sIdx }}
                className={`rounded-2xl border bg-gradient-to-br ${section.color} bg-card p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{section.emoji}</span>
                    <h2 className="text-lg font-bold">{section.title}</h2>
                    {sectionComplete && <CheckCircle2 className="w-5 h-5 text-accent" />}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-background/60 text-muted-foreground">
                    {sectionDone}/{sectionTotal}
                  </span>
                </div>

                <div className="space-y-1">
                  {section.tasks.map((task) => {
                    const done = completed.has(task.id);
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggle(task.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                          done
                            ? "bg-accent/10 text-muted-foreground"
                            : "hover:bg-background/50"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                        )}
                        <span
                          className={`text-sm transition-all ${
                            done ? "line-through opacity-60" : "text-foreground"
                          }`}
                        >
                          {task.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 mb-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5 p-6 text-center"
        >
          <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-base md:text-lg font-bold text-foreground mb-2">
            If you complete this in 7 days, you are ahead of 90% of people.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Now decide — <span className="text-destructive">distraction</span> or{" "}
            <span className="text-accent font-bold">success</span>.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TargetPage;
