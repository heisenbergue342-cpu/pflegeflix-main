import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Prefer environment variables; fallback to provided project details if not set
    const supabaseUrl =
      Deno.env.get('SUPABASE_URL') ||
      'https://nuwqutcgqhjhzxjzqxxo.supabase.co';

    // Try service role first; otherwise fall back to anon key (public)
    const supabaseKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
      Deno.env.get('SUPABASE_ANON_KEY') ||
      // Public anon key fallback (provided)
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51d3F1dGNncWhqaHp4anpxeHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODIwOTEsImV4cCI6MjA3NjM1ODA5MX0.D8UwXh0AohnjN19OwD7IN_R_E1yz7e07hAqFw9Lr8n4';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch approved/active jobs via public view (RLS-friendly)
    const { data: jobs, error } = await supabase
      .from('jobs_public')
      .select('id, title, city, state, facility_type, updated_at, is_active')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const baseUrl = 'https://pflegeflix.lovable.app';
    const now = new Date().toISOString();

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Search Page -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/impressum</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/datenschutz</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/bewerber-datenschutz</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/agb</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/avv</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/cookie-policy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-center</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/accessibility-statement</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

    // Category Hubs
    const categoryHubs = [
      { slug: 'kliniken' },
      { slug: 'altenheime' },
      { slug: 'intensivpflege' },
      { slug: 'ambulante-pflege' },
    ];
    categoryHubs.forEach(({ slug }) => {
      sitemap += `  <url>
    <loc>${baseUrl}/jobs/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Curated City Hubs
    const cityHubs = [
      'berlin','hamburg','muenchen','koeln','frankfurt-am-main','stuttgart','duesseldorf',
      'dortmund','essen','leipzig','bremen','dresden','hannover','nuernberg','duisburg',
      'bochum','wuppertal','bielefeld','bonn','muenster'
    ];
    cityHubs.forEach((slug) => {
      sitemap += `  <url>
    <loc>${baseUrl}/jobs/city/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    // Job detail pages
    jobs?.forEach((job) => {
      const lastmod = job.updated_at || now;
      sitemap += `  <url>
    <loc>${baseUrl}/job/${job.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});