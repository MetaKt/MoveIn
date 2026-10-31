"use client";

import { BadgeCheck, CircleCheck, Clapperboard, HeartHandshake, LifeBuoy, MessageCircle, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { StatusPill, StepCard } from "@/components/booking-steps";
import { FileChip, FileUpload } from "@/components/file-upload";
import { Button, ButtonLink, Card, EmptyState, Notice } from "@/components/ui";
import { bookingStage, bookingStep, moveOutDate, STAGE_COPY } from "@/lib/booking";
import { baht, date, fullName } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useMe, useStore } from "@/lib/store";

export default function StudentBookingPage() {
  return (
    <Suspense>
      <StudentBooking />
    </Suspense>
  );
}

function StudentBooking() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const isNew = useSearchParams().get("new") === "1";
  const me = useMe();
  const b = useStore((s) => s.bookings.find((x) => x.id === id));
  const listing = useStore((s) => s.listings.find((l) => l.id === b?.listingId));
  const landlord = useStore((s) => s.users.find((u) => u.id === b?.landlordId));
  const buddyReq = useStore((s) => s.buddyRequests.find((r) => r.studentId === me?.id));
  const buddy = useStore((s) => s.users.find((u) => u.id === buddyReq?.buddyId));
  const a = useStore();

  if (!b || !listing || !me || b.studentId !== me.id)
    return <EmptyState title={t("Booking not found")} action={<ButtonLink href="/bookings">{t("My bookings")}</ButtonLink>} />;

  const stage = bookingStage(b);
  const step = bookingStep(stage);
  const stopped = stage === "declined" || stage === "cancelled";
  const latest = b.contracts.at(-1);
  const st = (n: number) => (step > n ? "done" : step === n ? "current" : "locked") as "done" | "current" | "locked";

  return (
    <div className="mx-auto max-w-5xl">
      {isNew && (
        <Notice tone="success" className="mb-5">
          <strong>{t("Request sent!")}</strong> {t("{name} will review it. We'll notify you by email and WhatsApp when they reply.", { name: landlord?.firstName ?? "" })}
        </Notice>
      )}
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{t("Request for booking")}</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{listing.building}</h1>
        <StatusPill tone={stage === "ready_to_move_in" ? "done" : stopped ? "stopped" : "waiting"}>{t(STAGE_COPY[stage].student)}</StatusPill>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {/* Request summary */}
          <Card className="p-5">
            <div className="flex flex-wrap gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.photos[0]} alt="" className="h-24 w-32 rounded-xl object-cover" />
              <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <Item k={t("Check-in")} v={date(b.moveIn, "d MMM yyyy")} />
                <Item k={t("Check-out")} v={date(moveOutDate(b.moveIn, b.months), "d MMM yyyy")} />
                <Item k={t("Months")} v={`${b.months}`} />
                <Item k={t("Guests")} v={`${b.guests}`} />
                <Item k={t("Rent")} v={t("{price}/mo", { price: baht(listing.rent) })} />
                <Item k={t("Landlord")} v={landlord ? fullName(landlord) : "—"} />
              </dl>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {b.passport && <FileChip file={b.passport} label={t("Your passport")} />}
              {b.tourVideoRequested &&
                (b.tourVideo ? (
                  <FileChip file={b.tourVideo} label={t("Room tour video")} />
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <Clapperboard className="size-4" /> {t("Room tour video requested")}
                  </span>
                ))}
            </div>
            {b.note && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-muted">&ldquo;{b.note}&rdquo;</p>}
            {stage === "awaiting_landlord" && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-sm text-muted">{t("Waiting for confirmation from {name}.", { name: landlord?.firstName ?? "" })}</p>
                <Button variant="danger" size="sm" onClick={() => confirm(t("Cancel this booking request?")) && a.cancelBooking(b.id)}>
                  {t("Cancel request")}
                </Button>
              </div>
            )}
            {stopped && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-sm text-muted">{t(STAGE_COPY[stage].student)}</p>
                <ButtonLink href="/rooms?tab=available" size="sm">
                  {t("Find another room")}
                </ButtonLink>
              </div>
            )}
          </Card>

          {!stopped && step > 0 && landlord && (
            <Card className="flex flex-wrap items-center gap-4 border-emerald-200 bg-emerald-50 p-4">
              <BadgeCheck className="size-6 text-emerald-600" />
              <p className="flex-1 text-sm">
                <strong>{t("Confirmed.")}</strong> {t("{name} accepted your request. Here is their verified Thai ID so you know who you're paying.", { name: fullName(landlord) })}
              </p>
              {landlord.landlord?.idDocument && <FileChip file={landlord.landlord.idDocument} label={t("Landlord's ID")} />}
            </Card>
          )}

          {!stopped && (
            <>
              <StepCard n={1} title={t("Transfer reservation and deposit")} state={st(1)}>
                {!b.bank ? (
                  <p className="text-sm text-muted">{t("{name} is adding their bank details. We'll notify you.", { name: landlord?.firstName ?? "" })}</p>
                ) : (
                  <>
                    <dl className="grid gap-x-6 gap-y-2 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                      <Item k={t("Bank")} v={b.bank.bank} />
                      <Item k="SWIFT" v={b.bank.swift} />
                      <Item k={t("Account name")} v={b.bank.accountName} />
                      <Item k={t("Account number")} v={b.bank.accountNumber} />
                      <Item k={t("Bank address")} v={b.bank.bankAddress} />
                      <Item k={t("Recipient address")} v={b.bank.recipientAddress} />
                    </dl>
                    <p className="text-lg font-bold">
                      {t("Total payment:")} <span className="text-brand-600">{baht(b.totalPayment ?? 0)}</span>
                    </p>
                    {b.slip ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <FileChip file={b.slip} label={t("Your transaction slip")} />
                        {b.paymentReceived ? <StatusPill tone="done">{t("Received by landlord")}</StatusPill> : <StatusPill tone="waiting">{t("Waiting for landlord to confirm")}</StatusPill>}
                      </div>
                    ) : (
                      <FileUpload label={t("Upload your transaction slip")} accept="image/*,application/pdf" onFile={(f) => a.uploadSlip(b.id, f)} hint={t("International transfer receipt (PDF or photo)")} />
                    )}
                  </>
                )}
              </StepCard>

              <StepCard n={2} title={t("Sign contract")} state={st(2)}>
                {!latest ? (
                  <p className="text-sm text-muted">{t("The landlord will upload a rental contract here. Your passport is attached to the contract.")}</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <FileChip file={latest} label={t("Rental contract (version {version})", { version: latest.version })} />
                      {b.contracts.length > 1 && <span className="text-xs text-muted">{t("Updated {count}× after your feedback", { count: b.contracts.length - 1 })}</span>}
                    </div>
                    {!b.studentAccepted ? (
                      <>
                        <Notice>
                          {buddy
                            ? t("Read it carefully. If you want changes, ask your buddy {name} and the landlord will upload a new version here. When everything is set, accept the contract.", { name: buddy.firstName })
                            : t("Read it carefully. If you want changes, ask for help and the landlord will upload a new version here. When everything is set, accept the contract.")}
                        </Notice>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => a.acceptContract(b.id)}>
                            <CircleCheck className="size-4" /> {t("Accept this contract")}
                          </Button>
                          <Button variant="secondary" disabled={b.helpRequested} onClick={() => a.requestHelp(b.id)}>
                            <LifeBuoy className="size-4" /> {b.helpRequested ? t("MoveIn team notified") : t("Request help")}
                          </Button>
                        </div>
                      </>
                    ) : b.countersigned ? (
                      <FileChip file={b.countersigned} label={t("Countersigned contract")} />
                    ) : (
                      <>
                        <p className="text-sm">{t("Sign the contract, then upload the signed copy here.")}</p>
                        <FileUpload label={t("Upload countersigned contract")} accept="application/pdf,image/*" onFile={(f) => a.uploadCountersigned(b.id, f)} />
                      </>
                    )}
                  </>
                )}
              </StepCard>

              <StepCard n={3} title={t("Ready to MoveIn!")} state={stage === "ready_to_move_in" ? "current" : "locked"}>
                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-emerald-50 p-4">
                  <PartyPopper className="size-8 text-emerald-600" />
                  <p className="flex-1 text-sm">
                    {t("You're all set for {date}. Join the WhatsApp group where you, your landlord and MoveIn talk.", { date: date(b.moveIn) })}
                  </p>
                  <ButtonLink href={b.whatsappGroupUrl ?? "#"} target="_blank" variant="success">
                    <MessageCircle className="size-4" /> {t("Join WhatsApp group")}
                  </ButtonLink>
                </div>
              </StepCard>
            </>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <HeartHandshake className="size-7 text-brand-600" />
            <h2 className="mt-2 font-bold">{t("Request for a buddy")}</h2>
            {buddyReq ? (
              buddy ? (
                <p className="mt-1 text-sm text-muted">
                  {t("Your buddy is {name}. They'll text you on WhatsApp.", { name: fullName(buddy) })}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted">{t("We're matching you with a local buddy. As soon as you're matched, they'll text you on WhatsApp.")}</p>
              )
            ) : (
              <>
                <p className="mt-1 text-sm text-muted">{t("Worried about any part of the booking? A local buddy guides you step by step and gives recommendations before you transfer money.")}</p>
                <Button className="mt-3 w-full" onClick={() => a.requestBuddy(b.id)}>
                  {t("Request a buddy")}
                </Button>
              </>
            )}
          </Card>
          <Card className="p-5 text-sm">
            <p className="font-bold">{t("How it works")}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted">
              <li>{t("Landlord accepts your request")}</li>
              <li>{t("You transfer reservation + deposit")}</li>
              <li>{t("Landlord confirms and uploads the contract")}</li>
              <li>{t("You accept and countersign")}</li>
              <li>{t("Join the WhatsApp group and move in")}</li>
            </ol>
            <Link href="/buddy" className="mt-3 inline-block font-semibold text-brand-700 hover:underline">
              {t("About the buddy service →")}
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{k}</dt>
      <dd className="truncate font-semibold">{v}</dd>
    </div>
  );
}
