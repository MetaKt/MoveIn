"use client";

import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, PageHeader, Tabs } from "@/components/ui";
import { baht, fullName } from "@/lib/format";
import { AREAS, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { ListingStatus } from "@/lib/types";

type Tab = "pending" | "on_market" | "off_market" | "rejected";

export default function AdminRooms() {
  const listings = useStore((s) => s.listings);
  const users = useStore((s) => s.users);
  const setStatus = useStore((s) => s.setListingStatus);
  const updateUser = useStore((s) => s.updateUser);
  const [tab, setTab] = useState<Tab>("pending");
  const shown = useMemo(() => listings.filter((l) => l.status === tab), [listings, tab]);
  const n = (t: ListingStatus) => listings.filter((l) => l.status === t).length;

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Rooms" subtitle="Approve new listings before students can see them." />
      <div className="mb-6 max-w-2xl">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "pending", label: `To review (${n("pending")})` },
            { value: "on_market", label: `On market (${n("on_market")})` },
            { value: "off_market", label: `Off market (${n("off_market")})` },
            { value: "rejected", label: `Rejected (${n("rejected")})` },
          ]}
        />
      </div>
      <div className="space-y-3">
        {shown.length === 0 && <p className="text-sm text-muted">Nothing here.</p>}
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
                  {l.building} · {AREAS.find((a) => a.id === l.areaId)?.name} · {ROOM_TYPE_LABEL[l.roomType]} · {l.sizeSqm} m² · {baht(l.rent)} · {l.photos.length} photos
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs">
                  Host: <strong>{fullName(host)}</strong>
                  {host?.landlord?.verified ? (
                    <Badge tone="brand">
                      <BadgeCheck className="size-3" /> ID verified
                    </Badge>
                  ) : host?.landlord?.idDocument ? (
                    <button className="font-semibold text-brand-700 underline" onClick={() => updateUser(host.id, { landlord: { ...host.landlord!, verified: true } })}>
                      Mark ID verified
                    </button>
                  ) : (
                    <Badge tone="amber">No ID uploaded</Badge>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {l.status === "pending" && (
                  <>
                    <Button size="sm" variant="success" onClick={() => setStatus(l.id, "on_market")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setStatus(l.id, "rejected")}>
                      Needs changes
                    </Button>
                  </>
                )}
                {l.status === "on_market" && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(l.id, "off_market")}>
                    Take down
                  </Button>
                )}
                {(l.status === "off_market" || l.status === "rejected") && (
                  <Button size="sm" variant="secondary" onClick={() => setStatus(l.id, "on_market")}>
                    Publish
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
