-- Add boosted_at timestamp to jobs for refresh/boost feature
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS boosted_at timestamptz NULL;

-- Create index to speed up ordering by boost recency
CREATE INDEX IF NOT EXISTS jobs_boosted_at_idx ON public.jobs (boosted_at DESC);

-- Note: Non-destructive; existing rows remain unchanged.