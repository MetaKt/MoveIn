"use client";

import { Pencil, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { ButtonLink, EmptyState, PageHeader, Select, Tabs } from "@/components/ui";
import { matchScore } from "@/lib/booking";
import { baht, date } from "@/lib/format";
import { msg, useT } from "@/lib/i18n";
import { AREAS, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";
import type { Listing, RoomType } from "@/lib/types";

type Tab = "match" | "takeover" | "available";

const TITLES: Record<Tab, { title: string; subtitle: string }> = {
  match: { title: msg("Match your preference"), subtitle: msg("Rooms our partners proposed for you, plus rooms that fit what you asked for.") },
  takeover: { title: msg("Take over former exchange students' rooms"), subtitle: msg("Students finishing their exchange pass their room on to you. Same building, same landlord, zero hassle.") },
  available: { title: msg("Currently available"), subtitle: msg("Every room on MoveIn you can request right now.") },
};

export default function RoomsPage() {
  return (
    <Suspense>
      <Rooms />
    </Suspense>
  );
}

function Rooms() {
  const t = useT();
  const params = useSearchParams();
  const router = useRouter();
  const tab = (params.get("tab") as Tab) || "match";
  const setTab = (next: Tab) => router.replace(`/rooms?tab=${next}`, { scroll: false });

  const [area, setArea] = useState(params.get("area") ?? "");
  const [type, setType] = useState<RoomType | "">("");
  const [maxRent, setMaxRent] = useState(0);
  const [sort, setSort] = useState<"price" | "date">("price");

  const listings = useStore((s) => s.listings);
  const filtered = useMemo(() => {
    let out = listings.filter((l) => l.status === "on_market");
    if (tab === "takeover") out = out.filter((l) => l.source === "takeover");
    if (area) out = out.filter((l) => l.areaId === area);
    if (type) out = out.filter((l) => l.roomType === type);
    if (maxRent) out = out.filter((l) => l.rent <= maxRent);
    return [...out].sort((a, b) => (sort === "price" ? a.rent - b.rent : a.availableFrom.localeCompare(b.availableFrom)));
  }, [listings, tab, area, type, maxRent, sort]);

  return (
    <div>
      <PageHeader eyebrow={t("Available rooms")} title={t(TITLES[tab].title)} subtitle={t(TITLES[tab].subtitle)} />
      <div className="mb-6 max-w-2xl">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "match", label: t("Your Match") },
            { value: "takeover", label: t("Student-to-Student") },
            { value: "available", label: t("Available now") },
          ]}
        />
      </div>

      {tab === "match" ? (
        <YourMatch />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted" />
            <Select aria-label={t("Area")} value={area} onChange={(e) => setArea(e.target.value)} className="h-9 w-auto py-1.5">
              <option value="">{t("All areas")}</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {t(a.name)}
                </option>
              ))}
            </Select>
            <Select aria-label={t("Room type")} value={type} onChange={(e) => setType(e.target.value as RoomType | "")} className="h-9 w-auto py-1.5">
              <option value="">{t("Any room type")}</option>
              {Object.entries(ROOM_TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {t(v)}
                </option>
              ))}
            </Select>
            <Select aria-label={t("Budget")} value={maxRent} onChange={(e) => setMaxRent(Number(e.target.value))} className="h-9 w-auto py-1.5">
              <option value={0}>{t("Any budget")}</option>
              {[15000, 18000, 20000, 25000, 30000, 40000].map((n) => (
                <option key={n} value={n}>
                  {t("Up to {price}", { price: baht(n) })}
                </option>
              ))}
            </Select>
            <Select aria-label={t("Sort")} value={sort} onChange={(e) => setSort(e.target.value as "price" | "date")} className="h-9 w-auto py-1.5">
              <option value="price">{t("Lowest price")}</option>
              <option value="date">{t("Earliest available")}</option>
            </Select>
            <span className="ml-auto text-sm text-muted">{t("{count} rooms", { count: filtered.length })}</span>
          </div>
          {filtered.length ? (
            <Grid listings={filtered} />
          ) : (
            <EmptyState image="/illustrations/study.png" title={t("No rooms match these filters")} action={<ButtonLink href="/find-my-room">{t("Let us find your room")}</ButtonLink>}>
              {t("Try a different area or budget, or tell us what you need and our partners will propose rooms to you.")}
            </EmptyState>
          )}
        </>
      )}
    </div>
  );
}

function Grid({ listings, tags }: { listings: Listing[]; tags?: Record<string, string> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} tag={tags?.[l.id]} />
      ))}
    </div>
  );
}

function YourMatch() {
  const t = useT();
  const me = useMe();
  const request = useStore((s) => s.requests.find((r) => r.studentId === me?.id && r.status === "open"));
  const proposals = useStore((s) => s.proposals);
  const listings = useStore((s) => s.listings);

  const { items, tags } = useMemo(() => {
    if (!request) return { items: [], tags: {} };
    const proposedIds = proposals.filter((p) => p.requestId === request.id).map((p) => p.listingId);
    const proposed = listings.filter((l) => proposedIds.includes(l.id) && l.status === "on_market");
    const goodFit = listings.filter((l) => l.status === "on_market" && !proposedIds.includes(l.id) && matchScore(l, request) >= 90);
    const tags: Record<string, string> = {};
    proposed.forEach((l) => (tags[l.id] = t("Proposed to you")));
    goodFit.forEach((l) => (tags[l.id] = t("Good fit")));
    return { items: [...proposed, ...goodFit], tags };
  }, [request, proposals, listings, t]);

  if (!me || !request)
    return (
      <EmptyState image="/illustrations/study.png" title={t("Let us find your room")} action={<ButtonLink href="/find-my-room">{t("Set your room preferences")}</ButtonLink>}>
        {t("Tell us what you're looking for, and our partners will offer you rooms. It may take a little time, but it's worth the wait!")}
      </EmptyState>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm ring-1 ring-brand-100">
        <span>
          <strong>{t("Your preferences:")}</strong>{" "}
          {t("{types} · up to {price} · {months} months from {date}", {
            types: request.roomTypes.map((rt) => t(ROOM_TYPE_LABEL[rt])).join(", "),
            price: baht(request.budget),
            months: request.months,
            date: date(request.moveIn, "d MMM yyyy"),
          })}
        </span>
        <ButtonLink href="/find-my-room" variant="secondary" size="sm" className="ml-auto">
          <Pencil className="size-3.5" /> {t("Edit")}
        </ButtonLink>
      </div>
      {items.length ? (
        <>
          <Grid listings={items} tags={tags} />
          <p className="text-center text-sm text-muted">{t("Come back often! Our partners keep adding rooms to your list.")}</p>
        </>
      ) : (
        <EmptyState image="/illustrations/running.jpg" title={t("Running to catch you rooms!")}>
          {t("Our partner landlords have your preferences. We'll email and WhatsApp you as soon as a room is proposed.")}
        </EmptyState>
      )}
    </div>
  );
}
