"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { StatusPill } from "@/components/booking-steps";
import { ButtonLink, EmptyState, PageHeader } from "@/components/ui";
import { bookingStage, STAGE_COPY } from "@/lib/booking";
import { baht, date } from "@/lib/format";
import { useMe, useStore } from "@/lib/store";

const STUDENT_ACTION = new Set(["awaiting_payment", "awaiting_student_acceptance", "awaiting_countersign"]);

export default function BookingsPage() {
  const me = useMe();
  const all = useStore((s) => s.bookings);
  const listings = useStore((s) => s.listings);
  const mine = useMemo(() => all.filter((b) => b.studentId === me?.id), [all, me?.id]);

  if (!me)
    return (
      <EmptyState image="/illustrations/arrive.jpg" title="Sign in to see your bookings" action={<ButtonLink href="/signin?next=/bookings">Sign in</ButtonLink>} />
    );

  return (
    <div>
      <PageHeader eyebrow="My bookings" title="Your booking requests" subtitle="Track every step from request to move-in day." />
      {mine.length === 0 ? (
        <EmptyState image="/illustrations/study.png" title="No bookings yet" action={<ButtonLink href="/rooms?tab=available">Browse rooms</ButtonLink>}>
          When you request a room, you&apos;ll follow its progress here.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {mine.map((b) => {
            const l = listings.find((x) => x.id === b.listingId);
            const stage = bookingStage(b);
            return (
              <li key={b.id}>
                <Link href={`/bookings/${b.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-3 transition hover:border-brand-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l?.photos[0]} alt="" className="size-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{l?.building}</p>
                    <p className="text-xs text-muted">
                      {date(b.moveIn, "d MMM yyyy")} · {b.months} months · {l && baht(l.rent)}/mo
                    </p>
                    <div className="mt-2">
                      <StatusPill tone={stage === "ready_to_move_in" ? "done" : stage === "declined" || stage === "cancelled" ? "stopped" : STUDENT_ACTION.has(stage) ? "action" : "waiting"}>
                        {STAGE_COPY[stage].student}
                      </StatusPill>
                    </div>
                  </div>
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
