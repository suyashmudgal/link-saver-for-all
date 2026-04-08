import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FolderOpen, Shield, Zap, ArrowRight, Star, Lock, Globe, Layers,
  Bell, Share2, BarChart3, BookOpen, Sparkles, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { lazy, Suspense } from "react";
import logoImg from "/logo.png";

const HeroScene = lazy(() => import("@/components/HeroScene"));
const BackgroundScene = lazy(() => import("@/components/BackgroundScene"));

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
};

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const Landing = () => {
  const features = [
    { icon: FolderOpen, title: "Smart Folders", desc: "Nested folder system with drag-and-drop organization.", color: "from-violet-500/20 to-purple-500/10" },
    { icon: Shield, title: "Bank-Level Security", desc: "Row-level isolation ensures your data is truly private.", color: "from-emerald-500/20 to-green-500/10" },
    { icon: Zap, title: "Instant Search", desc: "Find anything across all your content in milliseconds.", color: "from-amber-500/20 to-orange-500/10" },
    { icon: Layers, title: "Multi-Format", desc: "Links, images, videos, and notes — all in one vault.", color: "from-blue-500/20 to-cyan-500/10" },
    { icon: Bell, title: "Smart Alerts", desc: "Get notified about dead links, digests, and reminders.", color: "from-pink-500/20 to-rose-500/10" },
    { icon: BarChart3, title: "Usage Insights", desc: "Analytics dashboard to understand your saving habits.", color: "from-indigo-500/20 to-violet-500/10" },
    { icon: Share2, title: "Public Sharing", desc: "Share curated collections via public shareable pages.", color: "from-teal-500/20 to-emerald-500/10" },
    { icon: BookOpen, title: "Read Queue", desc: "Snooze links and resurface them when you're ready.", color: "from-orange-500/20 to-amber-500/10" },
    { icon: Globe, title: "Access Anywhere", desc: "Your vault syncs across all devices, always available.", color: "from-cyan-500/20 to-blue-500/10" },
  ];

  const stats = [
    { value: "10K+", label: "Links Saved" },
    { value: "1K+", label: "Happy Users" },
    { value: "99.9%", label: "Uptime" },
    { value: "<100ms", label: "Search Speed" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Suspense fallback={null}><BackgroundScene /></Suspense>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <img src={logoImg} alt="Info Trunk" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Info Trunk</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth"><Button variant="ghost" className="hidden sm:inline-flex">Login</Button></Link>
            <Link to="/auth?signup=true">
              <Button className="shadow-lg shadow-primary/20 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
                Get Started <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-28 overflow-hidden">
        <Suspense fallback={null}><HeroScene /></Suspense>
        <div className="absolute inset-0 -z-20 mesh-gradient" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" animate="animate" variants={stagger} className="text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm font-medium text-foreground/80">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Now with AI-Powered Summaries
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.92] tracking-tight mb-6">
              Your Digital
              <br />
              <span className="text-gradient animate-gradient">Knowledge Hub</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Save, organize, and rediscover your links, notes, images, and videos.
              Smart folders, AI summaries, and powerful search — all in one beautiful vault.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?signup=true">
                <Button size="lg" className="shadow-lg shadow-primary/25 px-8 text-base h-13 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
                  Start Free <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="px-8 h-13 text-base rounded-xl glass">Sign In</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border/30 bg-muted/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-2 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Power Users</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Nine features that make Info Trunk the last link manager you'll ever need.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-card/60 backdrop-blur-lg border border-border/40 hover:border-primary/30 transition-all duration-300 hover-lift">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20 -z-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Three Steps to Organized</h2>
            <p className="text-muted-foreground text-lg">Get started in under a minute.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: "01", title: "Create Account", desc: "Sign up with email in seconds. No credit card needed." },
              { n: "02", title: "Save Anything", desc: "Add links, notes, images, videos — organize with folders & tags." },
              { n: "03", title: "Rediscover", desc: "Search, get AI summaries, and never lose a resource again." },
            ].map((step, i) => (
              <motion.div key={step.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-primary-foreground text-xl font-bold mb-6 shadow-lg shadow-primary/20" style={{ background: 'var(--gradient-primary)' }}>
                  {step.n}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-muted-foreground text-lg">Hear from people who use Info Trunk daily.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Johnson", role: "Product Designer", text: "Info Trunk replaced 4 apps for me. The folder system + search is incredible.", avatar: "SJ" },
              { name: "Michael Chen", role: "Software Engineer", text: "I save code snippets, docs, and tutorials here. The dark mode is chef's kiss.", avatar: "MC" },
              { name: "Emily Rodriguez", role: "Content Creator", text: "The read queue and weekly digest keep me on top of everything I save.", avatar: "ER" },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card/60 backdrop-blur-lg border border-border/40 hover-lift">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md" style={{ background: 'var(--gradient-primary)' }}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-14 text-center" style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Ready to Organize Your Digital Life?</h2>
              <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto text-lg">Join thousands who trust Info Trunk. Free to start, powerful to grow.</p>
              <Link to="/auth?signup=true">
                <Button size="lg" variant="secondary" className="px-10 shadow-lg text-base h-13 rounded-xl font-semibold">
                  Get Started Free <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Info Trunk" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Info Trunk</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Info Trunk. All rights reserved.</p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default Landing;
