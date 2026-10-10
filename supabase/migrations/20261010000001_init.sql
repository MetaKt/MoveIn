-- MoveIn production schema for Supabase (Postgres 15+).
-- Every table has row-level security. Booking state only changes through the
-- RPC functions at the bottom, so a student or landlord can never skip a step.


-- ---------------------------------------------------------------- types
create type public.user_role as enum ('student', 'landlord', 'buddy', 'admin');
create type public.room_type as enum ('studio', '1br', '2br', '3br', 'shared2', 'shared34');
create type public.place_kind as enum ('house', 'apartment', 'condo', 'studio', 'dormitory', 'serviced');
create type public.place_type as enum ('entire', 'room', 'shared');
create type public.listing_source as enum ('partner', 'takeover');
create type public.listing_status as enum ('pending', 'on_market', 'off_market', 'rejected');
create type public.booking_status as enum ('requested', 'accepted', 'declined', 'cancelled', 'completed');
create type public.application_status as enum ('pending', 'approved', 'rejected');
create type public.buddy_stage as enum ('matching', 'choosing', 'arriving', 'settled');

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 80),
  email text not null,
  whatsapp text not null,
  -- student
  gender text check (gender in ('female', 'male', 'non-binary', 'prefer-not')),
  age smallint check (age between 16 and 99),
  country text,
  country_code char(2),
  home_university text,
  faculty text,
  notifications boolean not null default true,
  -- landlord
  id_document_path text,
  id_verified boolean not null default false,
  host_since smallint,
  -- buddy
  university text,
  buddy_faculty text,
  study_year smallint,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- New auth users get a profile. Role comes from sign-up metadata, but nobody can sign up as admin or buddy:
-- buddies are created when an admin approves an application, admins are set by hand.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
begin
  insert into profiles (id, role, first_name, last_name, email, whatsapp)
  values (
    new.id,
    case when requested = 'landlord' then 'landlord'::user_role else 'student'::user_role end,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), '-'),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'whatsapp', '')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Users may edit their own profile but not their role or verification flag.
create or replace function public.guard_profile_update() returns trigger
language plpgsql as $$
begin
  -- auth.uid() is null for the SQL editor and service-role key, which is how the first admin is created.
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.id_verified := case when new.id_document_path is distinct from old.id_document_path then false else old.id_verified end;
  end if;
  return new;
end $$;

create trigger guard_profile_update before update on public.profiles
for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------- listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid not null references public.profiles (id) on delete cascade,
  source public.listing_source not null default 'partner',
  title text not null check (char_length(title) between 5 and 80),
  building text not null,
  area_id text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  place_kind public.place_kind not null,
  place_type public.place_type not null,
  room_type public.room_type not null,
  size_sqm numeric(6, 1) not null check (size_sqm > 0),
  guests smallint not null check (guests > 0),
  bedrooms smallint not null default 0,
  beds smallint not null default 1,
  bathrooms smallint not null default 1,
  rent integer not null check (rent > 0),
  deposit integer not null check (deposit >= 0),
  min_months smallint not null check (min_months between 1 and 24),
  available_from date not null,
  amenities text[] not null default '{}',
  nearby text[] not null default '{}',
  facilities text[] not null default '{}',
  photos text[] not null default '{}',
  description text not null check (char_length(description) <= 2000),
  status public.listing_status not null default 'pending',
  review_each_request boolean not null default true,
  exterior_camera boolean not null default false,
  noise_monitor boolean not null default false,
  current_tenant jsonb,
  tenancy jsonb,
  created_at timestamptz not null default now()
);
create index on public.listings (status, area_id);
create index on public.listings (landlord_id);

-- Only admins approve: a landlord can move between on/off market, never out of pending/rejected.
create or replace function public.guard_listing_status() returns trigger
language plpgsql as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
  elsif new.status is distinct from old.status then
    if old.status in ('pending', 'rejected') or new.status not in ('on_market', 'off_market') then
      raise exception 'Only the MoveIn team can change this listing''s review status';
    end if;
  end if;
  return new;
end $$;

create trigger guard_listing_status before insert or update on public.listings
for each row execute function public.guard_listing_status();

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  booking_id uuid,
  author_id uuid references public.profiles (id) on delete set null,
  months smallint,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) <= 1500),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- matching
