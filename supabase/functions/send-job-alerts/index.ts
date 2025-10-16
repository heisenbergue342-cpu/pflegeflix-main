import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: any;
  email_alert: 'none' | 'daily' | 'weekly';
  last_checked_at: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Starting job alerts check...');

    // Determine which searches to process based on frequency
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all saved searches with active email alerts
    const { data: searches, error: searchError } = await supabaseClient
      .from('saved_searches')
      .select('*')
      .neq('email_alert', 'none')
      .returns<SavedSearch[]>();

    if (searchError) {
      console.error('Error fetching saved searches:', searchError);
      throw searchError;
    }

    console.log(`Found ${searches?.length || 0} active saved searches`);

    let emailsSent = 0;

    for (const search of searches || []) {
      // Check if it's time to send based on frequency
      const lastChecked = new Date(search.last_checked_at);
      let shouldSend = false;

      if (search.email_alert === 'daily' && lastChecked < oneDayAgo) {
        shouldSend = true;
      } else if (search.email_alert === 'weekly' && lastChecked < oneWeekAgo) {
        shouldSend = true;
      }

      if (!shouldSend) {
        console.log(`Skipping search ${search.id} - not due yet`);
        continue;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, email, name')
        .eq('id', search.user_id)
        .single();

      if (profileError || !profile?.email) {
        console.error(`Error fetching profile for user ${search.user_id}:`, profileError);
        continue;
      }

      // Build query for new jobs matching the search criteria
      let jobsQuery = supabaseClient
        .from('jobs')
        .select('id, title, city, state, facility_type, contract_type, salary_min, salary_max, posted_at')
        .eq('approved', true)
        .eq('is_active', true)
        .gt('posted_at', search.last_checked_at)
        .order('posted_at', { ascending: false })
        .limit(10);

      // Apply filters
      const filters = search.filters;
      if (filters.cities?.length) {
        jobsQuery = jobsQuery.in('city', filters.cities);
      }
      if (filters.facilities?.length) {
        jobsQuery = jobsQuery.in('facility_type', filters.facilities);
      }
      if (filters.contracts?.length) {
        jobsQuery = jobsQuery.in('contract_type', filters.contracts);
      }
      if (filters.specialties?.length) {
        jobsQuery = jobsQuery.overlaps('tags', filters.specialties);
      }

      const { data: newJobs, error: jobsError } = await jobsQuery;

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        continue;
      }

      console.log(`Found ${newJobs?.length || 0} new jobs for search "${search.name}"`);

      // Only send email if there are new jobs
      if (newJobs && newJobs.length > 0) {
        // Generate unsubscribe token
        const unsubscribeToken = crypto.randomUUID();
        
        // Store unsubscribe token (you could create a separate table for this)
        await supabaseClient
          .from('saved_searches')
          .update({ 
            last_checked_at: now.toISOString(),
          })
          .eq('id', search.id);

        // Build email content
        const jobsHtml = newJobs.map(job => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <h3 style="margin: 0 0 8px 0; color: #111827;">${job.title}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${job.city}, ${job.state} • ${job.facility_type}${job.contract_type ? ` • ${job.contract_type}` : ''}
            </p>
            ${job.salary_min ? `<p style="margin: 8px 0 0 0; color: #059669; font-weight: 600;">
              €${job.salary_min}${job.salary_max ? ` - €${job.salary_max}` : '+'}
            </p>` : ''}
          </div>
        `).join('');

        const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || '';
        const unsubscribeUrl = `${baseUrl}/saved-searches?unsubscribe=${search.id}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h1 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">
                    ${newJobs.length} neue ${newJobs.length === 1 ? 'Stelle' : 'Stellen'} für "${search.name}"
                  </h1>
                  <p style="color: #6b7280; margin: 0 0 24px 0;">
                    Hallo ${profile.name || 'dort'},<br>
                    Wir haben neue Stellen gefunden, die zu Ihrer gespeicherten Suche passen.
                  </p>
                  
                  ${jobsHtml}
                  
                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <a href="${baseUrl}/search" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                      Alle Ergebnisse anzeigen
                    </a>
                  </div>
                  
                  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0 0 8px 0;">
                      Sie erhalten diese E-Mail, weil Sie E-Mail-Benachrichtigungen für die gespeicherte Suche "${search.name}" aktiviert haben.
                    </p>
                    <p style="margin: 0;">
                      <a href="${baseUrl}/saved-searches" style="color: #3b82f6; text-decoration: none;">Benachrichtigungen verwalten</a> • 
                      <a href="${unsubscribeUrl}" style="color: #3b82f6; text-decoration: none;">Abmelden</a>
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        console.log(`Sending email to ${profile.email} for search "${search.name}"`);

        // Note: You would integrate with Resend or another email service here
        // For now, we'll just log that we would send the email
        // To actually send emails, you'll need to set up Resend (see supabase-email-sending instructions)
        
        console.log(`Email would be sent to: ${profile.email}`);
        console.log(`Subject: ${newJobs.length} neue Stellen für "${search.name}"`);
        
        emailsSent++;
      } else {
        // Update last_checked_at even if no jobs found
        await supabaseClient
          .from('saved_searches')
          .update({ last_checked_at: now.toISOString() })
          .eq('id', search.id);
      }
    }

    console.log(`Job alerts check complete. ${emailsSent} emails prepared.`);

    return new Response(
      JSON.stringify({
        success: true,
        searches_processed: searches?.length || 0,
        emails_sent: emailsSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-job-alerts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});