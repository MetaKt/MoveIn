"use client";

import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, PageHeader, Tabs } from "@/components/ui";
import { baht, fullName } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { AREAS, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { ListingStatus } from "@/lib/types";

type Tab = "pending" | "on_market" | "off_market" | "rejected";

export default function AdminRooms() {
  const t = useT();
  const listings = useStore((s) => s.listings);
  const users = useStore((s) => s.users);
  const setStatus = useStore((s) => s.setListingStatus);
  const updateUser = useStore((s) => s.updateUser);
  const [tab, setTab] = useState<Tab>("pending");
  const shown = useMemo(() => listings.filter((l) => l.status === tab), [listings, tab]);
  const n = (status: ListingStatus) => listings.filter((l) => l.status === status).length;

  return (
    <div>
      <PageHeader eyebrow={t("Admin")} title={t("Rooms")} subtitle={t("Approve new listings before students can see them.")} />
      <div className="mb-6 max-w-2xl">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "pending", label: t("To review ({count})", { count: n("pending") }) },
            { value: "on_market", label: t("On market ({count})", { count: n("on_market") }) },
            { value: "off_market", label: t("Off market ({count})", { count: n("off_market") }) },
            { value: "rejected", label: t("Rejected ({count})", { count: n("rejected") }) },
          ]}
        />
      </div>
      <div className="space-y-3">
        {shown.length === 0 && <p className="text-sm text-muted">{t("Nothing here.")}</p>}
        {shown.map((l) => {
          const host = users.find((u) => u.id === l.landlordId);
          return (
            <Card key={l.id} className="flex flex-wrap items-center gap-4 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.photos[0]} alt="" className="h-20 w-28 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/rooms/${l.id}`} className="font-bold hover:underline">
                  {l.title}
                </Link>
                <p className="text-xs text-muted">
                  {l.building} · {t(AREAS.find((a) => a.id === l.areaId)?.name ?? "")} · {t(ROOM_TYPE_LABEL[l.roomType])} · {l.sizeSqm} m² · {baht(l.rent)} ·{" "}
                  {t("{count} photos", { count: l.photos.length })}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs">
                  {t("Host:")} <strong>{fullName(host)}</strong>
                  {host?.landlord?.verified ? (
                    <Badge tone="brand">
                      <BadgeCheck className="size-3" /> {t("ID verified")}
                    </Badge>
                  ) : host?.landlord?.idDocument ? (
                    <button className="font-semibold text-brand-700 underline" onClick={() => updateUser(host.id, { landlord: { ...host.landlord!, verified: true } })}>
                      {t("Mark ID verified")}
                    </button>
                  ) : (
                    <Badge tone="amber">{t("No ID uploaded")}</Badge>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {l.status === "pending" && (
                  <>
                    <Button size="sm" variant="success" onClick={() => setStatus(l.id, "on_market")}>
                      {t("Approve")}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setStatus(l.id, "rejected")}>
                      {t("Needs changes")}
                    </Button>
                  </>
                )}
                {l.status === "on_market" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(l.id, "off_market")}>
                    {t("Take down")}
                  </Button>
                )}
                {(l.status === "off_market" || l.status === "rejected") && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(l.id, "on_market")}>
                    {t("Publish")}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
