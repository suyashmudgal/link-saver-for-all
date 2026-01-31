const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LinkPreview {
  title: string | null;
  description: string | null;
  image: string | null;
  domain: string;
  url: string;
}

function extractMetaContent(html: string, property: string): string | null {
  // Try og: properties first
  const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`, 'i'));
  if (ogMatch) return ogMatch[1];

  // Try content before property
  const ogMatchReverse = html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`, 'i'));
  if (ogMatchReverse) return ogMatchReverse[1];

  // Try twitter: properties
  const twitterMatch = html.match(new RegExp(`<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']*)["']`, 'i'));
  if (twitterMatch) return twitterMatch[1];

  // Try standard meta tags for description
  if (property === 'description') {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    if (descMatch) return descMatch[1];
    
    const descMatchReverse = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    if (descMatchReverse) return descMatchReverse[1];
  }

  return null;
}

function extractTitle(html: string): string | null {
  // Try og:title first
  const ogTitle = extractMetaContent(html, 'title');
  if (ogTitle) return ogTitle;

  // Fall back to <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();

  return null;
}

function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function resolveUrl(base: string, relative: string): string {
  if (!relative) return '';
  if (relative.startsWith('http://') || relative.startsWith('https://')) {
    return relative;
  }
  if (relative.startsWith('//')) {
    return 'https:' + relative;
  }
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Fetching preview for:', formattedUrl);

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch(formattedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      // Return partial data with domain only
      const preview: LinkPreview = {
        title: null,
        description: null,
        image: null,
        domain: getDomain(formattedUrl),
        url: formattedUrl,
      };
      return new Response(
        JSON.stringify({ success: true, data: preview }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      console.log('Response not OK:', response.status);
      const preview: LinkPreview = {
        title: null,
        description: null,
        image: null,
        domain: getDomain(formattedUrl),
        url: formattedUrl,
      };
      return new Response(
        JSON.stringify({ success: true, data: preview }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only process HTML content
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.log('Not HTML content:', contentType);
      const preview: LinkPreview = {
        title: null,
        description: null,
        image: null,
        domain: getDomain(formattedUrl),
        url: formattedUrl,
      };
      return new Response(
        JSON.stringify({ success: true, data: preview }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read only first 100KB to avoid memory issues
    const reader = response.body?.getReader();
    let html = '';
    let bytesRead = 0;
    const maxBytes = 100 * 1024;

    if (reader) {
      const decoder = new TextDecoder();
      while (bytesRead < maxBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        bytesRead += value.length;
      }
      reader.cancel();
    }

    // Extract metadata
    const title = extractTitle(html);
    const description = extractMetaContent(html, 'description');
    let image = extractMetaContent(html, 'image');

    // Resolve relative image URLs
    if (image) {
      image = resolveUrl(formattedUrl, image);
    }

    const preview: LinkPreview = {
      title: title ? title.substring(0, 200) : null,
      description: description ? description.substring(0, 300) : null,
      image,
      domain: getDomain(formattedUrl),
      url: formattedUrl,
    };

    console.log('Preview extracted:', { title: preview.title, domain: preview.domain, hasImage: !!preview.image });

    return new Response(
      JSON.stringify({ success: true, data: preview }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching preview:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch preview' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
