"use client";

import { ArrowLeft, CircleCheck, MessageCircle, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { StatusPill, StepCard } from "@/components/booking-steps";
import { FileChip, FileUpload } from "@/components/file-upload";
import { Avatar, Button, ButtonLink, Card, EmptyState, Field, Input, Notice } from "@/components/ui";
import { bookingStage, bookingStep, moveOutDate, STAGE_COPY, totalDue } from "@/lib/booking";
import { baht, date, flag, fullName } from "@/lib/format";
import { msg, useT } from "@/lib/i18n";
import { AREAS, FACULTIES } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";
import type { BankDetails, Booking } from "@/lib/types";

export default function HostBookingPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const me = useMe()!;
  const b = useStore((s) => s.bookings.find((x) => x.id === id));
  const listing = useStore((s) => s.listings.find((l) => l.id === b?.listingId));
  const student = useStore((s) => s.users.find((u) => u.id === b?.studentId));
  const request = useStore((s) => s.requests.find((r) => r.studentId === b?.studentId && r.status === "open"));
  const a = useStore();

  if (!b || !listing || !student || b.landlordId !== me.id) return <EmptyState title={t("Booking not found")} action={<ButtonLink href="/host/bookings">{t("Bookings")}</ButtonLink>} />;

  const stage = bookingStage(b);
  const step = bookingStep(stage);
  const stopped = stage === "declined" || stage === "cancelled";
  const st = (n: number) => (step > n ? "done" : step === n ? "current" : "locked") as "done" | "current" | "locked";
  const sp = student.student;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/host/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> {t("Bookings")}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {stage === "awaiting_landlord" ? t("{name} has requested to book your room", { name: student.firstName }) : `${student.firstName} · ${listing.building}`}
        </h1>
        <StatusPill tone={stage === "ready_to_move_in" ? "done" : stopped ? "stopped" : "waiting"}>{t(STAGE_COPY[stage].landlord)}</StatusPill>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={fullName(student)} className="size-12" />
              <div>
                <p className="font-bold">
                  {fullName(student)} {sp && flag(sp.countryCode)}
                </p>
                <p className="text-sm text-muted">
                  {sp?.age} · {sp?.homeUniversity} · {t(FACULTIES.find((f) => f.id === sp?.faculty)?.name ?? "")}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <Item k={t("Room")} v={listing.building} />
              <Item k={t("Move-in")} v={date(b.moveIn, "d MMM yyyy")} />
              <Item k={t("Move-out (auto)")} v={date(moveOutDate(b.moveIn, b.months), "d MMM yyyy")} />
              <Item k={t("Length of stay")} v={t("{months} months", { months: b.months })} />
              <Item k={t("Guests")} v={`${b.guests}`} />
              {request && <Item k={t("Budget")} v={baht(request.budget)} />}
              {request && <Item k={t("Preferred areas")} v={request.areaIds.map((x) => t(AREAS.find((a) => a.id === x)?.name ?? "")).join(", ") || t("Any")} />}
            </dl>
            {b.note && <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm">&ldquo;{b.note}&rdquo;</p>}
            {request?.notes && <p className="mt-2 text-sm text-muted">{t("About them:")} {request.notes}</p>}
          </Card>

          {b.tourVideoRequested && !stopped && (
            <Card className="flex flex-wrap items-center gap-3 p-4">
              <p className="flex-1 text-sm">
                <strong>{t("{name} requested a room tour video.", { name: student.firstName })}</strong> {t("A short phone walkthrough is fine.")}
              </p>
              {b.tourVideo ? <FileChip file={b.tourVideo} label={t("Video uploaded")} /> : <FileUpload compact label={t("Attach video")} accept="video/*" onFile={(f) => a.uploadTourVideo(b.id, f)} />}
            </Card>
          )}

          {stage === "awaiting_landlord" && <AcceptPanel b={b} studentName={student.firstName} />}

          {stopped && <Notice>{t(STAGE_COPY[stage].landlord)}</Notice>}

          {!stopped && step > 0 && (
            <>
              {b.passport && (
                <Card className="flex flex-wrap items-center gap-3 p-4">
                  <p className="flex-1 text-sm">
                    <strong>{t("{name}'s passport", { name: student.firstName })}</strong> · {t("attach it to your rental contract.")}
                  </p>
                  <FileChip file={b.passport} label={t("Passport")} />
                </Card>
              )}

              <StepCard n={1} title={t("Provide your bank account")} state={st(1)}>
                {!b.bank ? (
                  <BankForm defaultTotal={totalDue(listing)} onSubmit={(bank, total) => a.setBankDetails(b.id, bank, total)} />
                ) : (
                  <>
                    <p className="text-sm">
                      {t("{name} will transfer {amount} internationally to {bank} · {account}.", {
                        name: student.firstName,
                        amount: baht(b.totalPayment ?? 0),
                        bank: b.bank.bank,
                        account: b.bank.accountNumber,
                      })}
                    </p>
                    {b.slip ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <FileChip file={b.slip} label={t("Transaction slip")} />
                        {b.paymentReceived ? (
                          <StatusPill tone="done">{t("Received")}</StatusPill>
                        ) : (
                          <Button variant="success" onClick={() => confirm(t("Confirm the money has arrived in your account?")) && a.confirmPayment(b.id)}>
                            <CircleCheck className="size-4" /> {t("Received")}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">{t("{name} will upload the transaction slip here. Once you receive the money, click Received.", { name: student.firstName })}</p>
                    )}
                  </>
                )}
              </StepCard>

              <StepCard n={2} title={t("Upload your rental contract")} state={st(2)}>
                <Notice>
                  {t("Sign the contract before you upload it. The student may ask for changes; upload the new version here as often as needed. Students only see the latest version.")}
                </Notice>
                {b.contracts.length > 0 && (
                  <div className="space-y-2">
                    {[...b.contracts].reverse().map((c) => (
                      <FileChip key={c.version} file={c} label={c.version === b.contracts.length ? t("Version {version} (latest)", { version: c.version }) : t("Version {version}", { version: c.version })} />
                    ))}
                  </div>
                )}
                {!b.countersigned && (
                  <div className="flex flex-wrap items-center gap-3">
                    <FileUpload compact label={b.contracts.length ? t("Upload new version") : t("Upload contract")} accept="application/pdf,image/*" onFile={(f) => a.uploadContract(b.id, f)} />
                    {b.studentAccepted && <StatusPill tone="done">{t("{name} accepted the contract", { name: student.firstName })}</StatusPill>}
                  </div>
                )}
                {b.countersigned && <FileChip file={b.countersigned} label={t("Countersigned contract from the student")} />}
                <div className="rounded-xl border border-dashed border-line p-4 text-sm">
                  <p className="flex items-center gap-2 font-semibold">
                    <Users className="size-4 text-brand-600" /> {t("Need help drafting a contract?")}
                  </p>
                  <p className="mt-1 text-muted">{t("MoveIn's contract team drafts it with you and tells you if the student wants clauses changed.")}</p>
                  <Button variant="secondary" size="sm" className="mt-3" disabled={b.contractTeamRequested} onClick={() => a.requestContractTeam(b.id)}>
                    {b.contractTeamRequested ? t("Contract team requested") : t("Request a contract team")}
                  </Button>
                </div>
              </StepCard>

              <StepCard n={3} title={t("Ready to welcome {name}", { name: student.firstName })} state={stage === "ready_to_move_in" ? "current" : "locked"}>
                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-emerald-50 p-4">
                  <p className="flex-1 text-sm">{t("Join the WhatsApp group where you, the student and MoveIn communicate.")}</p>
                  <ButtonLink href={b.whatsappGroupUrl ?? "#"} target="_blank" variant="success">
                    <MessageCircle className="size-4" /> {t("Join")}
                  </ButtonLink>
                </div>
              </StepCard>
            </>
          )}
        </div>

        <aside>
          <Card className="overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.photos[0]} alt="" className="aspect-video w-full object-cover" />
            <div className="p-4 text-sm">
              <p className="font-bold">{listing.building}</p>
              <p className="text-muted">{t("{price} monthly rent", { price: baht(listing.rent) })}</p>
              <Link href={`/host/rooms/${listing.id}`} className="mt-2 inline-block font-semibold text-brand-700 hover:underline">
                {t("Edit room details →")}
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function AcceptPanel({ b, studentName }: { b: Booking; studentName: string }) {
  const t = useT();
  const a = useStore();
  return (
    <Card className="space-y-4 border-brand-300 p-5">
      <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="size-5 shrink-0" />
        <div>
          <p className="font-semibold">{t("For your information")}</p>
          <p>{t("Before the student pays, your registered Thai ID card is shown to them so they can verify you're a legitimate person and not a scam.")}</p>
          <label className="mt-2 flex items-center gap-2 font-medium">
            <input type="checkbox" checked={b.landlordAcknowledgedId} onChange={() => a.acknowledgeLandlordId(b.id)} disabled={b.landlordAcknowledgedId} className="size-4 accent-brand-600" />
            {t("I am aware and accept it")}
          </label>
        </div>
      </div>
      <p className="text-sm text-muted">{t("You'll get {name}'s passport after you accept the booking and proceed with the contract.", { name: studentName })}</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!b.landlordAcknowledgedId} onClick={() => a.acceptBooking(b.id)}>
          {t("Accept booking & proceed with contract")}
        </Button>
        <Button variant="danger" onClick={() => confirm(t("Decline {name}'s request?", { name: studentName })) && a.declineBooking(b.id)}>
          {t("Decline")}
        </Button>
      </div>
    </Card>
  );
}

function BankForm({ defaultTotal, onSubmit }: { defaultTotal: number; onSubmit: (b: BankDetails, total: number) => void }) {
  const t = useT();
  const [f, setF] = useState<BankDetails>({ bank: "", swift: "", accountName: "", accountNumber: "", bankAddress: "", recipientAddress: "" });
  const [total, setTotal] = useState(defaultTotal);
  const [err, setErr] = useState("");
  const fields: [keyof BankDetails, string][] = [
    ["bank", msg("Bank")],
    ["swift", msg("SWIFT")],
    ["accountName", msg("Account name")],
    ["accountNumber", msg("Account number")],
    ["bankAddress", msg("Bank address")],
    ["recipientAddress", msg("Recipient address")],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <Field key={k} label={t(label)}>
            {(id) => <Input id={id} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </Field>
        ))}
      </div>
      <Field label={t("Total payment (฿)")} hint={t("Reservation (first month) + security deposit")}>
        {(id) => <Input id={id} type="number" min={0} value={total} onChange={(e) => setTotal(Number(e.target.value))} />}
      </Field>
      {err && <p className="text-sm font-medium text-red-600">{err}</p>}
      <Button
        onClick={() => {
          if (fields.some(([k]) => !f[k].trim()) || total <= 0) return setErr(t("Please fill in every field."));
          if (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(f.swift.trim())) return setErr(t("SWIFT codes are 8 or 11 letters/numbers, e.g. KASITHBK."));
          onSubmit({ ...f, swift: f.swift.trim().toUpperCase() }, total);
        }}
      >
        {t("Done")}
      </Button>
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
