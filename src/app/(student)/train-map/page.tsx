"use client";

import { useState } from "react";
import { MapView, type MapMarker } from "@/components/map";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { CHULA, LINE_COLORS, STATIONS } from "@/lib/reference";
import type { Station } from "@/lib/types";

export default function TrainMapPage() {
  const t = useT();
  const [view, setView] = useState<"live" | "diagram">("live");
  const [selected, setSelected] = useState<Station | null>(null);
  const sorted = [...STATIONS].sort((a, b) => a.minutesToChula - b.minutesToChula);

  const markers: MapMarker[] = STATIONS.map((s) => ({
    id: s.id,
    lat: s.lat,
    lng: s.lng,
    kind: "station",
    label: `${s.line} · ${s.name}`,
    sub: t("~{min} min to Chula", { min: s.minutesToChula }),
    color: LINE_COLORS[s.line],
    onClick: () => setSelected(s),
  }));

  return (
    <div>
      <PageHeader
        eyebrow={t("Train station map")}
        title={t("Public transport")}
        subtitle={t("Rooms near BTS and MRT stations a little further from campus are often cheaper. Here's how long each station takes to Chula.")}
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="order-2 p-5 xl:order-1">
          <h2 className="text-sm font-bold">{t("Closest to your university")}</h2>
          <ul className="mt-3 space-y-2">
            {sorted.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setSelected(s);
                    setView("live");
                  }}
                  className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:border-brand-300", selected?.id === s.id ? "border-brand-500 bg-brand-50" : "border-line")}
                >
                  <span className="size-3 shrink-0 rounded-full ring-4 ring-white" style={{ background: LINE_COLORS[s.line], boxShadow: `0 0 0 2px ${LINE_COLORS[s.line]}` }} />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{s.name}</span>
                    <span className="block text-xs text-muted">{s.line}</span>
                  </span>
                  <span className="text-xs font-semibold text-brand-700">{t("~{min} min", { min: s.minutesToChula })}</span>
                </button>
              </li>
            ))}
          </ul>
          <ButtonLink href="/find-my-room" className="mt-5 w-full">
            {t("Let us find your room")}
          </ButtonLink>
        </Card>
        <div className="order-1 xl:order-2">
          <div className="mb-3 inline-flex rounded-full bg-white p-1 ring-1 ring-line">
            {(["live", "diagram"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", view === v ? "bg-brand-600 text-white" : "text-muted")}>
                {v === "live" ? t("Map") : t("Network diagram")}
              </button>
            ))}
          </div>
          <div className="h-[420px] overflow-hidden rounded-2xl bg-white ring-1 ring-line xl:h-[calc(100dvh-12rem)]">
            {view === "live" ? (
              <MapView markers={markers} center={selected ? [selected.lat, selected.lng] : [CHULA.lat, CHULA.lng]} zoom={selected ? 15 : 14} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/maps/train-map.jpg" alt={t("Bangkok BTS and MRT network diagram")} className="h-full w-full object-contain p-4" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
