drop policy if exists "Users can upload their own progress photos" on storage.objects;
drop policy if exists "Users can view their own progress photos" on storage.objects;
drop policy if exists "Users can update their own progress photos" on storage.objects;
drop policy if exists "Users can delete their own progress photos" on storage.objects;

create policy "Users can upload their own progress photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'progress-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can view their own progress photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'progress-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can update their own progress photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'progress-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'progress-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own progress photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'progress-photos'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
