import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function UpdateDemoAccounts() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateAccounts = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('update-demo-accounts', {
        body: {}
      });

      if (error) {
        toast.error(`Error: ${error.message}`);
        console.error('Update error:', error);
        return;
      }

      if (data?.success) {
        toast.success('Demo accounts updated successfully!');
        setSuccess(true);
        console.log('Update results:', data.results);
      } else {
        toast.error(`Failed: ${data?.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      toast.error(`Exception: ${err.message}`);
      console.error('Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center p-4">
      <Card className="bg-netflix-card border-netflix-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-white">Update Demo Accounts</CardTitle>
          <CardDescription className="text-netflix-text-muted">
            Click the button below to update demo account passwords to the new credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-netflix-text-muted space-y-2">
            <p>This will update:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>demo.candidate@pflegeflix.de → DemoCandidate2025!@</li>
              <li>demo.employer@pflegeflix.de → DemoEmployer2025!@</li>
            </ul>
            <p className="mt-3 text-amber-400">
              All existing sessions will be invalidated after update.
            </p>
          </div>

          <Button
            onClick={updateAccounts}
            disabled={loading || success}
            className="w-full bg-netflix-red hover:bg-netflix-red-dark text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success && <CheckCircle2 className="mr-2 h-4 w-4" />}
            {loading ? 'Updating...' : success ? 'Updated Successfully' : 'Update Demo Passwords'}
          </Button>

          {success && (
            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">
                ✓ Demo accounts have been updated. You can now log in with the new passwords.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
