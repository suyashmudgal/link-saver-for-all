import { useParams } from "react-router-dom";
import { usePublicCollection } from "@/hooks/use-shared-collections";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, FileText, Image as ImageIcon, Video, ExternalLink, Share2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  link: { icon: <Link2 className="w-4 h-4" />, color: "bg-blue-500/10 text-blue-500" },
  note: { icon: <FileText className="w-4 h-4" />, color: "bg-amber-500/10 text-amber-500" },
  image: { icon: <ImageIcon className="w-4 h-4" />, color: "bg-purple-500/10 text-purple-500" },
  video: { icon: <Video className="w-4 h-4" />, color: "bg-pink-500/10 text-pink-500" },
};

const SharedView = () => {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = usePublicCollection(token || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
          <h1 className="text-2xl font-bold mb-2">Collection Not Found</h1>
          <p className="text-muted-foreground">This collection may have been deleted or deactivated.</p>
        </div>
      </div>
    );
  }

  const { collection, items } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Share2 className="w-4 h-4" />
            <span>Shared Collection</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{collection.title}</h1>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {items.length} item{items.length !== 1 ? "s" : ""} · Shared on {new Date(collection.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => {
            const config = typeConfig[item.type] || typeConfig.link;
            return (
              <Card key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium mb-0.5">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{item.description}</p>
                    )}
                    {item.type === "link" && (
                      <p className="text-xs text-muted-foreground truncate">{item.content}</p>
                    )}
                    {item.type === "note" && (
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{item.content}</p>
                    )}
                    {(item.tags as string[] | null)?.length ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(item.tags as string[]).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {item.type === "link" && (
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                      <a href={item.content} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">DataVault</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedView;
