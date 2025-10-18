const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitemapUrl } = await req.json();
    if (!sitemapUrl || typeof sitemapUrl !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid sitemapUrl' }), { headers: corsHeaders, status: 400 });
    }

    // Ping Google & Bing
    const googlePing = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    const bingPing = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

    const [gRes, bRes] = await Promise.all([
      fetch(googlePing, { method: 'GET' }),
      fetch(bingPing, { method: 'GET' }),
    ]);

    const ok = gRes.ok && bRes.ok;
    return new Response(JSON.stringify({ success: ok }), { headers: corsHeaders, status: ok ? 200 : 500 });
  } catch (error) {
    console.error('Error pinging search engines:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Unknown error' }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});