import { useState, useEffect } from "react";
import { Link2, ExternalLink, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  domain: string;
  url: string;
}

interface LinkPreviewCardProps {
  url: string;
  onImageLoad?: (imageUrl: string) => void;
}

const LinkPreviewCard = ({ url, onImageLoad }: LinkPreviewCardProps) => {
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setImageError(false);
        
        const { data, error } = await supabase.functions.invoke('fetch-link-preview', {
          body: { url },
        });

        if (error) {
          console.error('Error fetching preview:', error);
          // Set fallback preview
          setPreview({
            title: null,
            description: null,
            image: null,
            domain: getDomain(url),
            url: formatUrl(url),
          });
        } else if (data?.success && data?.data) {
          setPreview(data.data);
          if (data.data.image && onImageLoad) {
            onImageLoad(data.data.image);
          }
        } else {
          setPreview({
            title: null,
            description: null,
            image: null,
            domain: getDomain(url),
            url: formatUrl(url),
          });
        }
      } catch (err) {
        console.error('Preview fetch error:', err);
        setPreview({
          title: null,
          description: null,
          image: null,
          domain: getDomain(url),
          url: formatUrl(url),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url, onImageLoad]);

  const formatUrl = (inputUrl: string): string => {
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      return `https://${inputUrl}`;
    }
    return inputUrl;
  };

  const getDomain = (inputUrl: string): string => {
    try {
      const formatted = formatUrl(inputUrl);
      const urlObj = new URL(formatted);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return inputUrl;
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedUrl = formatUrl(url);
    window.open(formattedUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="w-full space-y-3">
        <Skeleton className="w-full h-32 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  const hasRichPreview = preview && (preview.title || preview.description || (preview.image && !imageError));
  const formattedUrl = formatUrl(url);

  if (!hasRichPreview) {
    // Fallback: Simple card with domain and link icon
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
              <Globe className="w-3 h-3" />
              <span>{preview?.domain || getDomain(url)}</span>
            </div>
            <p className="text-xs text-muted-foreground/70">Preview not available</p>
          </div>
        </div>
        <button
          onClick={handleLinkClick}
          className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          {formattedUrl.length > 50 ? formattedUrl.substring(0, 50) + '...' : formattedUrl}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Preview Image */}
      {preview.image && !imageError && (
        <div className="w-full h-36 overflow-hidden bg-muted rounded-t-lg">
          <img
            src={preview.image}
            alt={preview.title || 'Link preview'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}
      
      {/* Content */}
      <div className={`p-3 bg-muted/30 border border-border/50 ${preview.image && !imageError ? 'rounded-b-lg border-t-0' : 'rounded-lg'}`}>
        {/* Domain */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Globe className="w-3 h-3" />
          <span>{preview.domain}</span>
        </div>
        
        {/* Title */}
        {preview.title && (
          <h4 className="font-medium text-sm line-clamp-2 mb-1 text-foreground">
            {preview.title}
          </h4>
        )}
        
        {/* Description */}
        {preview.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {preview.description}
          </p>
        )}
      </div>
      
      {/* Link */}
      <button
        onClick={handleLinkClick}
        className="mt-2 text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Open link
      </button>
    </div>
  );
};

export default LinkPreviewCard;
