-- Create private bucket (idempotent pattern)
do $$
begin
  -- create bucket if not exists
  if not exists (select 1 from storage.buckets where name = 'job-photos') then
    perform storage.create_bucket('job-photos', false);
  end if;
end $$;

-- Policies on storage.objects for bucket 'job-photos'
-- Allow anyone (public + authenticated) to select metadata in this bucket
-- so the client can list files and generate signed URLs.
drop policy if exists "job_photos_select_anyone" on storage.objects;
create policy "job_photos_select_anyone"
on storage.objects
for select
to public
using (bucket_id = 'job-photos');

-- Employers/Admin can insert
drop policy if exists "job_photos_insert_employers" on storage.objects;
create policy "job_photos_insert_employers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'job-photos'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('arbeitgeber','admin')
  )
);

-- Employers/Admin can update
drop policy if exists "job_photos_update_employers" on storage.objects;
create policy "job_photos_update_employers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'job-photos'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('arbeitgeber','admin')
  )
)
with check (
  bucket_id = 'job-photos'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('arbeitgeber','admin')
  )
);

-- Employers/Admin can delete
drop policy if exists "job_photos_delete_employers" on storage.objects;
create policy "job_photos_delete_employers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'job-photos'
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('arbeitgeber','admin')
  )
);