create table public.room_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  months smallint not null check (months between 1 and 24),
  move_in date not null,
  move_out date generated always as ((move_in + make_interval(months => months))::date) stored,
  room_types public.room_type[] not null check (cardinality(room_types) > 0),
  budget integer not null check (budget > 0),
  area_ids text[] not null default '{}',
  occupants smallint not null default 1,
  facilities text not null default '',
  notes text not null default '' check (char_length(notes) <= 1000),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_open_request_per_student on public.room_requests (student_id) where status = 'open';

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.room_requests (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  landlord_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, listing_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------------------------------------------------------------- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id),
  student_id uuid not null references public.profiles (id),
  landlord_id uuid not null references public.profiles (id),
  move_in date not null,
  months smallint not null check (months between 1 and 24),
  guests smallint not null default 1,
  note text not null default '' check (char_length(note) <= 1000),
  passport_path text,
  tour_video_requested boolean not null default false,
  tour_video_path text,
  status public.booking_status not null default 'requested',
  landlord_acknowledged_id boolean not null default false,
  bank jsonb,
  total_payment integer,
  slip_path text,
  payment_received boolean not null default false,
  contract_team_requested boolean not null default false,
  student_accepted boolean not null default false,
  countersigned_path text,
  whatsapp_group_url text,
  buddy_requested boolean not null default false,
  help_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.bookings (student_id);
create index on public.bookings (landlord_id);

create table public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  version smallint not null,
  path text not null,
  created_at timestamptz not null default now(),
  unique (booking_id, version)
);

-- ---------------------------------------------------------------- buddies
create table public.buddy_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  university text not null,
  faculty text not null,
  year smallint not null,
  email text not null,
  phone text not null default '',
  other_channel text not null default '',
  other_id text not null default '',
  whatsapp text not null,
  why_movein text not null check (char_length(why_movein) <= 2000),
  why_buddy text not null check (char_length(why_buddy) <= 2000),
  found_via text not null,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.buddy_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.profiles (id) on delete cascade,
  buddy_id uuid references public.profiles (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  arrival_date date,
  stage public.buddy_stage not null default 'matching',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  href text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reviews enable row level security;
alter table public.room_requests enable row level security;
alter table public.proposals enable row level security;
alter table public.favorites enable row level security;
alter table public.bookings enable row level security;
alter table public.contract_versions enable row level security;
alter table public.buddy_applications enable row level security;
alter table public.buddy_requests enable row level security;
alter table public.notifications enable row level security;

-- profiles: yourself, admins, and people you have a booking, open request or buddy match with.
create policy "profiles: read related" on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or role = 'landlord' -- landlord names are shown on listings
  or exists (select 1 from public.bookings b where (b.student_id = profiles.id and b.landlord_id = auth.uid()) or (b.landlord_id = profiles.id and b.student_id = auth.uid()))
  or exists (select 1 from public.room_requests r where r.student_id = profiles.id and r.status = 'open' and public.my_role() = 'landlord')
  or exists (select 1 from public.buddy_requests br where (br.student_id = profiles.id and br.buddy_id = auth.uid()) or (br.buddy_id = profiles.id and br.student_id = auth.uid()))
);
create policy "profiles: update self" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- listings: on-market rooms are public; owners and admins see everything of theirs.
create policy "listings: public read" on public.listings for select using (status in ('on_market', 'off_market') or landlord_id = auth.uid() or public.is_admin());
create policy "listings: landlord insert" on public.listings for insert with check (landlord_id = auth.uid() and public.my_role() = 'landlord');
create policy "listings: owner update" on public.listings for update using (landlord_id = auth.uid() or public.is_admin());
create policy "listings: owner delete" on public.listings for delete using ((landlord_id = auth.uid() and status = 'pending') or public.is_admin());

create policy "reviews: public read" on public.reviews for select using (true);
create policy "reviews: tenants write" on public.reviews for insert with check (
  author_id = auth.uid()
  and exists (select 1 from public.bookings b where b.id = booking_id and b.student_id = auth.uid() and b.listing_id = reviews.listing_id and b.status = 'completed')
);

create policy "requests: own" on public.room_requests for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "requests: landlords read open" on public.room_requests for select using ((status = 'open' and public.my_role() = 'landlord') or public.is_admin());

