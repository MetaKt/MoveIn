-- Storage buckets.
--   listing-photos (public): listings/<landlord id>/<file>
--   documents (private):     pending/<student id>/passport.*        passport uploaded with a booking request
--                            landlords/<landlord id>/id.*           Thai ID card
--                            bookings/<booking id>/<file>           slips, contracts, tour videos

insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;

create policy "listing photos: landlords upload to own folder" on storage.objects for insert to authenticated
with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = 'listings' and (storage.foldername(name))[2] = auth.uid()::text);

create policy "listing photos: owners delete" on storage.objects for delete to authenticated
using (bucket_id = 'listing-photos' and (storage.foldername(name))[2] = auth.uid()::text);

-- Anyone signed in uploads only into their own pending/ or landlords/ folder, or into a booking they are part of.
create policy "documents: upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'documents' and (
    ((storage.foldername(name))[1] in ('pending', 'landlords') and (storage.foldername(name))[2] = auth.uid()::text)
    or ((storage.foldername(name))[1] = 'bookings' and exists (
      select 1 from public.bookings b where b.id::text = (storage.foldername(name))[2] and (b.student_id = auth.uid() or b.landlord_id = auth.uid())
    ))
  )
);

create policy "documents: read" on storage.objects for select to authenticated
using (
  bucket_id = 'documents' and (
    public.is_admin()
    -- your own uploads
    or (storage.foldername(name))[2] = auth.uid()::text
    -- booking files: both parties
    or ((storage.foldername(name))[1] = 'bookings' and exists (
      select 1 from public.bookings b where b.id::text = (storage.foldername(name))[2] and (b.student_id = auth.uid() or b.landlord_id = auth.uid())
    ))
    -- a student's passport: only the landlord, and only after they accepted the booking
    or ((storage.foldername(name))[1] = 'pending' and exists (
      select 1 from public.bookings b where b.passport_path = storage.objects.name and b.landlord_id = auth.uid() and b.status in ('accepted', 'completed')
    ))
    -- a landlord's Thai ID: students whose booking that landlord accepted
    or ((storage.foldername(name))[1] = 'landlords' and exists (
      select 1 from public.bookings b where b.landlord_id::text = (storage.foldername(name))[2] and b.student_id = auth.uid() and b.status in ('accepted', 'completed')
    ))
  )
);
