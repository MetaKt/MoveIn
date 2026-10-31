"use client";

import { BadgeCheck, Bath, BedDouble, CalendarDays, Check, Heart, MapPin, Ruler, Star, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MapView } from "@/components/map";
import { Badge, ButtonLink, Card, EmptyState } from "@/components/ui";
import { baht, cn, date, flag, fullName } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { AREAS, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";

export default function RoomPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const me = useMe();
  const listing = useStore((s) => s.listings.find((l) => l.id === id));
  const allListings = useStore((s) => s.listings);
  const siblings = useMemo(
    () => (listing ? allListings.filter((l) => l.building === listing.building && l.id !== listing.id && l.status !== "pending") : []),
    [allListings, listing],
  );
  const landlord = useStore((s) => s.users.find((u) => u.id === listing?.landlordId));
  const myBooking = useStore((s) => s.bookings.find((b) => b.listingId === id && b.studentId === me?.id && !["declined", "cancelled"].includes(b.status)));
  const fav = useStore((s) => (me ? (s.favorites[me.id] ?? []).includes(id) : false));
  const toggleFav = useStore((s) => s.toggleFavorite);
  const [photo, setPhoto] = useState(0);

  if (!listing || (listing.status === "pending" && me?.id !== listing.landlordId && me?.role !== "admin"))
    return (
      <EmptyState title={t("Room not found")} action={<ButtonLink href="/rooms?tab=available">{t("Browse rooms")}</ButtonLink>}>
        {t("This room may have been taken off the market.")}
      </EmptyState>
    );

  const area = AREAS.find((a) => a.id === listing.areaId);
  const available = listing.status === "on_market";

  return (
    <div className="pb-24 lg:pb-0">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{t("Available rooms")}</p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{listing.building}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-4" /> {area && t(area.name)} · {listing.title}
          </p>
        </div>
        {me && (
          <button onClick={() => toggleFav(listing.id)} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1", fav ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-brand-700 ring-line")}>
            <Heart className={cn("size-4", fav && "fill-current")} /> {fav ? t("Saved") : t("Save")}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.photos[photo]} alt={t("{title} photo {n}", { title: listing.title, n: photo + 1 })} className="h-full w-full object-cover" />
              <Badge tone={available ? "green" : "red"} className="absolute left-4 top-4">
                {available ? t("Available") : t("Sold out")}
              </Badge>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
              {listing.photos.map((p, i) => (
                <button key={p + i} onClick={() => setPhoto(i)} aria-label={t("Show photo {n}", { n: i + 1 })} className={cn("h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2", i === photo ? "ring-brand-600" : "ring-transparent opacity-70 hover:opacity-100")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {listing.source === "takeover" && listing.currentTenant && (
            <Card className="flex items-center gap-4 border-brand-200 bg-brand-50 p-4">
              <span className="text-3xl">{flag(listing.currentTenant.countryCode)}</span>
              <p className="text-sm">
                <strong>{listing.currentTenant.name}</strong>{" "}
                {t("from {country} lives here now and leaves on {date}. Take over their room for next semester.", {
                  country: t(listing.currentTenant.country),
                  date: date(listing.currentTenant.leavesOn),
                })}
              </p>
            </Card>
          )}

          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Fact icon={Ruler} label={t("Size")} value={`${listing.sizeSqm} m²`} />
              <Fact icon={Users} label={t("Guests")} value={`${listing.guests}`} />
              <Fact icon={BedDouble} label={t("Bedrooms")} value={listing.bedrooms === 0 ? t("Studio") : `${listing.bedrooms}`} />
              <Fact icon={Bath} label={t("Bathrooms")} value={`${listing.bathrooms}`} />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink/80">{listing.description}</p>
          </Card>

          {siblings.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">{t("Room types in this building")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[listing, ...siblings].map((s) => (
                  <Link key={s.id} href={`/rooms/${s.id}`} className={cn("flex items-center gap-3 rounded-xl border bg-white p-3 transition hover:border-brand-300", s.id === listing.id ? "border-brand-500 ring-1 ring-brand-500" : "border-line")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.photos[0]} alt="" className="size-16 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <Badge tone={s.status === "on_market" ? "green" : "red"}>{s.status === "on_market" ? t("Available") : t("Sold out")}</Badge>
                      <span className="mt-1 block text-sm font-bold">{t(ROOM_TYPE_LABEL[s.roomType])}</span>
                      <span className="block text-xs text-muted">
                        <strong className="text-brand-600">{baht(s.rent)}</strong> · {s.sizeSqm} {t("sqm")} · {t("Furnished")}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 font-bold">{t("Facilities")}</h2>
              <List items={[...listing.facilities, ...listing.amenities]} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 font-bold">{t("Nearby places")}</h2>
              <List items={[...listing.nearby, ...(area ? area.nearby.transport : [])]} />
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">{t("Location")}</h2>
            <div className="h-72 overflow-hidden rounded-2xl ring-1 ring-line">
              <MapView center={[listing.lat, listing.lng]} zoom={15} markers={[{ id: listing.id, lat: listing.lat, lng: listing.lng, kind: "listing", label: baht(listing.rent), active: true }]} />
            </div>
            <p className="mt-2 text-xs text-muted">{listing.address}</p>
          </section>

          {listing.reviews.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">{t("Reviews from former exchange students")}</h2>
              <div className="space-y-3">
                {listing.reviews.map((r, i) => (
                  <Card key={i} className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{flag(r.country)}</span>
                      <strong className="text-sm">{r.author}</strong>
                      <span className="text-xs text-muted">· {t("stayed {months} months", { months: r.months })}</span>
                      <span className="ml-auto flex text-amber-400">
                        {Array.from({ length: r.rating }, (_, k) => (
                          <Star key={k} className="size-4 fill-current" />
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink/80">&ldquo;{r.text}&rdquo;</p>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <p className="text-2xl font-bold text-brand-600">
              {baht(listing.rent)} <span className="text-sm font-medium text-muted">{t("monthly rent")}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CalendarDays className="size-4 text-brand-600" /> {t("Available from {date}", { date: date(listing.availableFrom) })}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand-600" /> {t("Minimum stay {months} months", { months: listing.minMonths })}
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-brand-600" /> {t("Deposit {amount}", { amount: baht(listing.deposit) })}
              </li>
            </ul>
            {landlord && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-3">
                <span className="grid size-9 place-items-center rounded-full bg-white font-bold text-brand-700">{landlord.firstName[0]}</span>
                <span className="text-sm">
                  <span className="block font-semibold">{fullName(landlord)}</span>
                  {landlord.landlord?.verified ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <BadgeCheck className="size-3.5" /> {t("ID verified by MoveIn")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">{t("Verification pending")}</span>
                  )}
                </span>
              </div>
            )}
            <div className="mt-5 hidden lg:block">
              <BookButton listingId={listing.id} available={available} bookingId={myBooking?.id} />
            </div>
          </Card>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-[700] flex items-center gap-3 border-t border-line bg-white px-4 py-3 lg:hidden">
        <p className="text-lg font-bold text-brand-600">
          {baht(listing.rent)} <span className="text-xs font-medium text-muted">{t("/ month")}</span>
        </p>
        <div className="ml-auto">
          <BookButton listingId={listing.id} available={available} bookingId={myBooking?.id} />
        </div>
      </div>
    </div>
  );
}

function BookButton({ listingId, available, bookingId }: { listingId: string; available: boolean; bookingId?: string }) {
  const t = useT();
  if (bookingId)
    return (
      <ButtonLink href={`/bookings/${bookingId}`} variant="secondary" className="w-full">
        {t("View your booking")}
      </ButtonLink>
    );
  if (!available)
    return (
      <ButtonLink href="/rooms?tab=available" variant="secondary" className="w-full">
        {t("See other rooms")}
      </ButtonLink>
    );
  return (
    <ButtonLink href={`/rooms/${listingId}/book`} size="lg" className="w-full">
      {t("Request for booking")}
    </ButtonLink>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-xs text-muted">{label}</span>
        <span className="block text-sm font-bold">{value}</span>
      </span>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  const t = useT();
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {items.map((i) => (
        <li key={i} className="flex items-center gap-2">
          <Check className="size-4 shrink-0 text-emerald-600" /> {t(i)}
        </li>
      ))}
    </ul>
  );
}