create policy "proposals: read" on public.proposals for select using (
  landlord_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.room_requests r where r.id = request_id and r.student_id = auth.uid())
);
create policy "proposals: landlord insert" on public.proposals for insert with check (
  landlord_id = auth.uid()
  and exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid() and l.status = 'on_market')
  and exists (select 1 from public.room_requests r where r.id = request_id and r.status = 'open')
);

create policy "favorites: own" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "bookings: parties read" on public.bookings for select using (student_id = auth.uid() or landlord_id = auth.uid() or public.is_admin());
-- Inserts and updates go through the RPC functions below (security definer), so no write policies.

create policy "contracts: parties read" on public.contract_versions for select using (
  exists (select 1 from public.bookings b where b.id = booking_id and (b.student_id = auth.uid() or b.landlord_id = auth.uid() or public.is_admin()))
);

create policy "applications: anyone submits" on public.buddy_applications for insert with check (status = 'pending' and (user_id is null or user_id = auth.uid()));
create policy "applications: admin read" on public.buddy_applications for select using (public.is_admin() or user_id = auth.uid());
create policy "applications: admin update" on public.buddy_applications for update using (public.is_admin());

create policy "buddy requests: read" on public.buddy_requests for select using (student_id = auth.uid() or buddy_id = auth.uid() or public.is_admin());
create policy "buddy requests: student creates" on public.buddy_requests for insert with check (student_id = auth.uid() and buddy_id is null and stage = 'matching');
create policy "buddy requests: buddy/admin update" on public.buddy_requests for update using (buddy_id = auth.uid() or public.is_admin());

create policy "notifications: own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications: mark read" on public.notifications for update using (user_id = auth.uid());

-- ---------------------------------------------------------------- booking RPCs
create or replace function public.notify(p_user uuid, p_body text, p_href text) returns void
language sql security definer set search_path = public as $$
  insert into notifications (user_id, body, href) values (p_user, p_body, p_href);
$$;
revoke execute on function public.notify(uuid, text, text) from public, anon, authenticated;

