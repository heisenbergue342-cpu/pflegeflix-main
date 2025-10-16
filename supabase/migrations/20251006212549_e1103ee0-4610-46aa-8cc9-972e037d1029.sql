-- Remove visa_support column from jobs table
ALTER TABLE public.jobs DROP COLUMN IF EXISTS visa_support;