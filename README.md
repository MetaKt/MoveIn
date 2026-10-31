# MoveIn

Rooms and Thai buddies for international exchange students at Chulalongkorn University.

Students explore areas near campus, find a room in three ways (send preferences to partner landlords, take over a former exchange student's room, or browse partner rooms), book it step by step, and can request a local buddy. Landlords list rooms, propose them to students and handle bookings. Buddies apply and look after their students. The MoveIn team approves rooms, matches buddies and watches bookings.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

The app currently runs in **demo mode**: dummy data lives in the browser (`localStorage`), and the banner at the top lets you switch between demo accounts or reset everything.

| Demo account | Role | Try |
| --- | --- | --- |
| Nuhr Obama | Exchange student | Explore the map, request a room, follow a booking |
| Somchai Wongsa / Nattaya Srisuk | Landlord | Accept a booking, propose rooms, list a new room |
| Pakin Ruchadatid | Buddy | See assigned students |
| MoveIn Team | Admin | Approve rooms, match buddies, dashboard |

A full booking walkthrough: sign in as Nuhr → request a room → switch to its landlord → accept and add bank details → switch back to Nuhr and upload a slip → landlord clicks Received and uploads a contract → Nuhr accepts and uploads the countersigned copy.

## Checks

```bash
npm run lint
npm run typecheck
npm test           # booking logic unit tests
npm run test:db    # applies the Supabase migrations to an in-memory Postgres and tests the security rules
npm run build
```

CI runs all of these on every pull request.

## Project layout

```
src/app/(student)     map, rooms, room detail, booking request, my bookings, buddy service, train map
src/app/host          landlord home, my rooms, room editor, student list + proposals, bookings, listing wizard
src/app/buddy-portal  buddy home, profile, manual, buddies, FAQ
src/app/admin         dashboard, room approval, bookings, buddy matching, profiles
src/app/become-a-buddy, onboarding, signin
src/lib/i18n          English/Thai switch; Thai text lives in src/lib/i18n/th
src/lib               types, reference data (areas, stations, faculties), booking state machine, demo store + seed data
supabase/migrations   production database schema, row-level security, storage rules, booking RPCs
```

## Languages (English / ไทย)

Every page has an EN / ไทย switch, and the choice is remembered in the browser. English is the source text: wrap UI strings in `t("…")` (inside components, from `useT()`) or `msg("…")` (in constants), and add the Thai line to the matching file in `src/lib/i18n/th/`. Use `{name}` slots for values, and `[brackets]` for words shown in brand blue. `npm test` fails if any string is missing its Thai version. Content people type in (room titles, descriptions, reviews) is shown as written.

## Going to production (Supabase)

The UI talks to one store (`src/lib/store.ts`) whose actions map one-to-one onto the database functions in `supabase/migrations`:

- every table has row-level security;
- booking steps only change through `request_booking` and `booking_transition`, so nobody can skip a step;
- landlords can't approve their own listings; users can't change their own role;
- passports are visible to the landlord only after they accept, and the landlord's Thai ID only to students they accepted.

To switch over: create a Supabase project, run the migrations (`supabase db push`), set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`), enable Email + Google sign-in, and replace the demo store actions with Supabase calls. Make your first admin in the SQL editor: `update profiles set role = 'admin' where email = '…';`

## Notes

- Maps use Leaflet with OpenStreetMap's free tiles, so no API key is needed. Those tiles are for light use only: before launch, set `NEXT_PUBLIC_MAP_TILE_URL` to a hosted provider such as MapTiler or Stadia Maps (see `.env.example`).
- Area prices, faculty → area recommendations and station walking times in `src/lib/reference.ts` are placeholders for the MoveIn team to confirm.
- Photos and illustrations come from the client's concept deck.
