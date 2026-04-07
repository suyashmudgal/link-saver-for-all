import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FolderOpen, Shield, Zap, ArrowRight, Star, Users, Lock, Globe, Layers,
  CheckCircle2, Search, Bell, Share2, BarChart3, BookOpen
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
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const Landing = () => {
  const features = [
    { icon: FolderOpen, title: "Smart Folders", desc: "Nested folder system with drag-and-drop organization." },
    { icon: Shield, title: "Bank-Level Security", desc: "Row-level isolation ensures your data is truly private." },
    { icon: Zap, title: "Instant Search", desc: "Find anything across all your content in milliseconds." },
    { icon: Layers, title: "Multi-Format", desc: "Links, images, videos, and notes — all in one vault." },
    { icon: Bell, title: "Smart Alerts", desc: "Get notified about dead links, digests, and reminders." },
    { icon: BarChart3, title: "Usage Insights", desc: "Analytics dashboard to understand your saving habits." },
    { icon: Share2, title: "Public Sharing", desc: "Share curated collections via public shareable pages." },
    { icon: BookOpen, title: "Read Queue", desc: "Snooze links and resurface them when you're ready." },
    { icon: Globe, title: "Access Anywhere", desc: "Your vault syncs across all devices, always available." },
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
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <img src={logoImg} alt="Info Trunk" width={40} height={40} className="rounded-xl" />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Info Trunk</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth"><Button variant="ghost" className="hidden sm:inline-flex">Login</Button></Link>
            <Link to="/auth?signup=true">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        <Suspense fallback={null}><HeroScene /></Suspense>
        <div className="absolute inset-0 -z-20">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="initial" animate="animate" variants={stagger} className="text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 text-sm font-medium text-primary">
              <Zap className="w-3.5 h-3.5" /> Now with AI-Powered Summaries
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-6">
              Your Digital
              <br />
              <span className="text-gradient">Knowledge Hub</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Save, organize, and rediscover your links, notes, images, and videos.
              Smart folders, AI summaries, and powerful search — all in one beautiful vault.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20 px-8 text-base h-12">
                  Start Free <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base">Sign In</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/50">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Power Users</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Nine features that make Info Trunk the last link manager you'll ever need.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover-lift">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent -z-10" />
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold mb-6 shadow-lg">
                  {step.n}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
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
                className="p-6 rounded-2xl bg-card border border-border hover-lift">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-accent text-accent" />)}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">{t.avatar}</div>
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
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: 'var(--gradient-primary)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Organize Your Digital Life?</h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Join thousands who trust Info Trunk. Free to start, powerful to grow.</p>
              <Link to="/auth?signup=true">
                <Button size="lg" variant="secondary" className="px-8 shadow-lg text-base h-12">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Info Trunk" width={32} height={32} className="rounded-lg" />
            <span className="font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Info Trunk</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Info Trunk. All rights reserved.</p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
};

export default Landing;