create or replace function public.request_booking(
  p_listing uuid, p_move_in date, p_months smallint, p_guests smallint, p_note text, p_tour_video boolean, p_passport_path text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  l listings;
  new_id uuid := gen_random_uuid();
begin
  if my_role() is distinct from 'student' then raise exception 'Only students can book'; end if;
  select * into l from listings where id = p_listing and status = 'on_market';
  if not found then raise exception 'This room is not available'; end if;
  if p_move_in < l.available_from then raise exception 'Room is available from %', l.available_from; end if;
  if p_months < l.min_months then raise exception 'Minimum stay is % months', l.min_months; end if;
  -- Passports are uploaded before the booking exists, into documents/pending/<student id>/.
  if p_passport_path is null or p_passport_path not like ('pending/' || auth.uid() || '/%') then
    raise exception 'Upload your passport first';
  end if;
  insert into bookings (id, listing_id, student_id, landlord_id, move_in, months, guests, note, tour_video_requested, passport_path)
  values (new_id, l.id, auth.uid(), l.landlord_id, p_move_in, p_months, greatest(p_guests, 1), coalesce(p_note, ''), p_tour_video, p_passport_path);
  perform notify(l.landlord_id, 'You have a new booking request for ' || l.building, '/host/bookings/' || new_id);
  return new_id;
end $$;

-- One function per transition. Each checks who is calling and that the booking is at the right step.
create or replace function public.booking_transition(p_booking uuid, p_action text, p_payload jsonb default '{}')
returns void
language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  is_student boolean;
  is_landlord boolean;
  next_version smallint;
begin
  select * into b from bookings where id = p_booking for update;
  if not found then raise exception 'Booking not found'; end if;
  is_student := b.student_id = auth.uid();
  is_landlord := b.landlord_id = auth.uid();

  case p_action
    when 'acknowledge_id' then
      if not is_landlord then raise exception 'Not allowed'; end if;
      update bookings set landlord_acknowledged_id = true, updated_at = now() where id = b.id;

    when 'accept' then
      if not is_landlord or b.status <> 'requested' then raise exception 'Not allowed'; end if;
      if not b.landlord_acknowledged_id then raise exception 'Acknowledge that your ID will be shared first'; end if;
      update bookings set status = 'accepted', updated_at = now() where id = b.id;
      perform notify(b.student_id, 'Your booking was accepted. Next: payment.', '/bookings/' || b.id);

    when 'decline' then
      if not is_landlord or b.status <> 'requested' then raise exception 'Not allowed'; end if;
      update bookings set status = 'declined', updated_at = now() where id = b.id;
      perform notify(b.student_id, 'The landlord could not accept your request', '/bookings/' || b.id);

    when 'cancel' then
      if not is_student or b.status <> 'requested' then raise exception 'Not allowed'; end if;
      update bookings set status = 'cancelled', updated_at = now() where id = b.id;

    when 'tour_video' then
      if not is_landlord or b.status not in ('requested', 'accepted') then raise exception 'Not allowed'; end if;
      update bookings set tour_video_path = p_payload ->> 'path', updated_at = now() where id = b.id;
      perform notify(b.student_id, 'Your room tour video is ready', '/bookings/' || b.id);

    when 'bank_details' then
      if not is_landlord or b.status <> 'accepted' or b.slip_path is not null then raise exception 'Not allowed'; end if;
      update bookings set bank = p_payload -> 'bank', total_payment = (p_payload ->> 'total')::int, updated_at = now() where id = b.id;
      perform notify(b.student_id, 'Payment details are ready', '/bookings/' || b.id);

    when 'slip' then
      if not is_student or b.status <> 'accepted' or b.bank is null or b.payment_received then raise exception 'Not allowed'; end if;
      update bookings set slip_path = p_payload ->> 'path', updated_at = now() where id = b.id;
      perform notify(b.landlord_id, 'The student uploaded a transfer slip', '/host/bookings/' || b.id);

    when 'payment_received' then
      if not is_landlord or b.slip_path is null then raise exception 'Not allowed'; end if;
      update bookings set payment_received = true, updated_at = now() where id = b.id;
      perform notify(b.student_id, 'Your payment was received', '/bookings/' || b.id);

    when 'contract' then
      if not is_landlord or not b.payment_received or b.countersigned_path is not null then raise exception 'Not allowed'; end if;
      select coalesce(max(version), 0) + 1 into next_version from contract_versions where booking_id = b.id;
      insert into contract_versions (booking_id, version, path) values (b.id, next_version, p_payload ->> 'path');
      update bookings set student_accepted = false, updated_at = now() where id = b.id;
      perform notify(b.student_id, 'Your rental contract is ready to review', '/bookings/' || b.id);

    when 'accept_contract' then
      if not is_student or not exists (select 1 from contract_versions where booking_id = b.id) then raise exception 'Not allowed'; end if;
      update bookings set student_accepted = true, updated_at = now() where id = b.id;
      perform notify(b.landlord_id, 'The student accepted the contract', '/host/bookings/' || b.id);

    when 'countersign' then
      if not is_student or not b.student_accepted then raise exception 'Not allowed'; end if;
      update bookings set countersigned_path = p_payload ->> 'path', status = 'completed', updated_at = now() where id = b.id;
      perform notify(b.landlord_id, 'The contract is countersigned. Join the WhatsApp group!', '/host/bookings/' || b.id);

    when 'contract_team' then
      if not is_landlord then raise exception 'Not allowed'; end if;
      update bookings set contract_team_requested = true, updated_at = now() where id = b.id;

    when 'help' then
      if not is_student then raise exception 'Not allowed'; end if;
      update bookings set help_requested = true, updated_at = now() where id = b.id;

    when 'whatsapp_group' then
      if not public.is_admin() then raise exception 'Not allowed'; end if;
      update bookings set whatsapp_group_url = p_payload ->> 'url', updated_at = now() where id = b.id;

    else
      raise exception 'Unknown action %', p_action;
  end case;
end $$;

-- Admin approves a buddy application: the applicant's account becomes a buddy.
create or replace function public.approve_buddy_application(p_application uuid) returns void
language plpgsql security definer set search_path = public as $$
declare a buddy_applications;
begin
  if not is_admin() then raise exception 'Not allowed'; end if;
  update buddy_applications set status = 'approved' where id = p_application returning * into a;
  if a.user_id is not null then
    update profiles set role = 'buddy', university = a.university, buddy_faculty = a.faculty, study_year = a.year where id = a.user_id;
  end if;
end $$;

grant execute on function public.request_booking(uuid, date, smallint, smallint, text, boolean, text) to authenticated;
grant execute on function public.booking_transition(uuid, text, jsonb) to authenticated;
grant execute on function public.approve_buddy_application(uuid) to authenticated;
