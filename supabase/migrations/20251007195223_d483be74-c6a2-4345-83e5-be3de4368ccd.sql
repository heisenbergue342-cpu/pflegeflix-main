-- Add applicant management fields to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS recommend boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS internal_notes text;

-- Create application_messages table for communication
CREATE TABLE IF NOT EXISTS public.application_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.application_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for application_messages
CREATE POLICY "Job owners and applicants can view messages"
ON public.application_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = application_messages.application_id
    AND (j.owner_id = auth.uid() OR a.user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Job owners and applicants can send messages"
ON public.application_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_messages.application_id
      AND (j.owner_id = auth.uid() OR a.user_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Create application_activity table for timeline
CREATE TABLE IF NOT EXISTS public.application_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.application_activity ENABLE ROW LEVEL SECURITY;

-- RLS policy for application_activity
CREATE POLICY "Job owners can view activity"
ON public.application_activity
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = application_activity.application_id
    AND (j.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "System can insert activity"
ON public.application_activity
FOR INSERT
WITH CHECK (true);

-- Function to log activity on stage changes
CREATE OR REPLACE FUNCTION public.log_application_stage_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO public.application_activity (application_id, actor_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'stage_changed',
      jsonb_build_object('old_stage', OLD.stage, 'new_stage', NEW.stage)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for stage changes
DROP TRIGGER IF EXISTS on_application_stage_change ON public.applications;
CREATE TRIGGER on_application_stage_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_application_stage_change();