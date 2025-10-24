import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, ttlSeconds = 604800 } = await req.json();

    if (!jobId || typeof jobId !== "string") {
      return new Response(JSON.stringify({ error: "Invalid or missing jobId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BUCKET = "job-photos";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const folder = `jobs/${jobId}`;

    // Try metadata.json first
    const metaRes = await admin.storage.from(BUCKET).download(`${folder}/metadata.json`);
    let files: Array<{ path: string; name: string; isCover?: boolean }> = [];

    if (metaRes.data) {
      try {
        const text = await metaRes.data.text();
        const parsed = JSON.parse(text) as Array<{ path: string; name: string; isCover?: boolean }>;
        files = parsed.map((p) => ({ path: p.path || `${folder}/${p.name}`, name: p.name, isCover: p.isCover }));
      } catch {
        // fallback to listing
      }
    }

    if (files.length === 0) {
      const listRes = await admin.storage.from(BUCKET).list(folder, { limit: 50 });
      const items = (listRes.data || []).filter((f) => !f.name.startsWith(".") && f.name !== "metadata.json");
      files = items.map((f) => ({ path: `${folder}/${f.name}`, name: f.name }));
    }

    // Create signed URLs
    const signedItems: Array<{
      url: string;
      name: string;
      isCover?: boolean;
    }> = [];

    for (const f of files) {
      const signed = await admin.storage.from(BUCKET).createSignedUrl(f.path, ttlSeconds);
      signedItems.push({
        url: signed.data?.signedUrl || "",
        name: f.name,
        isCover: f.isCover,
      });
    }

    // Ensure cover first if any
    signedItems.sort((a, b) => ((b.isCover ? 1 : 0) - (a.isCover ? 1 : 0)));

    return new Response(JSON.stringify({ photos: signedItems }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("list-job-photos error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});