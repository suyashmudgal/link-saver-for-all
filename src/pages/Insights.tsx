import { useMemo } from "react";
import { BarChart3, Link2, Star, FolderOpen, TrendingUp, Tag, Calendar, AlertTriangle, Lock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useItems, useFolders } from "@/hooks/use-items";
import DashboardLayout from "@/components/DashboardLayout";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import LinkStatusBadge from "@/components/LinkStatusBadge";

const CHART_COLORS = [
  "hsl(252 85% 60%)",  // primary purple
  "hsl(160 84% 44%)",  // green
  "hsl(340 80% 55%)",  // pink
  "hsl(200 90% 50%)",  // blue
  "hsl(30 90% 55%)",   // orange
  "hsl(280 85% 65%)",  // violet
];

const chartConfig: ChartConfig = {
  link: { label: "Links", color: CHART_COLORS[0] },
  video: { label: "Videos", color: CHART_COLORS[1] },
  image: { label: "Images", color: CHART_COLORS[2] },
  note: { label: "Notes", color: CHART_COLORS[3] },
};

const Insights = () => {
  const { data: items = [] } = useItems();
  const { data: folders = [] } = useFolders();

  const stats = useMemo(() => {
    const favorites = items.filter(i => i.is_favorite).length;
    const typeMap: Record<string, number> = {};
    items.forEach(i => { typeMap[i.type] = (typeMap[i.type] || 0) + 1; });
    const mostUsedType = Object.entries(typeMap).sort((a, b) => b[1] - a[1])[0];

    // Tags
    const tagMap: Record<string, number> = {};
    items.forEach(i => (i.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
    const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Link health
    const deadLinks = items.filter(i => i.link_status === "dead").length;
    const aliveLinks = items.filter(i => i.link_status === "alive").length;
    const unreadLinks = items.filter(i => i.type === "link" && !i.is_read).length;
    const capsules = items.filter(i => i.is_locked).length;

    return {
      total: items.length,
      favorites,
      folders: folders.length,
      mostUsedType: mostUsedType ? mostUsedType[0] : "none",
      typeData: Object.entries(typeMap).map(([name, value]) => ({ name, value })),
      topTags,
      deadLinks,
      aliveLinks,
      unreadLinks,
      capsules,
    };
  }, [items, folders]);

  // Activity data: items per day for last 30 days
  const activityData = useMemo(() => {
    const now = new Date();
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = items.filter(item => item.created_at?.startsWith(dateStr)).length;
      days.push({ date: label, count });
    }
    return days;
  }, [items]);

  // Weekly breakdown
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weeks: { week: string; count: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const count = items.filter(item => {
        if (!item.created_at) return false;
        const d = new Date(item.created_at);
        return d >= start && d < end;
      }).length;
      weeks.push({ week: `Week ${4 - i}`, count });
    }
    return weeks;
  }, [items]);

  // Recent activity
  const recentItems = useMemo(() => items.slice(0, 8), [items]);

  const activityChartConfig: ChartConfig = {
    count: { label: "Items", color: CHART_COLORS[0] },
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 gold-divider" />
            <p className="text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">The Ledger</p>
          </div>
          <h1 className="font-serif-display text-4xl tracking-tight leading-none flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" strokeWidth={1.25} /> Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-2">An overview of everything in your vault</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Items", value: stats.total, icon: Link2, color: "text-primary" },
            { label: "Favorites", value: stats.favorites, icon: Star, color: "text-amber-500" },
            { label: "Folders", value: stats.folders, icon: FolderOpen, color: "text-green-500" },
            { label: "Top Category", value: stats.mostUsedType, icon: TrendingUp, color: "text-pink-500" },
          ].map(stat => (
            <Card key={stat.label} className="p-5 bg-card border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold capitalize">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Health & Status Cards */}
        {(stats.deadLinks > 0 || stats.unreadLinks > 0 || stats.capsules > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.deadLinks > 0 && (
              <Card className="p-4 border-destructive/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{stats.deadLinks}</p>
                    <p className="text-xs text-muted-foreground">Dead Links</p>
                  </div>
                </div>
              </Card>
            )}
            {stats.unreadLinks > 0 && (
              <Card className="p-4 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{stats.unreadLinks}</p>
                    <p className="text-xs text-muted-foreground">Unread Links</p>
                  </div>
                </div>
              </Card>
            )}
            {stats.capsules > 0 && (
              <Card className="p-4 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.capsules}</p>
                    <p className="text-xs text-muted-foreground">Locked Capsules</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Distribution */}
          <Card className="p-6 bg-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
            {stats.typeData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={stats.typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {stats.typeData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data yet</div>
            )}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {stats.typeData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="capitalize text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly Activity */}
          <Card className="p-6 bg-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
            {weeklyData.some(w => w.count > 0) ? (
              <ChartContainer config={activityChartConfig} className="h-[250px]">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No activity yet</div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tags */}
          <Card className="p-6 bg-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Top Tags</h3>
            </div>
            {stats.topTags.length > 0 ? (
              <div className="space-y-3">
                {stats.topTags.map(([tag, count]) => (
                  <div key={tag} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">#{tag}</Badge>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags used yet. Add tags to your items to see analytics.</p>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-card border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            {recentItems.length > 0 ? (
              <div className="space-y-3">
                {recentItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === "link" ? "bg-blue-500/10 text-blue-500" :
                      item.type === "video" ? "bg-pink-500/10 text-pink-500" :
                      item.type === "image" ? "bg-purple-500/10 text-purple-500" :
                      "bg-amber-500/10 text-amber-500"
                    }`}>
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{item.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Insights;
