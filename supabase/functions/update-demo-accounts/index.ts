import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoAccount {
  email: string;
  password: string;
  role: 'bewerber' | 'arbeitgeber';
  name: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'demo.candidate@pflegeflix.de',
    password: 'DemoCandidate2025!@',
    role: 'bewerber',
    name: 'Demo Kandidat',
  },
  {
    email: 'demo.employer@pflegeflix.de',
    password: 'DemoEmployer2025!@',
    role: 'arbeitgeber',
    name: 'Demo Arbeitgeber',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results = [];

    for (const account of DEMO_ACCOUNTS) {
      // Check if user exists
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        throw listError;
      }

      const existingUser = existingUsers.users.find(u => u.email === account.email);

      if (existingUser) {
        // Update existing user password
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            password: account.password,
            email_confirm: true,
            user_metadata: {
              role: account.role,
              name: account.name,
            },
          }
        );

        if (updateError) {
          throw updateError;
        }

        // Sign out all sessions for this user
        await supabaseAdmin.auth.admin.signOut(existingUser.id);

        results.push({
          email: account.email,
          action: 'updated',
          userId: existingUser.id,
        });
      } else {
        // Create new user
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            role: account.role,
            name: account.name,
          },
        });

        if (createError) {
          throw createError;
        }

        results.push({
          email: account.email,
          action: 'created',
          userId: createData.user.id,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: 'Demo accounts updated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
