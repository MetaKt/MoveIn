"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Card, PageHeader } from "@/components/ui";
import { date } from "@/lib/format";
import { useMe, useStore } from "@/lib/store";

export default function BuddyHome() {
  const me = useMe()!;
  const reqs = useStore((s) => s.buddyRequests);
  const users = useStore((s) => s.users);
  const mine = useMemo(() => reqs.filter((r) => r.buddyId === me.id), [reqs, me.id]);
  const next = mine
    .filter((r) => r.stage !== "settled" && r.arrivalDate)
    .sort((a, b) => (a.arrivalDate! < b.arrivalDate! ? -1 : 1))[0];
  const nextName = users.find((u) => u.id === next?.studentId)?.firstName;

  return (
    <div>
      <PageHeader
        title={
          <>
            Welcome back, <span className="text-brand-600">{me.firstName}</span>
          </>
        }
        subtitle="What would you like to do today?"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Tile title="Your profile" body={`${me.firstName} ${me.lastName}`} sub={me.buddy?.university ?? ""} href="/buddy-portal/profile" cta="View profile" />
        <Tile title="Manual" body="How to help students" sub="before and after they arrive" href="/buddy-portal/manual" cta="Read manual" />
        <Tile title="Your buddies" body={`${mine.length} students`} sub={next ? `Next arrival: ${nextName}, ${date(next.arrivalDate!, "d MMM")}` : "No upcoming arrivals"} href="/buddy-portal/buddies" cta="See buddies" />
      </div>
    </div>
  );
}

function Tile({ title, body, sub, href, cta }: { title: string; body: string; sub: string; href: string; cta: string }) {
  return (
    <Link href={href} className="group">
      <Card className="flex h-full flex-col p-5 transition group-hover:border-brand-300 group-hover:shadow-md">
        <p className="font-bold">{title}</p>
        <p className="mt-2 text-sm">{body}</p>
        <p className="text-sm text-muted">{sub}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          {cta} <ArrowRight className="size-4" />
        </span>
      </Card>
    </Link>
  );
}
