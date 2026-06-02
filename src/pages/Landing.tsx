import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Sparkles, Check, Star, Quote,
  FolderOpen, Search, Brain, Shield, Bell, Share2, BarChart3, BookOpen, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import logoImg from "/logo.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" } as const,
  transition: { duration: 0.8, ease: "easeOut" as const },
};

const Landing = () => {
  const capabilities = [
    { icon: Brain, kicker: "01 / Intelligence", title: "AI Data Analyst", desc: "An in-house analyst that reads every link you've ever saved and reports back. Trends, themes, blind spots — quantified." },
    { icon: FolderOpen, kicker: "02 / Architecture", title: "Curatorial Folders", desc: "Nested, colour-coded, drag-to-rearrange. Built for archivists, not for tab hoarders." },
    { icon: Search, kicker: "03 / Retrieval", title: "Instant Recall", desc: "Sub-100ms search across titles, descriptions, tags, and notes. The library never grows heavier than you can lift." },
    { icon: BookOpen, kicker: "04 / Discipline", title: "Read Queue & Capsules", desc: "Schedule what matters now. Seal what matters later. Open it on the date you set." },
    { icon: Bell, kicker: "05 / Stewardship", title: "Link Decay Watch", desc: "We monitor every URL in your vault and quietly restore the dead ones from the Wayback Machine." },
    { icon: Share2, kicker: "06 / Authorship", title: "Public Collections", desc: "Publish a folder as a shareable page. Your taste, your URL, your readership." },
  ];

  const metrics = [
    { v: "71k+", l: "Links curated" },
    { v: "99.98%", l: "Uptime SLA" },
    { v: "<80ms", l: "Search latency" },
    { v: "AES-256", l: "Encryption at rest" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      {/* ───────────── NAV ───────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="Info Trunk" width={32} height={32} className="rounded-lg ring-1 ring-primary/30" />
            <span className="text-[15px] font-semibold tracking-tight">Info Trunk</span>
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-l border-border/60 pl-3 ml-2">Est. MMXXV</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
            <a href="#analyst" className="hover:text-foreground transition-colors">Data Analyst</a>
            <a href="#manifesto" className="hover:text-foreground transition-colors">Manifesto</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button></Link>
            <Link to="/auth?signup=true">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                Enter Vault <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────────── HERO — SPLIT SCREEN ───────────── */}
      <section className="relative pt-24 lg:pt-28">
        <div className="absolute inset-0 -z-10 noise-overlay opacity-[0.35]" />
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-[calc(100vh-6rem)] border-b border-border/40">
          {/* LEFT — typographic */}
          <div className="relative flex flex-col justify-between px-6 lg:px-16 py-14 lg:py-20 border-r border-border/40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
              className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="w-8 gold-divider" />
              A private library for the modern mind
            </motion.div>

            <div className="space-y-10">
              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="font-serif-display text-[clamp(3.2rem,8vw,7rem)] leading-[0.95] tracking-tight"
              >
                Save with<br />
                <span className="text-gradient animate-shimmer">intention.</span><br />
                Recall with<br />
                <em className="font-serif-display">grace.</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
                className="max-w-md text-[15px] leading-[1.7] text-muted-foreground"
              >
                Info Trunk is a curated vault for the links, ideas, and references that build a life of thinking. No infinite scroll. No algorithmic noise. Just a quiet room where what you save grows into what you know.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Link to="/auth?signup=true">
                  <Button size="lg" className="h-12 px-7 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium">
                    Begin Your Vault <ArrowUpRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="h-12 px-7 rounded-md border-border/60 hover:border-primary/50 hover:text-primary">
                    View Demo
                  </Button>
                </Link>
              </motion.div>

              <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                {["Free tier", "No card", "30s setup"].map(t => (
                  <span key={t} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" />{t}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              <span>№ 001 / Premium Edition</span>
              <span>Scroll to read ↓</span>
            </div>
          </div>

          {/* RIGHT — visual specimen */}
          <div className="relative bg-secondary/30 overflow-hidden flex items-center justify-center p-8 lg:p-14">
            <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              <span>Plate I</span>
              <span>The Vault — Interior</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.2 }}
              className="relative w-full max-w-[480px] aspect-[3/4] rounded-md border border-primary/30 bg-card/60 backdrop-blur-xl p-7 shadow-2xl"
              style={{ boxShadow: "var(--shadow-elegant)" }}
            >
              {/* Specimen header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Specimen</div>
                  <div className="font-serif-display text-2xl mt-1">Volume I — Folio 71</div>
                </div>
                <div className="w-9 h-9 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* Mock items */}
              <div className="mt-5 space-y-3">
                {[
                  { t: "On the architecture of attention", k: "essay · 12m" },
                  { t: "Notes from a quiet workshop", k: "video · saved 3d" },
                  { t: "The economics of taste", k: "article · re-reading" },
                  { t: "Aldus Manutius and the pocket book", k: "history · capsule" },
                ].map((row, i) => (
                  <motion.div
                    key={row.t}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                    className="group flex items-start justify-between gap-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{row.t}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-0.5">{row.k}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  </motion.div>
                ))}
              </div>

              <div className="absolute bottom-6 left-7 right-7 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Analysed by AI</span>
                <span>71 entries</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───────────── METRIC STRIP ───────────── */}
      <section className="border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/40">
          {metrics.map((m, i) => (
            <motion.div key={m.l} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="py-10 px-6 first:pl-0 last:pr-0">
              <div className="font-serif-display text-5xl text-gradient leading-none">{m.v}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">{m.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────── DATA ANALYST FEATURE ───────────── */}
      <section id="analyst" className="py-28 lg:py-40 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-primary mb-6">
              <span className="w-6 gold-divider" /> New · Premium Feature
            </div>
            <h2 className="font-serif-display text-5xl lg:text-7xl leading-[1] tracking-tight mb-8">
              A <em>private analyst</em><br /> for your <span className="text-gradient">private library.</span>
            </h2>
            <p className="text-[15px] leading-[1.8] text-muted-foreground max-w-lg mb-8">
              The Data Analyst studies your archive the way a research assistant studies a desk. It reads every entry, charts what you've collected, and writes you a quiet brief — themes you're drawn to, gaps you're avoiding, threads worth pulling.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                "Charted distribution by source, tag, and intent",
                "AI-written executive summary of your reading life",
                "Suggestions for what to revisit, archive, or finally read",
                "Velocity graphs — see how your curation grows over time",
              ].map(t => (
                <li key={t} className="flex items-start gap-3 text-foreground/85">
                  <span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex items-center gap-4">
              <Link to="/auth?signup=true">
                <Button size="lg" className="h-12 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                  Try Data Analyst <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Included free</span>
            </div>
          </motion.div>

          {/* Mock analyst card */}
          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-4 rounded-lg bg-primary/5 blur-2xl" />
            <div className="relative rounded-md border border-border/60 bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-secondary/40">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" /> Analyst Brief — Q3
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">71 records · 13 folders</span>
              </div>
              <div className="p-6 space-y-5">
                <p className="font-serif-display text-2xl leading-snug">
                  "Your archive leans heavily toward <span className="text-primary not-italic">systems thinking</span> and <span className="text-primary not-italic">long-form essays</span>. You revisit 4× more than the median user."
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "Top theme", v: "Architecture" },
                    { l: "Velocity", v: "+18% / wk" },
                    { l: "Re-reads", v: "32%" },
                  ].map(c => (
                    <div key={c.l} className="p-3 rounded-sm border border-border/50 bg-background/40">
                      <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{c.l}</div>
                      <div className="font-semibold text-sm mt-1">{c.v}</div>
                    </div>
                  ))}
                </div>
                {/* Mini bar chart */}
                <div className="flex items-end gap-1.5 h-24 pt-2">
                  {[28, 52, 41, 67, 48, 81, 60, 73, 90, 58, 76, 92].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/40 to-primary" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────────── CAPABILITIES ───────────── */}
      <section id="capabilities" className="py-28 lg:py-36 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div {...fadeUp} className="max-w-2xl mb-20">
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary mb-5">The Capabilities</div>
            <h2 className="font-serif-display text-5xl lg:text-7xl leading-[1.02] tracking-tight">
              Six instruments. <em>One quiet vault.</em>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border/40">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.7 }}
                className="group relative p-10 border-b border-r border-border/40 hover:bg-secondary/30 transition-colors duration-500"
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-8">{c.kicker}</div>
                <c.icon className="w-6 h-6 text-primary mb-5 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.25} />
                <h3 className="font-serif-display text-2xl mb-3">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <ArrowUpRight className="absolute top-10 right-10 w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── MANIFESTO ───────────── */}
      <section id="manifesto" className="py-32 lg:py-44 border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Quote className="w-10 h-10 text-primary/40 mx-auto mb-10" strokeWidth={1} />
          <p className="font-serif-display text-3xl md:text-5xl leading-[1.25] tracking-tight">
            "The library is not a warehouse — it is a <span className="text-gradient">conversation</span> between what you've kept and who you're becoming."
          </p>
          <div className="mt-12 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="w-8 gold-divider" /> Info Trunk, House Notes <span className="w-8 gold-divider" />
          </div>
        </div>
      </section>

      {/* ───────────── TESTIMONIAL ───────────── */}
      <section className="py-24 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-px bg-border/40">
          {[
            { t: "It replaced four apps and a notebook. The analyst is the closest thing to a thinking partner I've found.", n: "Sarah J.", r: "Design Director" },
            { t: "The aesthetic alone is worth the switch. It treats my reading like it matters.", n: "Michael C.", r: "Staff Engineer" },
            { t: "Capsules and the read queue actually changed how I consume the web. Quietly profound.", n: "Emily R.", r: "Essayist" },
          ].map(q => (
            <div key={q.n} className="bg-background p-10">
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
              </div>
              <p className="text-[15px] leading-[1.7] text-foreground/90 mb-8">"{q.t}"</p>
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{q.n} · <span className="text-foreground/70">{q.r}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="py-32 lg:py-44">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-8" strokeWidth={1.25} />
          <h2 className="font-serif-display text-5xl md:text-7xl leading-[1] tracking-tight mb-8">
            Your library is <em>waiting.</em>
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.7] max-w-md mx-auto mb-10">
            Bring everything you've already saved across browsers, notes, and bookmarks into one quiet, intelligent place.
          </p>
          <Link to="/auth?signup=true">
            <Button size="lg" className="h-13 px-10 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium">
              Enter the Vault <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Free forever · No credit card</div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="border-t border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="" width={24} height={24} className="rounded-md" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Info Trunk · {new Date().getFullYear()}</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">A premium archive — crafted with care</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
