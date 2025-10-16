-- Create table to log consent events for GDPR compliance
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  essential BOOLEAN NOT NULL DEFAULT true,
  analytics BOOLEAN NOT NULL DEFAULT false,
  marketing BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous consent logging
CREATE POLICY "Anyone can insert consent logs"
  ON public.consent_logs
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own consent logs
CREATE POLICY "Users can view own consent logs"
  ON public.consent_logs
  FOR SELECT
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) 
    OR 
    (user_id IS NULL AND session_id = current_setting('request.jwt.claims', true)::json->>'session_id')
  );

-- Admins can view all logs
CREATE POLICY "Admins can view all consent logs"
  ON public.consent_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX idx_consent_logs_session_id ON public.consent_logs(session_id);
CREATE INDEX idx_consent_logs_created_at ON public.consent_logs(created_at DESC);