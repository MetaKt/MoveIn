"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, Card, Chip, EmptyState, Field, Input, Notice, PageHeader, Stepper, Textarea } from "@/components/ui";
import { moveOutDate } from "@/lib/booking";
import { baht, date } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { AREAS, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";
import type { RoomType } from "@/lib/types";

export default function FindMyRoomPage() {
  const t = useT();
  const me = useMe();
  const existing = useStore((s) => s.requests.find((r) => r.studentId === me?.id && r.status === "open"));
  const save = useStore((s) => s.saveRequest);
  const router = useRouter();

  const [months, setMonths] = useState(existing?.months ?? 5);
  const [moveIn, setMoveIn] = useState(existing?.moveIn ?? "2027-01-05");
  const [types, setTypes] = useState<RoomType[]>(existing?.roomTypes ?? []);
  const [budget, setBudget] = useState(existing?.budget ?? 18000);
  const [areas, setAreas] = useState<string[]>(existing?.areaIds ?? []);
  const [facilities, setFacilities] = useState(existing?.facilities ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [occupants, setOccupants] = useState(existing?.occupants ?? 1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!me || me.role !== "student")
    return (
      <EmptyState image="/illustrations/study.png" title={t("Let us find your room")} action={<ButtonLink href="/signin?next=/find-my-room">{t("Sign in to start")}</ButtonLink>}>
        {t("Tell us what you're looking for and our partner landlords will propose rooms to you.")}
      </EmptyState>
    );

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!moveIn) e.moveIn = t("Choose a move-in date.");
    if (types.length === 0) e.types = t("Pick at least one room type.");
    if (!budget || budget < 3000) e.budget = t("Enter a monthly budget in Baht.");
    setErrors(e);
    if (Object.keys(e).length) return;
    save({ months, moveIn, roomTypes: types, budget, areaIds: areas, facilities: facilities.trim(), notes: notes.trim(), occupants });
    router.push("/rooms?tab=match");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow={t("Let us find your room")}
        title={existing ? t("Edit your room preferences") : t("Tell us what you're looking for")}
        subtitle={t("Our partner landlords see your preferences and propose rooms. Matching takes a little time; we'll email and WhatsApp you for every room we find.")}
      />
      <Card className="space-y-6 p-5 sm:p-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Stepper label={t("1. How long do you intend to stay? (months)")} value={months} onChange={setMonths} min={1} max={12} />
          </div>
          <Field label={t("2. Move-in date")} error={errors.moveIn}>
            {(id) => <Input id={id} type="date" value={moveIn} onChange={(e) => setMoveIn(e.target.value)} />}
          </Field>
          <Field label={t("Move-out date (auto-generated)")}>{(id) => <Input id={id} disabled value={moveIn ? date(moveOutDate(moveIn, months)) : "—"} />}</Field>
        </section>

        <section>
          <p className="mb-2 text-sm font-medium">{t("3. What is your preferred room type? (choose any)")}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROOM_TYPE_LABEL) as RoomType[]).map((rt) => (
              <Chip key={rt} selected={types.includes(rt)} onClick={() => setTypes(toggle(types, rt))}>
                {t(ROOM_TYPE_LABEL[rt])}
              </Chip>
            ))}
          </div>
          {errors.types && <p className="mt-1 text-xs font-medium text-red-600">{errors.types}</p>}
          <div className="mt-3 max-w-xs">
            <Stepper label={t("People moving in together")} value={occupants} onChange={setOccupants} min={1} max={4} />
          </div>
        </section>

        <Field label={t("4. What is your monthly budget for accommodation? (THB)")} error={errors.budget} hint={budget ? t("{price} per month", { price: baht(budget) }) : undefined}>
          {(id) => <Input id={id} type="number" inputMode="numeric" min={0} step={500} value={budget || ""} onChange={(e) => setBudget(Number(e.target.value))} />}
        </Field>

        <section>
          <p className="mb-2 text-sm font-medium">{t("5. Which areas would you like to live in? (choose any)")}</p>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => (
              <Chip key={a.id} selected={areas.includes(a.id)} onClick={() => setAreas(toggle(areas, a.id))}>
                {t(a.name)}
              </Chip>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">{t("Leave empty if you're open to anywhere near campus.")}</p>
        </section>

        <Field label={t("6. What building facilities do you especially need?")}>
          {(id) => <Input id={id} value={facilities} onChange={(e) => setFacilities(e.target.value)} placeholder={t("e.g. gym, pool, co-working space")} />}
        </Field>
        <Field label={t("7. Anything else we should consider?")}>
          {(id) => <Textarea id={id} value={notes} maxLength={500} onChange={(e) => setNotes(e.target.value)} placeholder={t("Tell landlords a little about yourself")} />}
        </Field>

        <Notice>{t("For personalised rooms it takes us some time to match. For each room we find, you'll get an email and a WhatsApp message.")}</Notice>
        <Button size="lg" className="w-full" onClick={submit}>
          {existing ? t("Save preferences") : t("Request rooms")}
        </Button>
      </Card>
    </div>
  );
}
