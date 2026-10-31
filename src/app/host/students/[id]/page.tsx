"use client";

import { ArrowLeft, Check, CircleCheckBig } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Badge, Button, ButtonLink, Card, EmptyState } from "@/components/ui";
import { matchScore } from "@/lib/booking";
import { baht, cn, date, flag, fullName } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { AREAS, FACULTIES, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";

export default function StudentRequestPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const me = useMe()!;
  const req = useStore((s) => s.requests.find((r) => r.id === id));
  const student = useStore((s) => s.users.find((u) => u.id === req?.studentId));
  const listings = useStore((s) => s.listings);
  const proposals = useStore((s) => s.proposals);
  const propose = useStore((s) => s.propose);
  const [selected, setSelected] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const mine = useMemo(
    () =>
      req
        ? listings
            .filter((l) => l.landlordId === me.id && l.status === "on_market")
            .map((l) => ({ l, score: matchScore(l, req), proposed: proposals.some((p) => p.requestId === req.id && p.listingId === l.id) }))
            .sort((a, b) => b.score - a.score)
        : [],
    [listings, proposals, req, me.id],
  );

  if (!req || !student) return <EmptyState title={t("Request not found")} action={<ButtonLink href="/host/students">{t("Student list")}</ButtonLink>} />;

  if (done)
    return (
      <EmptyState image="/illustrations/handover.jpg" title={t("Successfully proposed to {name}!", { name: student.firstName })} action={<ButtonLink href="/host/students">{t("Back to student list")}</ButtonLink>}>
        {t("{name} gets an email and WhatsApp message. If they like your room, they'll send you a booking request.", { name: student.firstName })}
      </EmptyState>
    );

  const sp = student.student;
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/host/students" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> {t("Student list")}
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="h-fit p-5">
          <div className="flex items-center gap-3">
            <Avatar name={fullName(student)} className="size-12" />
            <div>
              <p className="text-lg font-bold">
                {fullName(student)} {sp && flag(sp.countryCode)}
              </p>
              <p className="text-sm text-muted">
                {sp?.homeUniversity} · {t(FACULTIES.find((f) => f.id === sp?.faculty)?.name ?? "")}
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <Row k={t("Length of stay")} v={t("{months} months", { months: req.months })} />
            <Row k={t("Move-in date")} v={date(req.moveIn)} />
            <Row k={t("Move-out (auto-generated)")} v={date(req.moveOut)} />
            <Row k={t("Preferred room type")} v={req.roomTypes.map((rt) => t(ROOM_TYPE_LABEL[rt])).join(", ")} />
            <Row k={t("People")} v={`${req.occupants}`} />
            <Row k={t("Monthly budget")} v={baht(req.budget)} />
            <Row
              k={t("Areas")}
              v={req.areaIds.length ? req.areaIds.map((a) => t(AREAS.find((x) => x.id === a)?.name ?? "")).join(", ") : t("Anywhere near campus")}
            />
            <Row k={t("Building facilities")} v={req.facilities || "—"} />
          </dl>
          {req.notes && <p className="mt-4 rounded-xl bg-brand-50 p-3 text-sm">&ldquo;{req.notes}&rdquo;</p>}
          <p className="mt-4 text-xs text-muted">{t("You'll get the student's passport after you accept a booking and proceed with the contract.")}</p>
        </Card>

        <div>
          <h2 className="text-lg font-bold">{t("Propose your room(s)")}</h2>
          <p className="mb-3 text-sm text-muted">{t("Select one or more rooms. Best fits are at the top.")}</p>
          {mine.length === 0 ? (
            <EmptyState title={t("You have no rooms on the market")} action={<ButtonLink href="/host/new">{t("Add a room")}</ButtonLink>} />
          ) : (
            <div className="space-y-3">
              {mine.map(({ l, score, proposed }) => {
                const on = selected.includes(l.id);
                return (
                  <button
                    key={l.id}
                    disabled={proposed}
                    onClick={() => setSelected(on ? selected.filter((x) => x !== l.id) : [...selected, l.id])}
                    className={cn("flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition disabled:opacity-60", on ? "border-brand-500 ring-2 ring-brand-500" : "border-line hover:border-brand-300")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.photos[0]} alt="" className="size-20 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{l.building}</span>
                      <span className="block text-xs text-muted">
                        {l.sizeSqm} m² · {t(ROOM_TYPE_LABEL[l.roomType])} · {t("Available {date}", { date: date(l.availableFrom, "d MMM yyyy") })}
                      </span>
                      <span className="mt-1 block text-sm font-bold text-brand-600">{baht(l.rent)}</span>
                    </span>
                    {proposed ? (
                      <Badge tone="gray">{t("Proposed")}</Badge>
                    ) : (
                      <span className="flex flex-col items-end gap-2">
                        <Badge tone={score >= 70 ? "brand" : "gray"}>{t("{score}% fit", { score })}</Badge>
                        <span className={cn("grid size-6 place-items-center rounded-md border-2", on ? "border-brand-600 bg-brand-600 text-white" : "border-line")}>{on && <Check className="size-4" />}</span>
                      </span>
                    )}
                  </button>
                );
              })}
              <Button
                size="lg"
                className="w-full"
                disabled={selected.length === 0}
                onClick={() => {
                  propose(req.id, selected);
                  setDone(true);
                }}
              >
                <CircleCheckBig className="size-4" />{" "}
                {selected.length > 1
                  ? t("Propose {count} rooms to {name}", { count: selected.length, name: student.firstName })
                  : t("Propose my room to {name}", { name: student.firstName })}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}
