"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { bookingStage, matchScore } from "@/lib/booking";
import { useMe, useStore } from "@/lib/store";

const NEEDS_LANDLORD = new Set(["awaiting_landlord", "awaiting_bank_details", "awaiting_payment_confirmation", "awaiting_contract"]);

export default function HostHome() {
  const me = useMe()!;
  const listings = useStore((s) => s.listings);
  const requests = useStore((s) => s.requests);
  const bookings = useStore((s) => s.bookings);

  const stats = useMemo(() => {
    const mine = listings.filter((l) => l.landlordId === me.id);
    const onMarket = mine.filter((l) => l.status === "on_market");
    const fits = requests.filter((r) => r.status === "open" && onMarket.some((l) => matchScore(l, r) >= 70));
    const todo = bookings.filter((b) => b.landlordId === me.id && NEEDS_LANDLORD.has(bookingStage(b)));
    return { total: mine.length, onMarket: onMarket.length, fits: fits.length, todo: todo.length };
  }, [listings, requests, bookings, me.id]);

  return (
    <div>
      <PageHeader
        title={
          <>
            Welcome back, <span className="text-brand-600">{me.firstName}</span>
          </>
        }
        subtitle="What would you like to do today?"
        actions={
          <ButtonLink href="/host/new">
            <Plus className="size-4" /> Add your room
          </ButtonLink>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile title="Your profile" body={`${me.firstName} ${me.lastName}`} sub={`Host since ${me.landlord?.hostSince ?? 2026}`} href="/host/profile" cta="View profile" />
        <Tile title="My rooms" body={`${stats.total} rooms listed`} sub={`${stats.onMarket} available now`} href="/host/rooms" cta="See rooms" />
        <Tile title="Student matching" body={`${stats.fits} students fit your rooms`} sub="Propose your rooms to them" href="/host/students" cta="See matches" />
        <Tile title="Bookings" body={`${stats.todo} ${stats.todo === 1 ? "booking needs" : "bookings need"} you`} sub="Approve, confirm payment, upload contracts" href="/host/bookings" cta="Review" highlight={stats.todo > 0} />
      </div>
    </div>
  );
}

function Tile({ title, body, sub, href, cta, highlight }: { title: string; body: string; sub: string; href: string; cta: string; highlight?: boolean }) {
  return (
    <Link href={href} className="group">
      <Card className={`flex h-full flex-col p-5 transition group-hover:border-brand-300 group-hover:shadow-md ${highlight ? "border-brand-400 ring-4 ring-brand-100" : ""}`}>
        <p className="font-bold">{title}</p>
        <p className="mt-2 text-sm text-ink">{body}</p>
        <p className="text-sm text-muted">{sub}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          {cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      </Card>
    </Link>
  );
}
