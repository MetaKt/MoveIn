"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, ButtonLink, EmptyState, PageHeader, Tabs } from "@/components/ui";
import { baht, date, monthsLeft } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";

type Tab = "on" | "off" | "review";

export default function HostRooms() {
  const t = useT();
  const me = useMe()!;
  const listings = useStore((s) => s.listings);
  const [tab, setTab] = useState<Tab>("on");
  const mine = useMemo(() => listings.filter((l) => l.landlordId === me.id), [listings, me.id]);
  const shown = mine.filter((l) => (tab === "on" ? l.status === "on_market" : tab === "off" ? l.status === "off_market" : l.status === "pending" || l.status === "rejected"));
  const count = (which: Tab) => mine.filter((l) => (which === "on" ? l.status === "on_market" : which === "off" ? l.status === "off_market" : l.status === "pending" || l.status === "rejected")).length;

  return (
    <div>
      <PageHeader
        eyebrow={t("My rooms")}
        title={t("Your room(s)")}
        actions={
          <ButtonLink href="/host/new">
            <Plus className="size-4" /> {t("Add your room(s)")}
          </ButtonLink>
        }
      />
      <div className="mb-6 max-w-xl">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "on", label: t("On the market ({count})", { count: count("on") }) },
            { value: "off", label: t("Off the market ({count})", { count: count("off") }) },
            { value: "review", label: t("In review ({count})", { count: count("review") }) },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <EmptyState image="/illustrations/handover.jpg" title={tab === "review" ? t("Nothing waiting for review") : t("No rooms here yet")} action={<ButtonLink href="/host/new">{t("Add your room")}</ButtonLink>}>
          {t("New rooms are checked by the MoveIn team before students can see them.")}
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((l) => (
            <HostRoomCard key={l.id} l={l} />
          ))}
        </div>
      )}
    </div>
  );
}

function HostRoomCard({ l }: { l: Listing }) {
  const t = useT();
  return (
    <Link href={`/host/rooms/${l.id}`} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-brand-300 hover:shadow-md">
      <div className="relative aspect-[16/10] bg-brand-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3">
          {l.status === "on_market" && <Badge tone="green">{t("Available")}</Badge>}
          {l.status === "off_market" && l.tenancy && <Badge tone="amber">{t("{count} months left", { count: monthsLeft(l.tenancy.endsOn) })}</Badge>}
          {l.status === "pending" && <Badge tone="gray">{t("In review")}</Badge>}
          {l.status === "rejected" && <Badge tone="red">{t("Needs changes")}</Badge>}
        </span>
      </div>
      <div className="p-4">
        <p className="font-bold">{l.building}</p>
        <p className="text-xs text-muted">
          {l.sizeSqm} m² · {t(ROOM_TYPE_LABEL[l.roomType])} · {t("Furnished")}
        </p>
        <p className="mt-2 font-bold text-brand-600">{baht(l.rent)}</p>
        {l.status === "off_market" && l.tenancy ? (
          <p className="text-xs text-muted">
            {l.tenancy.studentName} · {t("contract ends on {date}", { date: date(l.tenancy.endsOn) })}
          </p>
        ) : (
          <p className="text-xs text-muted">{t("Available on {date}", { date: date(l.availableFrom) })}</p>
        )}
      </div>
    </Link>
  );
}
