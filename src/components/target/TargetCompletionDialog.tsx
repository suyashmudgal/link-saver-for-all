import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TargetCompletionDialog = ({ open, onClose }: Props) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-border/40 bg-card p-8 text-center shadow-2xl overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 30%, hsl(var(--primary)), transparent 70%)' }} />

            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="relative">
              {/* Animated stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + i * 0.15, type: "spring" }}
                  >
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>

              {/* Trophy */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 12 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-extrabold mb-3"
              >
                🎉 Challenge Complete!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-2 leading-relaxed"
              >
                Bhai tu legend hai! 🔥 Tune apna 7 din ka challenge poora kar liya.
                Tu ab 90% logon se aage hai.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mb-6"
              >
                Keep this momentum going — success is a habit, not a one-time thing. 💪
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Discipline = Freedom</span>
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <Button onClick={onClose} className="mt-6 rounded-xl px-8" style={{ background: 'var(--gradient-primary)' }}>
                  Let's Go! 🚀
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TargetCompletionDialog;
