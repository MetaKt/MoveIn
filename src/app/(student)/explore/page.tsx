"use client";

import { ArrowLeft, ChevronRight, ShoppingBasket, TrainFront, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapView, type MapMarker } from "@/components/map";
import { ButtonLink, Card, Field, Select } from "@/components/ui";
import { baht, cn } from "@/lib/format";
import { AREAS, CHULA, FACULTIES } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";

export default function ExplorePage() {
  const me = useMe();
  const listings = useStore((s) => s.listings);
  const [faculty, setFaculty] = useState(me?.student?.faculty ?? "");
  const [areaId, setAreaId] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const f = FACULTIES.find((x) => x.id === faculty);
    if (!f) return AREAS;
    return [...f.areaIds.map((id) => AREAS.find((a) => a.id === id)!), ...AREAS.filter((a) => !f.areaIds.includes(a.id))];
  }, [faculty]);
  const recommendedCount = faculty ? 3 : ordered.length;
  const area = AREAS.find((a) => a.id === areaId);
  const roomsIn = (id: string) => listings.filter((l) => l.areaId === id && l.status === "on_market").length;

  const markers: MapMarker[] = AREAS.map((a) => ({
    id: a.id,
    lat: a.lat,
    lng: a.lng,
    kind: "area",
    label: a.name,
    sub: `${baht(a.priceFrom)}+`,
    active: a.id === areaId,
    onClick: () => setAreaId(a.id),
  }));

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      <Card className="order-2 p-5 xl:order-1">
        {area ? (
          <div>
            <button onClick={() => setAreaId(null)} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
              <ArrowLeft className="size-4" /> All areas
            </button>
            <h1 className="text-2xl font-bold">{area.name}</h1>
            <p className="mt-1 text-sm font-semibold text-brand-600">From {baht(area.priceFrom)} / month</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{area.description}</p>
            <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wider text-muted">Nearby</h2>
            <NearbyGroup icon={ShoppingBasket} title="Grocery" items={area.nearby.grocery} />
            <NearbyGroup icon={UtensilsCrossed} title="Dine out" items={area.nearby.dineout} />
            <NearbyGroup icon={TrainFront} title="Transportation" items={area.nearby.transport} />
            <ButtonLink href={`/rooms?tab=available&area=${area.id}`} className="mt-6 w-full">
              See {roomsIn(area.id)} rooms in {area.name}
            </ButtonLink>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Map</p>
            <h1 className="mt-1 text-2xl font-bold">Explore each area</h1>
            <p className="mt-1.5 text-sm text-muted">Get a feel for the neighbourhood, see what&apos;s nearby, and compare typical rents so you can pick an area that fits your lifestyle and budget.</p>

            <Field label="Your faculty" className="mt-5">
              {(id) => (
                <Select id={id} value={faculty} onChange={(e) => setFaculty(e.target.value)}>
                  <option value="">Show all areas</option>
                  {FACULTIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <h2 className="mb-2 mt-5 text-sm font-bold">{faculty ? "We recommend" : "Recommended areas"}</h2>
            <ol className="space-y-2">
              {ordered.slice(0, recommendedCount).map((a, i) => (
                <AreaRow key={a.id} n={i + 1} name={a.name} tagline={a.tagline} price={a.priceFrom} onClick={() => setAreaId(a.id)} />
              ))}
            </ol>
            {faculty && ordered.length > recommendedCount && (
              <>
                <h2 className="mb-2 mt-4 text-sm font-bold">Other options</h2>
                <ol className="space-y-2">
                  {ordered.slice(recommendedCount).map((a) => (
                    <AreaRow key={a.id} name={a.name} tagline={a.tagline} price={a.priceFrom} onClick={() => setAreaId(a.id)} muted />
                  ))}
                </ol>
              </>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Many students stay near BTS or MRT stations that are a little further away but generally cheaper.{" "}
              <Link href="/train-map" className="font-semibold text-brand-700 underline">
                See train station map
              </Link>
            </p>
            <div className="mt-5 rounded-xl bg-brand-50 p-4 text-center">
              <p className="text-xs text-muted">Already comfortable with the areas?</p>
              <ButtonLink href="/find-my-room" className="mt-2 w-full">
                Let us find your room
              </ButtonLink>
            </div>
          </div>
        )}
      </Card>
      <div className="order-1 h-[360px] overflow-hidden rounded-2xl ring-1 ring-line xl:order-2 xl:sticky xl:top-20 xl:h-[calc(100dvh-7rem)]">
        <MapView markers={markers} center={area ? [area.lat, area.lng] : [CHULA.lat, CHULA.lng]} zoom={area ? 15 : 14} />
      </div>
    </div>
  );
}

function AreaRow({ n, name, tagline, price, onClick, muted }: { n?: number; name: string; tagline: string; price: number; onClick: () => void; muted?: boolean }) {
  return (
    <li>
      <button onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition hover:border-brand-300 hover:bg-brand-50", muted ? "bg-white" : "bg-brand-50/40")}>
        {n !== undefined && <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-lg font-bold text-brand-600 ring-1 ring-brand-100">{n}</span>}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">{name}</span>
          <span className="block text-xs font-semibold text-brand-600">{baht(price)}++ THB</span>
          <span className="block truncate text-xs text-muted">{tagline}</span>
        </span>
        <ChevronRight className="size-4 text-muted" />
      </button>
    </li>
  );
}

function NearbyGroup({ icon: Icon, title, items }: { icon: typeof ShoppingBasket; title: string; items: string[] }) {
  return (
    <details className="group border-b border-line py-3" open>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-brand-600" /> {title}
        <ChevronRight className="ml-auto size-4 text-muted transition group-open:rotate-90" />
      </summary>
      <ul className="mt-2 space-y-1 pl-6 text-sm text-muted">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </details>
  );
}
