"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/booking-steps";
import { Avatar, EmptyState, PageHeader, Tabs } from "@/components/ui";
import { bookingStage, STAGE_COPY } from "@/lib/booking";
import { date, flag, fullName } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useMe, useStore } from "@/lib/store";

const NEEDS_LANDLORD = new Set(["awaiting_landlord", "awaiting_bank_details", "awaiting_payment_confirmation", "awaiting_contract"]);
type Tab = "todo" | "progress" | "done";

export default function HostBookings() {
  const t = useT();
  const me = useMe()!;
  const [tab, setTab] = useState<Tab>("todo");
  const bookings = useStore((s) => s.bookings);
  const users = useStore((s) => s.users);
  const listings = useStore((s) => s.listings);
  const mine = useMemo(() => bookings.filter((b) => b.landlordId === me.id).map((b) => ({ b, stage: bookingStage(b) })), [bookings, me.id]);
  const bucket = (stage: ReturnType<typeof bookingStage>): Tab =>
    NEEDS_LANDLORD.has(stage) ? "todo" : ["ready_to_move_in", "declined", "cancelled"].includes(stage) ? "done" : "progress";
  const shown = mine.filter((x) => bucket(x.stage) === tab);
  const n = (which: Tab) => mine.filter((x) => bucket(x.stage) === which).length;

  return (
    <div>
      <PageHeader eyebrow={t("Bookings")} title={t("Request check")} subtitle={t("Approve booking requests, confirm payments and upload contracts.")} />
      <div className="mb-6 max-w-xl">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "todo", label: t("Needs you ({count})", { count: n("todo") }) },
            { value: "progress", label: t("Waiting on student ({count})", { count: n("progress") }) },
            { value: "done", label: t("Closed ({count})", { count: n("done") }) },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <EmptyState image="/illustrations/handover.jpg" title={tab === "todo" ? t("No requests need you right now") : t("Nothing here")} />
      ) : (
        <ul className="space-y-3">
          {shown.map(({ b, stage }) => {
            const s = users.find((u) => u.id === b.studentId);
            const l = listings.find((x) => x.id === b.listingId);
            return (
              <li key={b.id}>
                <Link href={`/host/bookings/${b.id}`} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand-300">
                  <Avatar name={fullName(s)} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {fullName(s)} {s?.student && flag(s.student.countryCode)}
                    </p>
                    <p className="text-sm text-muted">
                      {l?.building} · {t("from {date}", { date: date(b.moveIn, "d MMM yyyy") })} · {t("{months} months", { months: b.months })}
                    </p>
                  </div>
                  <StatusPill tone={tab === "todo" ? "action" : tab === "done" ? (stage === "ready_to_move_in" ? "done" : "stopped") : "waiting"}>{t(STAGE_COPY[stage].landlord)}</StatusPill>
                  <ChevronRight className="size-5 text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
