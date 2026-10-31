"use client";

import { Card, PageHeader } from "@/components/ui";
import { msg, useT } from "@/lib/i18n";

const SECTIONS = [
  {
    img: "/illustrations/chat.png",
    title: msg("Before they arrive"),
    items: [msg("Say hi on WhatsApp within 24 hours of being matched"), msg("Help them pick a room that fits their budget and faculty"), msg("Answer questions about transport, food, SIM cards and banking"), msg("Follow up until they decide"), msg("Coordinate basic check-in details with the landlord group")],
  },
  {
    img: "/illustrations/arrive.jpg",
    title: msg("On arrival day"),
    items: [msg("Meet the student (airport or condo, as agreed)"), msg("Help with check-in and bring the contract for them to sign"), msg("Show them the nearest 7-Eleven, BTS/MRT and a good place to eat"), msg("Stay a friendly local contact for their first days")],
  },
  {
    img: "/illustrations/handover.jpg",
    title: msg("Know your limits"),
    items: [msg("Never give advice on contract clauses: tap “Request help” and the MoveIn team takes over"), msg("Don't handle money or legal paperwork"), msg("Keep chats friendly, clear and in English"), msg("Reply fast; if you're unavailable, tell the MoveIn team")],
  },
];

export default function ManualPage() {
  const t = useT();
  return (
    <div>
      <PageHeader title={t("User manual")} subtitle={t("Here is everything you need to know about your work.")} />
      <div className="grid gap-4 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.img} alt="" className="mb-3 h-32 w-auto object-contain" />
            <h2 className="font-bold">{t(s.title)}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/80">
              {s.items.map((i) => (
                <li key={i}>{t(i)}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
