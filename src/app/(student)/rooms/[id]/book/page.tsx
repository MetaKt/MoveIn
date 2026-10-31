"use client";

import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FileChip, FileUpload } from "@/components/file-upload";
import { Button, ButtonLink, Card, EmptyState, Field, Input, Notice, Stepper, Textarea } from "@/components/ui";
import { moveOutDate, totalDue } from "@/lib/booking";
import { baht, date } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useMe, useStore } from "@/lib/store";
import type { FileRef } from "@/lib/types";

export default function BookPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const me = useMe();
  const listing = useStore((s) => s.listings.find((l) => l.id === id));
  const createBooking = useStore((s) => s.createBooking);

  const [moveIn, setMoveIn] = useState(listing?.availableFrom ?? "");
  const [months, setMonths] = useState(Math.max(listing?.minMonths ?? 4, 5));
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [tour, setTour] = useState(true);
  const [passport, setPassport] = useState<FileRef>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!listing || listing.status !== "on_market")
    return (
      <EmptyState title={t("This room can't be booked right now")} action={<ButtonLink href="/rooms?tab=available">{t("Browse rooms")}</ButtonLink>}>
        {t("It may already be taken.")}
      </EmptyState>
    );

  if (!me || me.role !== "student")
    return (
      <EmptyState image="/illustrations/arrive.jpg" title={t("Sign in as a student to book")} action={<ButtonLink href={`/signin?next=/rooms/${id}/book`}>{t("Sign in")}</ButtonLink>}>
        {t("It takes a minute, and you only need an email or Google account.")}
      </EmptyState>
    );

  const submit = () => {
    const e: Record<string, string> = {};
    if (!moveIn) e.moveIn = t("Choose your move-in date.");
    else if (moveIn < listing.availableFrom) e.moveIn = t("This room is available from {date}.", { date: date(listing.availableFrom) });
    if (months < listing.minMonths) e.months = t("Minimum stay is {months} months.", { months: listing.minMonths });
    if (!passport) e.passport = t("Upload your passport so the landlord can confirm your identity.");
    setErrors(e);
    if (Object.keys(e).length) return;
    const b = createBooking({ listingId: listing.id, moveIn, months, guests, note: note.trim(), tourVideoRequested: tour, passport });
    router.push(`/bookings/${b.id}?new=1`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/rooms/${listing.id}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> {t("Back to room")}
      </Link>
      <h1 className="text-2xl font-bold sm:text-3xl">{t("Request for booking")}</h1>
      <p className="mt-1 text-sm text-muted">{t("The landlord reviews every request. You won't pay anything until they accept.")}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <Card className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Check-in (move-in date)")} error={errors.moveIn}>
              {(fid) => <Input id={fid} type="date" min={listing.availableFrom} value={moveIn} onChange={(e) => setMoveIn(e.target.value)} />}
            </Field>
            <Field label={t("Check-out (auto-generated)")}>{(fid) => <Input id={fid} disabled value={moveIn ? date(moveOutDate(moveIn, months)) : "—"} />}</Field>
          </div>
          <div>
            <Stepper label={t("Number of months")} value={months} onChange={setMonths} min={1} max={12} />
            {errors.months && <p className="mt-1 text-xs font-medium text-red-600">{errors.months}</p>}
            <Stepper label={t("Number of guests")} value={guests} onChange={setGuests} min={1} max={listing.guests} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">{t("Upload your passport")}</p>
            {passport ? (
              <div className="flex items-center gap-3">
                <FileChip file={passport} className="flex-1" />
                <Button variant="ghost" size="sm" onClick={() => setPassport(undefined)}>
                  {t("Replace")}
                </Button>
              </div>
            ) : (
              <FileUpload label={t("Upload passport photo or PDF")} accept="image/*,application/pdf" onFile={setPassport} hint={t("Only the landlord of this room will see it.")} />
            )}
            {errors.passport && <p className="mt-1 text-xs font-medium text-red-600">{errors.passport}</p>}
          </div>
          <Field label={t("Special note to the landlord")} hint={t("Optional. Introduce yourself or ask a question.")}>
            {(fid) => <Textarea id={fid} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder={t("Hi! I'm an exchange student from…")} />}
          </Field>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 hover:border-brand-300">
            <input type="checkbox" checked={tour} onChange={(e) => setTour(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
            <span className="text-sm">
              <span className="block font-semibold">{t("Request a room tour video")}</span>
              <span className="text-muted">{t("The landlord records a short walkthrough so you can see the room before you pay.")}</span>
            </span>
          </label>
          <Button size="lg" className="w-full" onClick={submit}>
            {t("Send request")}
          </Button>
        </Card>

        <aside className="space-y-4">
          <Card className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.photos[0]} alt="" className="aspect-video w-full object-cover" />
            <div className="space-y-2 p-4 text-sm">
              <p className="font-bold">{listing.building}</p>
              <Row k={t("Monthly rent")} v={baht(listing.rent)} />
              <Row k={t("Security deposit")} v={baht(listing.deposit)} />
              <div className="border-t border-line pt-2">
                <Row k={t("Due after acceptance")} v={baht(totalDue(listing))} bold />
              </div>
              <p className="text-xs text-muted">{t("First month's rent plus deposit. Monthly rent after that is paid to the landlord as agreed in your contract.")}</p>
            </div>
          </Card>
          <Notice>
            <span className="flex gap-2">
              <ShieldCheck className="size-5 shrink-0" /> {t("Before you pay, you'll see the landlord's verified Thai ID so you know they're legit.")}
            </span>
          </Notice>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <p className={`flex justify-between ${bold ? "font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted"}>{k}</span>
      <span>{v}</span>
    </p>
  );
}
