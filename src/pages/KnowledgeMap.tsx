import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { Network, Filter, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useItems } from "@/hooks/use-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  type: string;
}

interface GraphEdge {
  source: string;
  target: string;
  sharedTag: string;
}

const CATEGORY_COLORS = [
  "hsl(221, 83%, 53%)", "hsl(262, 83%, 58%)", "hsl(332, 78%, 55%)",
  "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)",
  "hsl(199, 89%, 48%)", "hsl(47, 96%, 53%)", "hsl(280, 65%, 60%)",
  "hsl(160, 60%, 45%)",
];

const KnowledgeMap = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: items = [] } = useItems();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [tooltipData, setTooltipData] = useState<{ node: GraphNode; x: number; y: number } | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => (item.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [items]);

  const tagColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allTags.forEach((tag, i) => { map[tag] = CATEGORY_COLORS[i % CATEGORY_COLORS.length]; });
    return map;
  }, [allTags]);

  const { nodes, edges } = useMemo(() => {
    const filteredItems = activeFilters.size > 0
      ? items.filter(item => (item.tags || []).some(t => activeFilters.has(t)))
      : items;

    const nodes: GraphNode[] = filteredItems.map(item => ({
      id: item.id,
      title: item.title,
      tags: item.tags || [],
      createdAt: item.created_at || "",
      type: item.type,
    }));

    const edges: GraphEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const shared = nodes[i].tags.filter(t => nodes[j].tags.includes(t));
        if (shared.length > 0) {
          edges.push({ source: nodes[i].id, target: nodes[j].id, sharedTag: shared[0] });
        }
      }
    }
    return { nodes, edges };
  }, [items, activeFilters]);

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length < 1) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, any>(edges).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = g.append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", "hsl(var(--muted-foreground) / 0.2)")
      .attr("stroke-width", 1);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    // Node size based on recency
    const getRadius = (d: GraphNode) => {
      const age = (Date.now() - new Date(d.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(8, Math.min(20, 20 - age * 0.1));
    };

    node.append("circle")
      .attr("r", getRadius)
      .attr("fill", d => tagColorMap[d.tags[0]] || "hsl(var(--primary))")
      .attr("stroke", "hsl(var(--background))")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    node.append("text")
      .text(d => d.title.length > 20 ? d.title.slice(0, 18) + "…" : d.title)
      .attr("dx", d => getRadius(d) + 5)
      .attr("dy", 4)
      .attr("font-size", "10px")
      .attr("fill", "hsl(var(--foreground))")
      .style("pointer-events", "none");

    // Click to open
    node.on("click", (_, d) => {
      const item = items.find(i => i.id === d.id);
      if (item && item.type === "link") {
        const url = item.content.startsWith("http") ? item.content : `https://${item.content}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });

    // Hover tooltip
    node.on("mouseenter", (event, d) => {
      setTooltipData({ node: d, x: event.pageX, y: event.pageY });
    }).on("mouseleave", () => setTooltipData(null));

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [nodes, edges, items, tagColorMap]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(zoom.scaleBy as any, factor);
  };

  const handleReset = () => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(500).call(zoom.transform as any, d3.zoomIdentity.translate(0, 0).scale(1));
  };

  if (items.length < 5) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-4">
          <Network className="w-16 h-16 text-muted-foreground/40" />
          <h2 className="text-xl font-semibold">Knowledge Map</h2>
          <p className="text-muted-foreground max-w-md">
            Save at least 5 links to see your Knowledge Map. Currently you have {items.length} links.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 h-[calc(100vh-3.5rem)] flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" />
              Knowledge Map
            </h1>
            <p className="text-sm text-muted-foreground">{nodes.length} nodes · {edges.length} connections</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleZoom(1.3)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom(0.7)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Filter className="w-4 h-4 text-muted-foreground mr-1 mt-0.5" />
            {allTags.slice(0, 15).map(tag => (
              <Badge
                key={tag}
                variant={activeFilters.has(tag) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                style={activeFilters.has(tag) ? { backgroundColor: tagColorMap[tag] } : {}}
                onClick={() => toggleFilter(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <Card className="flex-1 relative overflow-hidden" ref={containerRef}>
          <svg ref={svgRef} className="w-full h-full" />
          {tooltipData && (
            <div
              className="fixed z-50 bg-popover border rounded-lg shadow-lg p-3 text-sm max-w-xs pointer-events-none"
              style={{ left: tooltipData.x + 10, top: tooltipData.y - 10 }}
            >
              <p className="font-semibold">{tooltipData.node.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tags: {tooltipData.node.tags.join(", ") || "None"}
              </p>
              <p className="text-xs text-muted-foreground">
                Saved: {new Date(tooltipData.node.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeMap;
