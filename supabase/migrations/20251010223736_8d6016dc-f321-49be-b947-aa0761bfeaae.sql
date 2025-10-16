-- Enable RLS on the jobs_public view
-- Even though it's a view, we need RLS to ensure proper access control
ALTER VIEW public.jobs_public SET (security_invoker = true);

-- Note: Views in PostgreSQL 15+ support RLS when security_invoker is true
-- The view will enforce RLS of the underlying jobs table automatically

-- However, for extra safety, let's recreate the view as a materialized view
-- or better yet, just ensure the regular view is properly configured

-- Actually, let's verify the view definition is correct and add a comment
COMMENT ON VIEW public.jobs_public IS 
'Public view of active job listings. Excludes sensitive fields like owner_id. 
Access controlled through underlying jobs table RLS policies with security_invoker=true.';