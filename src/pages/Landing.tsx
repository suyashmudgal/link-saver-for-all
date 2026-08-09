import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Check, Star, Quote,
  FolderOpen, Search, Shield, Bell, Share2, Clock, Tag, Lock
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
    { icon: FolderOpen, kicker: "01 / Organise", title: "Folders that nest", desc: "Colour-coded, nested folders with live previews. Move anything anywhere, in one drag." },
    { icon: Search, kicker: "02 / Find", title: "Instant search", desc: "Search titles, URLs, notes, and tags at once. Filter by type, folder, or date in a keystroke." },
    { icon: Tag, kicker: "03 / Label", title: "Tags & favourites", desc: "Add as many tags as you like, star what matters, and pull it back up in seconds." },
    { icon: Clock, kicker: "04 / Later", title: "Time capsules", desc: "Seal a link with a note to your future self. It unlocks on the date you choose." },
    { icon: Bell, kicker: "05 / Maintain", title: "Dead-link watch", desc: "We check every URL you save and quietly restore broken ones from the Wayback Machine." },
    { icon: Share2, kicker: "06 / Share", title: "Public collections", desc: "Publish any folder as a clean, shareable page with its own link. Turn it off anytime." },
  ];

  const steps = [
    { n: "01", t: "Save anything", d: "Paste a link, upload a file, or write a note. Info Trunk fetches the title, image, and preview for you." },
    { n: "02", t: "Put it somewhere", d: "Drop it in a folder, tag it, and add a line about why you saved it." },
    { n: "03", t: "Find it again", d: "Search, filter, or open a shared collection. Nothing you keep gets lost." },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="Info Trunk" width={32} height={32} className="rounded-lg ring-1 ring-primary/30" />
            <span className="text-[15px] font-semibold tracking-tight">Info Trunk</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-foreground transition-colors">Features</a>
            <a href="#manifesto" className="hover:text-foreground transition-colors">Why</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button></Link>
            <Link to="/auth?signup=true">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                Get started <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — single full-cover statement */}
      <section className="relative min-h-[100svh] flex flex-col justify-center items-center text-center px-6 pt-28 pb-20 border-b border-border/40">
        <div className="absolute inset-0 -z-10 noise-overlay opacity-[0.3]" />
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-10"
        >
          <span className="w-8 gold-divider" /> A private home for everything you save <span className="w-8 gold-divider" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-serif-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.94] tracking-tight max-w-5xl"
        >
          Keep every link.<br />
          <span className="text-gradient animate-shimmer">Actually find it later.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }}
          className="mt-8 max-w-xl text-[16px] leading-[1.75] text-muted-foreground"
        >
          Info Trunk is a bookmark manager for links, files, and notes — organised in folders,
          searchable in a keystroke, and shareable when you want it to be.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/auth?signup=true">
            <Button size="lg" className="h-12 px-8 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium">
              Create your free vault <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <a href="#how">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-md border-border/60 hover:border-primary/50 hover:text-primary">
              See how it works
            </Button>
          </a>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
          {["Free to start", "No card needed", "Ready in 30 seconds"].map(t => (
            <span key={t} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" />{t}</span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-28 lg:py-36 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div {...fadeUp}>
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary mb-6">How it works</div>
            <h2 className="font-serif-display text-4xl lg:text-6xl leading-[1.05] tracking-tight mb-10">
              Three steps. <em>That's the whole thing.</em>
            </h2>
            <div className="space-y-8">
              {steps.map(s => (
                <div key={s.n} className="flex gap-6">
                  <span className="font-serif-display text-2xl text-primary/70 tabular-nums shrink-0">{s.n}</span>
                  <div>
                    <h3 className="text-lg font-semibold mb-1.5">{s.t}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/auth?signup=true" className="inline-block mt-10">
              <Button size="lg" className="h-12 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                Start saving <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>

          {/* Product specimen card */}
          <motion.div {...fadeUp} className="relative">
            <div className="absolute -inset-4 rounded-lg bg-primary/5 blur-2xl" />
            <div className="relative rounded-md border border-primary/25 bg-card/70 backdrop-blur-xl p-7 shadow-2xl" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your vault</div>
                  <div className="font-serif-display text-2xl mt-1">Reading · 71 saved</div>
                </div>
                <div className="w-9 h-9 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { t: "On the architecture of attention", k: "article · 12 min" },
                  { t: "Notes from a quiet workshop", k: "video · saved 3d ago" },
                  { t: "The economics of taste", k: "article · favourite" },
                  { t: "Letter to myself, next spring", k: "note · time capsule" },
                ].map((row, i) => (
                  <div key={row.t} className="group flex items-start justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{row.t}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-0.5">{row.k}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section id="capabilities" className="py-28 lg:py-36 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div {...fadeUp} className="max-w-2xl mb-20">
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary mb-5">Features</div>
            <h2 className="font-serif-display text-4xl lg:text-6xl leading-[1.05] tracking-tight">
              Everything a bookmark manager should do. <em>Nothing it shouldn't.</em>
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

      {/* MANIFESTO */}
      <section id="manifesto" className="py-32 lg:py-44 border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Quote className="w-10 h-10 text-primary/40 mx-auto mb-10" strokeWidth={1} />
          <p className="font-serif-display text-3xl md:text-5xl leading-[1.25] tracking-tight">
            "A saved link is only worth something if you can <span className="text-gradient">find it again</span> on the day you need it."
          </p>
          <div className="mt-12 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="w-8 gold-divider" /> Info Trunk <span className="w-8 gold-divider" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 border-b border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 grid md:grid-cols-3 gap-px bg-border/40">
          {[
            { t: "It replaced four apps and a notebook. Everything I save finally lives in one place.", n: "Sarah J.", r: "Design Director" },
            { t: "The search is fast enough that I actually go back to my bookmarks now.", n: "Michael C.", r: "Staff Engineer" },
            { t: "Time capsules and shared collections changed how I use the web. Quietly brilliant.", n: "Emily R.", r: "Essayist" },
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

      {/* CTA */}
      <section className="py-32 lg:py-44">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-8" strokeWidth={1.25} />
          <h2 className="font-serif-display text-5xl md:text-7xl leading-[1] tracking-tight mb-8">
            Your library is <em>waiting.</em>
          </h2>
          <p className="text-muted-foreground text-[15px] leading-[1.7] max-w-md mx-auto mb-10">
            Bring everything you've saved across browsers, notes, and bookmarks into one calm, searchable place.
          </p>
          <Link to="/auth?signup=true">
            <Button size="lg" className="h-12 px-10 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium">
              Create your free vault <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Free forever · No credit card</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="" width={24} height={24} className="rounded-md" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Info Trunk · {new Date().getFullYear()}</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">A calm archive — crafted with care</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
