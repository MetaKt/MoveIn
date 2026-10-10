"use client";

import { MessageCircle } from "lucide-react";
import { Button, ButtonLink, Card, PageHeader } from "@/components/ui";
import { date, fullName, whatsappLink } from "@/lib/format";
import { useMe, useStore } from "@/lib/store";

const PERKS = [
  { img: "/illustrations/chat.png", title: "Before you arrive", text: "Chat on WhatsApp, get help choosing a room, and ask anything about life in Bangkok: transport, food, SIM cards." },
  { img: "/illustrations/arrive.jpg", title: "On arrival day", text: "Your buddy meets you, helps you check in, and brings the contract for you to sign." },
  { img: "/illustrations/buddies.png", title: "After you settle in", text: "A friendly local contact for your first weeks, plus MoveIn events and outings with other exchange students." },
];

export default function BuddyServicePage() {
  const me = useMe();
  const req = useStore((s) => s.buddyRequests.find((r) => r.studentId === me?.id));
  const buddy = useStore((s) => s.users.find((u) => u.id === req?.buddyId));
  const requestBuddy = useStore((s) => s.requestBuddy);

  return (
    <div>
      <PageHeader eyebrow="Buddy" title="Special service for international exchange students" />
      <p className="max-w-3xl text-sm leading-relaxed text-ink/80">
        Our <strong className="text-brand-700">Student Buddy Service</strong> connects international students with local Thai students who help them settle into life in Thailand, make new friends, explore the city, and feel at home.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/community/event-1.jpg" alt="MoveIn exchange students at a dinner event" className="aspect-[16/10] w-full rounded-2xl object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/community/event-2.jpg" alt="Exchange students at a MoveIn outing" className="aspect-[16/10] w-full rounded-2xl object-cover" />
      </div>

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        {!me ? (
          <>
            <p className="flex-1 text-sm">Sign in to book a buddy.</p>
            <ButtonLink href="/signin?next=/buddy">Book a buddy</ButtonLink>
          </>
        ) : me.role !== "student" ? (
          <p className="text-sm text-muted">Buddies are for exchange students. Thai student? You can apply to become one.</p>
        ) : buddy ? (
          <>
            <p className="flex-1 text-sm">
              Your buddy is <strong>{fullName(buddy)}</strong> ({buddy.buddy?.faculty}, year {buddy.buddy?.year}).
              {req?.arrivalDate && ` Arrival: ${date(req.arrivalDate)}.`}
            </p>
            <ButtonLink href={whatsappLink(buddy.whatsapp, `Hi ${buddy.firstName}! I'm ${me.firstName} from MoveIn.`)} target="_blank" variant="success">
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </ButtonLink>
          </>
        ) : req ? (
          <p className="text-sm">We&apos;re matching you with a buddy. As soon as you&apos;re matched, they&apos;ll text you on WhatsApp ({me.whatsapp}).</p>
        ) : (
          <>
            <p className="flex-1 text-sm">Get matched with a Thai student who has been where you&apos;re going.</p>
            <Button size="lg" onClick={() => requestBuddy()}>
              Book a buddy
            </Button>
          </>
        )}
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {PERKS.map((p) => (
          <Card key={p.title} className="p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt="" className="mb-3 h-28 w-auto object-contain" />
            <h2 className="font-bold">{p.title}</h2>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
