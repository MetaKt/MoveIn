"use client";

import { MessageCircle } from "lucide-react";
import { useMemo } from "react";
import { Avatar, EmptyState, PageHeader, Select, hl } from "@/components/ui";
import { date, flag, fullName, whatsappLink } from "@/lib/format";
import { msg, useT } from "@/lib/i18n";
import { useMe, useStore } from "@/lib/store";
import type { BuddyRequest } from "@/lib/types";

const STAGE_LABEL: Record<BuddyRequest["stage"], string> = { matching: msg("Matching"), choosing: msg("Choosing a room"), arriving: msg("Arriving soon"), settled: msg("Settled in") };

export default function YourBuddies() {
  const t = useT();
  const me = useMe()!;
  const reqs = useStore((s) => s.buddyRequests);
  const users = useStore((s) => s.users);
  const setStage = useStore((s) => s.setBuddyStage);
  const mine = useMemo(() => reqs.filter((r) => r.buddyId === me.id), [reqs, me.id]);

  return (
    <div>
      <PageHeader
        title={hl(t("Your [buddies]"))}
        subtitle={t("{count} students you're helping settle in.", { count: mine.length })}
      />
      {mine.length === 0 ? (
        <EmptyState image="/illustrations/buddies.png" title={t("No buddies yet")}>
          {t("The MoveIn team will match you with a student soon.")}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {mine.map((r) => {
            const s = users.find((u) => u.id === r.studentId);
            if (!s) return null;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4">
                <Avatar name={fullName(s)} className="size-11" />
                <div className="min-w-[180px] flex-1">
                  <p className="font-bold">
                    {fullName(s)} {s.student && flag(s.student.countryCode)}
                  </p>
                  <p className="text-sm text-muted">
                    {t(s.student?.country ?? "")} · {s.student?.homeUniversity}
                  </p>
                </div>
                <p className="w-36 text-sm text-muted">{r.arrivalDate
                    ? t(r.stage === "settled" ? "Arrived {date}" : "Arrives {date}", { date: date(r.arrivalDate, "d MMM") })
                    : t("Arrival TBC")}</p>
                <Select aria-label={t("Stage")} value={r.stage} onChange={(e) => setStage(r.id, e.target.value as BuddyRequest["stage"])} className="h-9 w-44 py-1.5">
                  {(["choosing", "arriving", "settled"] as const).map((x) => (
                    <option key={x} value={x}>
                      {t(STAGE_LABEL[x])}
                    </option>
                  ))}
                </Select>
                <a href={whatsappLink(s.whatsapp, `Hi ${s.firstName}! I'm ${me.firstName}, your MoveIn buddy.`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                  <MessageCircle className="size-4" /> {t("Chat")}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
