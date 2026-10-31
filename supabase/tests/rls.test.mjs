// Applies the migrations to an in-memory Postgres (PGlite) with small stand-ins for Supabase's auth and
// storage schemas, then checks the security rules as different users. Run: npm run test:db
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
const dir = new URL("../migrations", import.meta.url).pathname;
const db = new PGlite();
// Minimal stand-ins for what Supabase provides.
await db.exec(`
create role anon; create role authenticated;
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner uuid);
create function storage.foldername(name text) returns text[] language sql as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
alter table storage.objects enable row level security;
`);
for (const f of fs.readdirSync(dir).sort()) { try { await db.exec(fs.readFileSync(`${dir}/${f}`, "utf8")); console.log("applied", f); } catch (e) { console.log("SQL ERROR in", f, e.message, e.position, e.where); process.exit(1); } }
await db.exec(`grant usage on schema public, auth, storage to authenticated; grant all on all tables in schema public to authenticated; grant all on storage.objects to authenticated; grant select on auth.users to authenticated;`);

const S='11111111-1111-1111-1111-111111111111', L='22222222-2222-2222-2222-222222222222', X='33333333-3333-3333-3333-333333333333', A='44444444-4444-4444-4444-444444444444';
await db.exec(`insert into auth.users values ('${S}','s@x.com','{"first_name":"Nuhr","role":"student"}'),('${L}','l@x.com','{"first_name":"Som","role":"landlord"}'),('${X}','x@x.com','{"first_name":"Eve","role":"admin"}'),('${A}','a@x.com','{}');`);
await db.exec(`update public.profiles set role='admin' where id='${A}'`);
const as = async (uid, sql, params=[]) => { await db.exec(`set role authenticated; select set_config('request.jwt.sub','${uid}',false);`); try { return await db.query(sql, params); } finally { await db.exec(`reset role;`); } };
const expectFail = async (label, p) => { try { await p; console.log("FAIL (should have errored):", label); process.exitCode = 1; } catch (e) { console.log("ok blocked:", label, "-", e.message.split("\n")[0]); } };
const ok = (label, cond) => { console.log(cond ? "ok:" : "FAIL:", label); if (!cond) process.exitCode = 1; };

ok("signup cannot self-assign admin", (await db.query(`select role from public.profiles where id='${X}'`)).rows[0].role === "student");
// landlord creates listing -> forced pending
await as(L, `insert into public.listings (landlord_id,title,building,area_id,address,lat,lng,place_kind,place_type,room_type,size_sqm,guests,rent,deposit,min_months,available_from,description,status) values ('${L}','Nice studio','B','samyan-silom','a',13.7,100.5,'condo','entire','studio',28,1,18000,36000,3,'2027-01-01','d','on_market')`);
const lid = (await db.query(`select id,status from public.listings`)).rows[0];
ok("new listing forced to pending", lid.status === "pending");
await expectFail("landlord self-approves", as(L, `update public.listings set status='on_market' where id=$1`, [lid.id]));
ok("student cannot see pending listing", (await as(S, `select * from public.listings`)).rows.length === 0);
await as(A, `update public.listings set status='on_market' where id=$1`, [lid.id]);
ok("student sees approved listing", (await as(S, `select * from public.listings`)).rows.length === 1);
await expectFail("landlord books own room", as(L, `select public.request_booking($1,'2027-01-05',5::smallint,1::smallint,'',true,'pending/${L}/p.jpg')`, [lid.id]));
await expectFail("booking without passport", as(S, `select public.request_booking($1,'2027-01-05',5::smallint,1::smallint,'',true,null)`, [lid.id]));
const bid = (await as(S, `select public.request_booking($1,'2027-01-05',5::smallint,1::smallint,'hi',true,'pending/${S}/passport.jpg') as id`, [lid.id])).rows[0].id;
ok("landlord notified", (await as(L, `select * from public.notifications`)).rows.length === 1);
ok("stranger cannot see booking", (await as(X, `select * from public.bookings`)).rows.length === 0);
await expectFail("student pays before acceptance", as(S, `select public.booking_transition($1,'slip','{"path":"x"}')`, [bid]));
await expectFail("accept before ID acknowledgement", as(L, `select public.booking_transition($1,'accept')`, [bid]));
await expectFail("student accepts own booking", as(S, `select public.booking_transition($1,'accept')`, [bid]));
await expectFail("direct table update", as(S, `update public.bookings set status='completed' where id=$1 returning id`, [bid]).then(r => { if (!r.rows.length) throw new Error("no rows updated (RLS)"); }));
// passport hidden from landlord until accepted
await db.exec(`insert into storage.objects (bucket_id,name) values ('documents','pending/${S}/passport.jpg'),('documents','landlords/${L}/id.jpg')`);
ok("landlord can't read passport before accepting", (await as(L, `select name from storage.objects where name like 'pending/%'`)).rows.length === 0);
ok("student can't read landlord ID before acceptance", (await as(S, `select name from storage.objects where name like 'landlords/%'`)).rows.length === 0);
for (const [who, act, payload] of [[L,'acknowledge_id','{}'],[L,'accept','{}'],[L,'bank_details','{"bank":{"bank":"K"},"total":54000}'],[S,'slip','{"path":"bookings/x/slip.pdf"}'],[L,'payment_received','{}'],[L,'contract','{"path":"bookings/x/c1.pdf"}'],[L,'contract','{"path":"bookings/x/c2.pdf"}'],[S,'accept_contract','{}'],[S,'countersign','{"path":"bookings/x/cs.pdf"}']])
  await as(who, `select public.booking_transition($1,$2,$3::jsonb)`, [bid, act, payload]);
const b = (await db.query(`select status, student_accepted from public.bookings where id=$1`, [bid])).rows[0];
ok("booking completed after full flow", b.status === "completed");
const rented = (await db.query(`select status, tenancy from public.listings where id=$1`, [lid.id])).rows[0];
ok("rented room taken off the market", rented.status === "off_market" && rented.tenancy?.endsOn === "2027-06-05");
ok("two contract versions kept", (await db.query(`select count(*)::int n from public.contract_versions`)).rows[0].n === 2);
ok("landlord reads passport after accepting", (await as(L, `select name from storage.objects where name like 'pending/%'`)).rows.length === 1);
ok("student reads landlord ID after acceptance", (await as(S, `select name from storage.objects where name like 'landlords/%'`)).rows.length === 1);
ok("stranger reads nothing", (await as(X, `select name from storage.objects`)).rows.length === 0);
await expectFail("user promotes self to admin", as(S, `update public.profiles set role='admin' where id='${S}'`).then(async () => { if ((await db.query(`select role from public.profiles where id='${S}'`)).rows[0].role === 'admin') return; throw new Error("role unchanged by trigger"); }));
