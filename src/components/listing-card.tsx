"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { baht, cn, date, flag } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { ROOM_TYPE_LABEL } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing, href, tag }: { listing: Listing; href?: string; tag?: string }) {
  const t = useT();
  const me = useStore((s) => s.currentUserId);
  const fav = useStore((s) => (me ? (s.favorites[me] ?? []).includes(listing.id) : false));
  const toggle = useStore((s) => s.toggleFavorite);
  const available = listing.status === "on_market";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-900/5">
      <Link href={href ?? `/rooms/${listing.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge tone={available ? "green" : "red"}>{available ? t("Available") : listing.status === "pending" ? t("In review") : t("Sold out")}</Badge>
            {tag && <Badge tone="brand" className="bg-white">{tag}</Badge>}
          </div>
        </div>
        <div className="p-4 pr-14">
          <p className="truncate text-sm font-bold text-ink">{listing.building}</p>
          <p className="truncate text-xs text-muted">
            {listing.sizeSqm} m² · {t(ROOM_TYPE_LABEL[listing.roomType])} · {t("Furnished")}
          </p>
          <p className="mt-2 text-lg font-bold text-brand-600">
            {baht(listing.rent)} <span className="text-xs font-medium text-muted">{t("/ month")}</span>
          </p>
          <p className="text-xs text-muted">{t("Available on {date}", { date: date(listing.availableFrom) })}</p>
        </div>
      </Link>
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        {listing.source === "takeover" && listing.currentTenant && (
          <span title={t("Current tenant from {country}", { country: t(listing.currentTenant.country) })} className="text-2xl leading-none">
            {flag(listing.currentTenant.countryCode)}
          </span>
        )}
        {me && (
          <button
            aria-label={fav ? t("Remove from saved") : t("Save room")}
            onClick={() => toggle(listing.id)}
            className={cn("grid size-9 place-items-center rounded-full transition", fav ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600 hover:bg-brand-100")}
          >
            <Heart className={cn("size-4", fav && "fill-current")} />
          </button>
        )}
      </div>
    </div>
  );
}
