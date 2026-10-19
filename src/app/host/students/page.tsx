"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Badge, EmptyState, PageHeader, Tabs } from "@/components/ui";
import { matchScore } from "@/lib/booking";
import { baht, date, flag, fullName } from "@/lib/format";
import { ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";

type Tab = "fit" | "all" | "proposed";

export default function StudentList() {
  const me = useMe()!;
  const [tab, setTab] = useState<Tab>("fit");
  const requests = useStore((s) => s.requests);
  const users = useStore((s) => s.users);
  const listings = useStore((s) => s.listings);
  const proposals = useStore((s) => s.proposals);

  const rows = useMemo(() => {
    const mine = listings.filter((l) => l.landlordId === me.id && l.status === "on_market");
    return requests
      .filter((r) => r.status === "open")
      .map((r) => ({
        r,
        student: users.find((u) => u.id === r.studentId),
        best: Math.max(0, ...mine.map((l) => matchScore(l, r))),
        proposed: proposals.some((p) => p.requestId === r.id && p.landlordId === me.id),
      }))
      .sort((a, b) => b.best - a.best);
  }, [requests, users, listings, proposals, me.id]);

  const shown = rows.filter((x) => (tab === "fit" ? x.best >= 70 && !x.proposed : tab === "proposed" ? x.proposed : true));

  return (
    <div>
      <PageHeader eyebrow="Student list" title="These students are looking for rooms!" subtitle="Propose your rooms to students whose preferences fit. They'll get an email and WhatsApp message." />
      <div className="mb-6 max-w-xl">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "fit", label: "Fit your rooms" },
            { value: "all", label: "All students" },
            { value: "proposed", label: "Proposed" },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <EmptyState image="/illustrations/study.png" title="No students here right now">
          Students look for rooms most between April–August and October–December.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {shown.map(({ r, student, best, proposed }) => (
            <li key={r.id}>
              <Link href={`/host/students/${r.id}`} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand-300 hover:shadow-sm">
                <Avatar name={fullName(student)} className="size-11" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {student?.firstName}
                    {r.occupants > 1 ? ` + ${r.occupants - 1}` : ""} {student?.student && flag(student.student.countryCode)}
                    <span className="ml-2 font-normal text-muted">
                      {r.occupants > 1 ? "are" : "is"} looking for a {r.roomTypes.map((t) => ROOM_TYPE_LABEL[t]).join(" / ")}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Budget: <strong className="text-ink">{baht(r.budget)}</strong> · Contract length: <strong className="text-ink">{r.months} months</strong> · Move in {date(r.moveIn, "d MMM yyyy")}
                  </p>
                </div>
                {proposed ? <Badge tone="gray">Proposed</Badge> : best >= 70 ? <Badge tone="brand">Fits your rooms</Badge> : null}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  View details <ChevronRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
