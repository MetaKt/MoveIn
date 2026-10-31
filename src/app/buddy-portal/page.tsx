"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Card, PageHeader } from "@/components/ui";
import { date } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useMe, useStore } from "@/lib/store";

export default function BuddyHome() {
  const t = useT();
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
            {t("Welcome back,")} <span className="text-brand-600">{me.firstName}</span>
          </>
        }
        subtitle={t("What would you like to do today?")}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Tile title={t("Your profile")} body={`${me.firstName} ${me.lastName}`} sub={t(me.buddy?.university ?? "")} href="/buddy-portal/profile" cta={t("View profile")} />
        <Tile title={t("Manual")} body={t("How to help students")} sub={t("before and after they arrive")} href="/buddy-portal/manual" cta={t("Read manual")} />
        <Tile
          title={t("Your buddies")}
          body={t("{count} students", { count: mine.length })}
          sub={next ? t("Next arrival: {name}, {date}", { name: nextName ?? "", date: date(next.arrivalDate!, "d MMM") }) : t("No upcoming arrivals")}
          href="/buddy-portal/buddies"
          cta={t("See buddies")}
        />
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
