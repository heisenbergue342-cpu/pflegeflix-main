-- Create message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  template_type TEXT CHECK (template_type IN ('interview_invite', 'offer', 'rejection', 'general')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message templates
CREATE POLICY "Employers can view own templates"
  ON public.message_templates FOR SELECT
  USING (auth.uid() = employer_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Employers can create own templates"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own templates"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own templates"
  ON public.message_templates FOR DELETE
  USING (auth.uid() = employer_id);

-- Create data retention settings table
CREATE TABLE IF NOT EXISTS public.data_retention_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  retention_days INTEGER DEFAULT 730, -- 2 years default
  auto_delete_enabled BOOLEAN DEFAULT false,
  last_cleanup_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_retention_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data retention
CREATE POLICY "Users can view own retention settings"
  ON public.data_retention_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own retention settings"
  ON public.data_retention_settings FOR ALL
  USING (auth.uid() = user_id);

-- Create data deletion requests table for GDPR compliance
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('applications', 'messages', 'full_account')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deletion requests
CREATE POLICY "Users can view own deletion requests"
  ON public.data_deletion_requests FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own deletion requests"
  ON public.data_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add read receipts to messages
ALTER TABLE public.application_messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.application_messages
  SET read_at = now()
  WHERE id = message_id AND read_at IS NULL;
END;
$$;

-- Trigger for updating message templates updated_at
CREATE OR REPLACE FUNCTION public.update_template_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_template_updated_at();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_templates_employer_id ON public.message_templates(employer_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_user_id ON public.data_retention_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON public.data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON public.data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_application_messages_read ON public.application_messages(read_at) WHERE read_at IS NULL;