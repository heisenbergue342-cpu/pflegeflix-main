import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, companyName, facilityType, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert cover letter writer specializing in healthcare job applications in Germany. 
Write professional, compelling cover letters that highlight the candidate's relevant experience and skills.
Keep the tone professional but warm. Write in German if the job is in Germany.
Focus on healthcare-specific qualifications and patient care experience.`;

    const userPrompt = `Write a cover letter for the following position:
Job Title: ${jobTitle}
Company: ${companyName}
Facility Type: ${facilityType}

Candidate Profile:
Name: ${userProfile.name || 'Bewerber/in'}
Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
Qualifications: ${userProfile.qualifications?.join(', ') || 'Not specified'}
Bio: ${userProfile.bio || 'Not specified'}

Create a compelling cover letter that:
1. Addresses the specific position and company
2. Highlights relevant healthcare experience and skills
3. Shows enthusiasm for the role
4. Is approximately 250-300 words
5. Follows German business letter format
6. Uses professional but personable language`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate cover letter");
    }

    const data = await response.json();
    const coverLetter = data.choices[0].message.content;

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-cover-letter function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
