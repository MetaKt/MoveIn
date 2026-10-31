"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { DemoBanner } from "@/components/app-shell";
import { Hydrated } from "@/components/hydrated";
import { LanguageSwitch } from "@/components/language-switch";
import { Button, Card, Field, Input, Logo, Progress, Select } from "@/components/ui";
import { safeNext } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { COUNTRIES, FACULTIES } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { StudentProfile } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh">
      <DemoBanner />
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <Logo size="lg" />
          </Link>
          <LanguageSwitch />
        </div>
        <Suspense>
          <Hydrated>
            <Onboarding />
          </Hydrated>
        </Suspense>
      </div>
    </div>
  );
}

function Onboarding() {
  const t = useT();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const register = useStore((s) => s.registerStudent);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
    gender: "" as StudentProfile["gender"] | "",
    age: "",
    country: "",
    homeUniversity: "",
    faculty: "",
    notifications: true,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!f.firstName.trim()) e.firstName = t("Required");
      if (!f.lastName.trim()) e.lastName = t("Required");
      if (!EMAIL.test(f.email)) e.email = t("Enter a valid email");
      if (f.whatsapp.replace(/\D/g, "").length < 8) e.whatsapp = t("Include your country code, e.g. +45 20 12 34 56");
    } else {
      if (!f.gender) e.gender = t("Required");
      const age = Number(f.age);
      if (!age || age < 16 || age > 80) e.age = t("Enter your age");
      if (!f.country) e.country = t("Required");
      if (!f.homeUniversity.trim()) e.homeUniversity = t("Required");
      if (!f.faculty) e.faculty = t("Required");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finish = () => {
    if (!validate(1)) return;
    const c = COUNTRIES.find((x) => x.name === f.country)!;
    register(
      { firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim(), whatsapp: f.whatsapp.trim() },
      {
        gender: f.gender as StudentProfile["gender"],
        age: Number(f.age),
        country: c.name,
        countryCode: c.code,
        homeUniversity: f.homeUniversity.trim(),
        faculty: f.faculty,
        notifications: f.notifications,
      },
    );
    router.push(safeNext(next, "/explore"));
  };

  return (
    <Card className="mt-8 p-6">
      <Progress total={2} current={step} />
      {step === 0 ? (
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{t("Create your account")}</h1>
            <p className="text-sm text-muted">{t("WhatsApp is our main channel with you, your buddy and your landlord.")}</p>
          </div>
          <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-semibold text-muted" title={t("Available once Supabase Auth is connected")}>
            <span className="font-bold text-[#4285F4]">G</span> {t("Continue with Google")} <span className="text-xs">{t("(coming with launch)")}</span>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("First name")} error={errors.firstName}>
              {(id) => <Input id={id} autoComplete="given-name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />}
            </Field>
            <Field label={t("Last name")} error={errors.lastName}>
              {(id) => <Input id={id} autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />}
            </Field>
          </div>
          <Field label={t("Email")} error={errors.email}>
            {(id) => <Input id={id} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
          <Field label={t("WhatsApp number")} error={errors.whatsapp}>
            {(id) => <Input id={id} type="tel" autoComplete="tel" placeholder="+45 20 12 34 56" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />}
          </Field>
          <Button size="lg" className="w-full" onClick={() => validate(0) && setStep(1)}>
            {t("Next")}
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{t("A little about you")}</h1>
            <p className="text-sm text-muted">{t("This helps us recommend areas near your faculty and match you with the right buddy.")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Gender")} error={errors.gender}>
              {(id) => (
                <Select id={id} value={f.gender} onChange={(e) => set("gender", e.target.value as StudentProfile["gender"])}>
                  <option value="">{t("Select")}</option>
                  <option value="female">{t("Female")}</option>
                  <option value="male">{t("Male")}</option>
                  <option value="non-binary">{t("Non-binary")}</option>
                  <option value="prefer-not">{t("Prefer not to say")}</option>
                </Select>
              )}
            </Field>
            <Field label={t("Age")} error={errors.age}>
              {(id) => <Input id={id} type="number" inputMode="numeric" value={f.age} onChange={(e) => set("age", e.target.value)} />}
            </Field>
          </div>
          <Field label={t("Where are you from?")} error={errors.country}>
            {(id) => (
              <Select id={id} value={f.country} onChange={(e) => set("country", e.target.value)}>
                <option value="">{t("Select country")}</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {t(c.name)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t("Home university")} error={errors.homeUniversity}>
            {(id) => <Input id={id} value={f.homeUniversity} onChange={(e) => set("homeUniversity", e.target.value)} />}
          </Field>
          <Field label={t("Which faculty are you joining at Chula?")} error={errors.faculty}>
            {(id) => (
              <Select id={id} value={f.faculty} onChange={(e) => set("faculty", e.target.value)}>
                <option value="">{t("Select faculty")}</option>
                {FACULTIES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {t(x.name)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm">
            <input type="checkbox" checked={f.notifications} onChange={(e) => set("notifications", e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
            <span>
              <span className="block font-semibold">{t("Allow notifications")}</span>
              <span className="text-muted">{t("Get an email and WhatsApp message whenever a landlord proposes a room for you.")}</span>
            </span>
          </label>
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
              {t("Back")}
            </Button>
            <Button size="lg" className="flex-1" onClick={finish}>
              {t("Create account")}
            </Button>
          </div>
          <p className="text-center text-xs text-muted">{t("By continuing you agree to MoveIn's terms and privacy policy.")}</p>
        </div>
      )}
    </Card>
  );
}
