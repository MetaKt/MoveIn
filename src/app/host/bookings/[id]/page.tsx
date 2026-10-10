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
import { AREAS, FACULTIES } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";
import type { BankDetails, Booking } from "@/lib/types";

export default function HostBookingPage() {
  const { id } = useParams<{ id: string }>();
  const me = useMe()!;
  const b = useStore((s) => s.bookings.find((x) => x.id === id));
  const listing = useStore((s) => s.listings.find((l) => l.id === b?.listingId));
  const student = useStore((s) => s.users.find((u) => u.id === b?.studentId));
  const request = useStore((s) => s.requests.find((r) => r.studentId === b?.studentId && r.status === "open"));
  const a = useStore();

  if (!b || !listing || !student || b.landlordId !== me.id) return <EmptyState title="Booking not found" action={<ButtonLink href="/host/bookings">Bookings</ButtonLink>} />;

  const stage = bookingStage(b);
  const step = bookingStep(stage);
  const stopped = stage === "declined" || stage === "cancelled";
  const st = (n: number) => (step > n ? "done" : step === n ? "current" : "locked") as "done" | "current" | "locked";
  const sp = student.student;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/host/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> Bookings
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">
          {student.firstName} {stage === "awaiting_landlord" ? "has requested to book your room" : `· ${listing.building}`}
        </h1>
        <StatusPill tone={stage === "ready_to_move_in" ? "done" : stopped ? "stopped" : "waiting"}>{STAGE_COPY[stage].landlord}</StatusPill>
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
                  {sp?.age} · {sp?.homeUniversity} · {FACULTIES.find((f) => f.id === sp?.faculty)?.name}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <Item k="Room" v={listing.building} />
              <Item k="Move-in" v={date(b.moveIn, "d MMM yyyy")} />
              <Item k="Move-out (auto)" v={date(moveOutDate(b.moveIn, b.months), "d MMM yyyy")} />
              <Item k="Length of stay" v={`${b.months} months`} />
              <Item k="Guests" v={`${b.guests}`} />
              {request && <Item k="Budget" v={baht(request.budget)} />}
              {request && <Item k="Preferred areas" v={request.areaIds.map((x) => AREAS.find((a) => a.id === x)?.name).join(", ") || "Any"} />}
            </dl>
            {b.note && <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm">&ldquo;{b.note}&rdquo;</p>}
            {request?.notes && <p className="mt-2 text-sm text-muted">About them: {request.notes}</p>}
          </Card>

          {b.tourVideoRequested && !stopped && (
            <Card className="flex flex-wrap items-center gap-3 p-4">
              <p className="flex-1 text-sm">
                <strong>{student.firstName} requested a room tour video.</strong> A short phone walkthrough is fine.
              </p>
              {b.tourVideo ? <FileChip file={b.tourVideo} label="Video uploaded" /> : <FileUpload compact label="Attach video" accept="video/*" onFile={(f) => a.uploadTourVideo(b.id, f)} />}
            </Card>
          )}

          {stage === "awaiting_landlord" && <AcceptPanel b={b} studentName={student.firstName} />}

          {stopped && <Notice>{STAGE_COPY[stage].landlord}.</Notice>}

          {!stopped && step > 0 && (
            <>
              {b.passport && (
                <Card className="flex flex-wrap items-center gap-3 p-4">
                  <p className="flex-1 text-sm">
                    <strong>{student.firstName}&apos;s passport</strong> · attach it to your rental contract.
                  </p>
                  <FileChip file={b.passport} label="Passport" />
                </Card>
              )}

              <StepCard n={1} title="Provide your bank account" state={st(1)}>
                {!b.bank ? (
                  <BankForm defaultTotal={totalDue(listing)} onSubmit={(bank, total) => a.setBankDetails(b.id, bank, total)} />
                ) : (
                  <>
                    <p className="text-sm">
                      {student.firstName} will transfer <strong>{baht(b.totalPayment ?? 0)}</strong> internationally to <strong>{b.bank.bank}</strong> · {b.bank.accountNumber}.
                    </p>
                    {b.slip ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <FileChip file={b.slip} label="Transaction slip" />
                        {b.paymentReceived ? (
                          <StatusPill tone="done">Received</StatusPill>
                        ) : (
                          <Button variant="success" onClick={() => confirm("Confirm the money has arrived in your account?") && a.confirmPayment(b.id)}>
                            <CircleCheck className="size-4" /> Received
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">{student.firstName} will upload the transaction slip here. Once you receive the money, click Received.</p>
                    )}
                  </>
                )}
              </StepCard>

              <StepCard n={2} title="Upload your rental contract" state={st(2)}>
                <Notice>
                  Sign the contract before you upload it. The student may ask for changes; upload the new version here as often as needed. Students only see the latest version.
                </Notice>
                {b.contracts.length > 0 && (
                  <div className="space-y-2">
                    {[...b.contracts].reverse().map((c) => (
                      <FileChip key={c.version} file={c} label={`Version ${c.version}${c.version === b.contracts.length ? " (latest)" : ""}`} />
                    ))}
                  </div>
                )}
                {!b.countersigned && (
                  <div className="flex flex-wrap items-center gap-3">
                    <FileUpload compact label={b.contracts.length ? "Upload new version" : "Upload contract"} accept="application/pdf,image/*" onFile={(f) => a.uploadContract(b.id, f)} />
                    {b.studentAccepted && <StatusPill tone="done">{student.firstName} accepted the contract</StatusPill>}
                  </div>
                )}
                {b.countersigned && <FileChip file={b.countersigned} label="Countersigned contract from the student" />}
                <div className="rounded-xl border border-dashed border-line p-4 text-sm">
                  <p className="flex items-center gap-2 font-semibold">
                    <Users className="size-4 text-brand-600" /> Need help drafting a contract?
                  </p>
                  <p className="mt-1 text-muted">MoveIn&apos;s contract team drafts it with you and tells you if the student wants clauses changed.</p>
                  <Button variant="secondary" size="sm" className="mt-3" disabled={b.contractTeamRequested} onClick={() => a.requestContractTeam(b.id)}>
                    {b.contractTeamRequested ? "Contract team requested" : "Request a contract team"}
                  </Button>
                </div>
              </StepCard>

              <StepCard n={3} title={`Ready to welcome ${student.firstName}`} state={stage === "ready_to_move_in" ? "current" : "locked"}>
                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-emerald-50 p-4">
                  <p className="flex-1 text-sm">Join the WhatsApp group where you, the student and MoveIn communicate.</p>
                  <ButtonLink href={b.whatsappGroupUrl ?? "#"} target="_blank" variant="success">
                    <MessageCircle className="size-4" /> Join
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
              <p className="text-muted">{baht(listing.rent)} monthly rent</p>
              <Link href={`/host/rooms/${listing.id}`} className="mt-2 inline-block font-semibold text-brand-700 hover:underline">
                Edit room details →
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function AcceptPanel({ b, studentName }: { b: Booking; studentName: string }) {
  const a = useStore();
  return (
    <Card className="space-y-4 border-brand-300 p-5">
      <div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <ShieldAlert className="size-5 shrink-0" />
        <div>
          <p className="font-semibold">For your information</p>
          <p>Before the student pays, your registered Thai ID card is shown to them so they can verify you&apos;re a legitimate person and not a scam.</p>
          <label className="mt-2 flex items-center gap-2 font-medium">
            <input type="checkbox" checked={b.landlordAcknowledgedId} onChange={() => a.acknowledgeLandlordId(b.id)} disabled={b.landlordAcknowledgedId} className="size-4 accent-brand-600" />
            I am aware and accept it
          </label>
        </div>
      </div>
      <p className="text-sm text-muted">You&apos;ll get {studentName}&apos;s passport after you accept the booking and proceed with the contract.</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={!b.landlordAcknowledgedId} onClick={() => a.acceptBooking(b.id)}>
          Accept booking &amp; proceed with contract
        </Button>
        <Button variant="danger" onClick={() => confirm(`Decline ${studentName}'s request?`) && a.declineBooking(b.id)}>
          Decline
        </Button>
      </div>
    </Card>
  );
}

function BankForm({ defaultTotal, onSubmit }: { defaultTotal: number; onSubmit: (b: BankDetails, total: number) => void }) {
  const [f, setF] = useState<BankDetails>({ bank: "", swift: "", accountName: "", accountNumber: "", bankAddress: "", recipientAddress: "" });
  const [total, setTotal] = useState(defaultTotal);
  const [err, setErr] = useState("");
  const fields: [keyof BankDetails, string][] = [
    ["bank", "Bank"],
    ["swift", "SWIFT"],
    ["accountName", "Account name"],
    ["accountNumber", "Account number"],
    ["bankAddress", "Bank address"],
    ["recipientAddress", "Recipient address"],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <Field key={k} label={label}>
            {(id) => <Input id={id} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </Field>
        ))}
      </div>
      <Field label="Total payment (฿)" hint="Reservation (first month) + security deposit">
        {(id) => <Input id={id} type="number" min={0} value={total} onChange={(e) => setTotal(Number(e.target.value))} />}
      </Field>
      {err && <p className="text-sm font-medium text-red-600">{err}</p>}
      <Button
        onClick={() => {
          if (fields.some(([k]) => !f[k].trim()) || total <= 0) return setErr("Please fill in every field.");
          if (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(f.swift.trim())) return setErr("SWIFT codes are 8 or 11 letters/numbers, e.g. KASITHBK.");
          onSubmit({ ...f, swift: f.swift.trim().toUpperCase() }, total);
        }}
      >
        Done
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
