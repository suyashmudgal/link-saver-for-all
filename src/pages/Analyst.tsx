import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, BarChart3, TrendingUp, Tag, Calendar, RefreshCw, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useItems, useFolders } from "@/hooks/use-items";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const GOLD = ["hsl(44 60% 56%)", "hsl(43 76% 72%)", "hsl(40 35% 45%)", "hsl(35 50% 60%)", "hsl(48 70% 65%)", "hsl(30 40% 50%)"];

const Analyst = () => {
  const { data: items = [] } = useItems();
  const { data: folders = [] } = useFolders();
  const { toast } = useToast();
  const [brief, setBrief] = useState<string>("");
  const [loading, setLoading] = useState(false);

  /* ───────── Derived analytics ───────── */
  const analytics = useMemo(() => {
    const typeMap: Record<string, number> = {};
    const tagMap: Record<string, number> = {};
    const domainMap: Record<string, number> = {};
    items.forEach(i => {
      typeMap[i.type] = (typeMap[i.type] || 0) + 1;
      (i.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
      if (i.type === "link") {
        try { const d = new URL(i.content).hostname.replace(/^www\./, ""); domainMap[d] = (domainMap[d] || 0) + 1; } catch {}
      }
    });

    const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
    const topTags = Object.entries(tagMap).sort((a,b)=>b[1]-a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    const topDomains = Object.entries(domainMap).sort((a,b)=>b[1]-a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    // 12-week velocity
    const now = new Date();
    const velocity: { week: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now); start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(now); end.setDate(end.getDate() - i * 7);
      const count = items.filter(it => { const d = new Date(it.created_at); return d >= start && d < end; }).length;
      velocity.push({ week: `W${12 - i}`, count });
    }

    // Reading-hour heatmap (by hour of day saved)
    const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}`, count: 0 }));
    items.forEach(i => { const h = new Date(i.created_at).getHours(); hourly[h].count++; });

    const favPct = items.length ? Math.round((items.filter(i=>i.is_favorite).length / items.length) * 100) : 0;
    const readPct = items.length ? Math.round((items.filter(i=>i.is_read).length / items.length) * 100) : 0;
    const deadLinks = items.filter(i => i.link_status === "dead").length;

    return { typeData, topTags, topDomains, velocity, hourly, favPct, readPct, deadLinks };
  }, [items]);

  const generateBrief = async () => {
    if (items.length === 0) {
      toast({ title: "Vault is empty", description: "Add a few items before requesting a brief.", variant: "destructive" });
      return;
    }
    setLoading(true); setBrief("");
    try {
      const summary = {
        total: items.length,
        folders: folders.length,
        types: analytics.typeData,
        topTags: analytics.topTags.slice(0, 8),
        topDomains: analytics.topDomains,
        favoritesPct: analytics.favPct,
        readPct: analytics.readPct,
        deadLinks: analytics.deadLinks,
        recentTitles: items.slice(0, 25).map(i => ({ title: i.title, type: i.type, tags: i.tags })),
      };
      const { data, error } = await supabase.functions.invoke("analyst-brief", { body: { summary } });
      if (error) throw error;
      setBrief(data?.brief || "No brief returned.");
    } catch (e: any) {
      toast({ title: "Analyst unavailable", description: e.message || "Try again in a moment.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const chartCfg: ChartConfig = { count: { label: "Items", color: "hsl(var(--primary))" }, value: { label: "Count", color: "hsl(var(--primary))" } };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 gold-divider" />
              <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-primary">Premium · The Data Analyst</p>
            </div>
            <h1 className="font-serif-display text-5xl md:text-6xl tracking-tight leading-[1.02]">
              Your archive, <em className="text-gradient">analysed.</em>
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl leading-relaxed">
              A quiet brief on what you've collected — the patterns, the favourites, the gaps. Charts kept honest, prose kept short.
            </p>
          </div>
          <Button onClick={generateBrief} disabled={loading} size="lg" className="h-12 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {brief ? "Re-generate Brief" : "Generate AI Brief"}
          </Button>
        </motion.div>

        {/* AI Brief card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-10 relative overflow-hidden rounded-md border border-primary/30 bg-card/80 backdrop-blur-xl">
          <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
          <div className="px-6 py-3 border-b border-border/50 flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Executive Brief
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{items.length} records · {folders.length} folders</span>
          </div>
          <div className="p-8 min-h-[180px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm">The analyst is reading your archive…</p>
              </div>
            ) : brief ? (
              <div className="prose prose-sm dark:prose-invert max-w-none font-serif-display text-[1.15rem] leading-[1.7] [&_p]:font-serif-display [&_strong]:text-primary [&_strong]:font-normal [&_em]:text-primary">
                <ReactMarkdown>{brief}</ReactMarkdown>
              </div>
            ) : (
              <p className="font-serif-display text-2xl md:text-3xl leading-snug text-muted-foreground/80 max-w-2xl">
                Press <span className="text-primary not-italic">Generate AI Brief</span> and an analyst will study your {items.length} entries, then write you a one-page report on what your library is really about.
              </p>
            )}
          </div>
        </motion.div>

        {/* Metric strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { l: "Total entries", v: items.length, icon: BarChart3 },
            { l: "Read %", v: `${analytics.readPct}%`, icon: TrendingUp },
            { l: "Favourites %", v: `${analytics.favPct}%`, icon: Tag },
            { l: "Dead links", v: analytics.deadLinks, icon: ArrowUpRight },
          ].map(s => (
            <Card key={s.l} className="p-5 rounded-md border-border/50 bg-card/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.l}</span>
                <s.icon className="w-4 h-4 text-primary/70" strokeWidth={1.5} />
              </div>
              <div className="font-serif-display text-4xl text-gradient leading-none">{s.v}</div>
            </Card>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">
          <Card className="lg:col-span-2 p-6 rounded-md border-border/50 bg-card/70 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Velocity</div>
                <h3 className="font-serif-display text-2xl mt-1">Twelve weeks of curation</h3>
              </div>
              <Calendar className="w-4 h-4 text-primary/60" strokeWidth={1.5} />
            </div>
            <ChartContainer config={chartCfg} className="h-[260px] w-full">
              <AreaChart data={analytics.velocity} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="vel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#vel)" />
              </AreaChart>
            </ChartContainer>
          </Card>

          <Card className="p-6 rounded-md border-border/50 bg-card/70 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Composition</div>
            <h3 className="font-serif-display text-2xl mt-1 mb-3">By type</h3>
            {analytics.typeData.length ? (
              <ChartContainer config={chartCfg} className="h-[240px]">
                <PieChart>
                  <Pie data={analytics.typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {analytics.typeData.map((_, i) => <Cell key={i} fill={GOLD[i % GOLD.length]} />)}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">No data</div>}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {analytics.typeData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD[i % GOLD.length] }} />
                  <span className="capitalize">{d.name}</span><span className="text-foreground tabular-nums">{d.value}</span>
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <Card className="p-6 rounded-md border-border/50 bg-card/70 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Top sources</div>
            <h3 className="font-serif-display text-2xl mt-1 mb-4">Where you read from</h3>
            {analytics.topDomains.length ? (
              <ChartContainer config={chartCfg} className="h-[260px]">
                <BarChart data={analytics.topDomains} layout="vertical" margin={{ left: 20, right: 16 }}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No link domains tracked yet</div>}
          </Card>

          <Card className="p-6 rounded-md border-border/50 bg-card/70 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Themes</div>
            <h3 className="font-serif-display text-2xl mt-1 mb-4">Top tags</h3>
            {analytics.topTags.length ? (
              <div className="space-y-3">
                {analytics.topTags.map(t => {
                  const max = analytics.topTags[0].value;
                  return (
                    <div key={t.name} className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">#{t.name}</Badge>
                      <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full" style={{ width: `${(t.value / max) * 100}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-6 text-right">{t.value}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground">Tag your items to see themes emerge.</p>}
          </Card>
        </div>

        <Card className="p-6 rounded-md border-border/50 bg-card/70 backdrop-blur-xl">
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Rhythm</div>
          <h3 className="font-serif-display text-2xl mt-1 mb-4">When you save (by hour)</h3>
          <ChartContainer config={chartCfg} className="h-[180px]">
            <BarChart data={analytics.hourly}>
              <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analyst;