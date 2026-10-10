"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { DemoBanner } from "@/components/app-shell";
import { Hydrated } from "@/components/hydrated";
import { Button, Card, Field, Input, Logo, Progress, Select } from "@/components/ui";
import { safeNext } from "@/lib/format";
import { COUNTRIES, FACULTIES } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { StudentProfile } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh">
      <DemoBanner />
      <div className="mx-auto max-w-xl px-4 py-10">
        <Link href="/" className="flex justify-center">
          <Logo size="lg" />
        </Link>
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
      if (!f.firstName.trim()) e.firstName = "Required";
      if (!f.lastName.trim()) e.lastName = "Required";
      if (!EMAIL.test(f.email)) e.email = "Enter a valid email";
      if (f.whatsapp.replace(/\D/g, "").length < 8) e.whatsapp = "Include your country code, e.g. +45 20 12 34 56";
    } else {
      if (!f.gender) e.gender = "Required";
      const age = Number(f.age);
      if (!age || age < 16 || age > 80) e.age = "Enter your age";
      if (!f.country) e.country = "Required";
      if (!f.homeUniversity.trim()) e.homeUniversity = "Required";
      if (!f.faculty) e.faculty = "Required";
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
            <h1 className="text-xl font-bold">Create your account</h1>
            <p className="text-sm text-muted">WhatsApp is our main channel with you, your buddy and your landlord.</p>
          </div>
          <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-semibold text-muted" title="Available once Supabase Auth is connected">
            <span className="font-bold text-[#4285F4]">G</span> Continue with Google <span className="text-xs">(coming with launch)</span>
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.firstName}>
              {(id) => <Input id={id} autoComplete="given-name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />}
            </Field>
            <Field label="Last name" error={errors.lastName}>
              {(id) => <Input id={id} autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />}
            </Field>
          </div>
          <Field label="Email" error={errors.email}>
            {(id) => <Input id={id} type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />}
          </Field>
          <Field label="WhatsApp number" error={errors.whatsapp}>
            {(id) => <Input id={id} type="tel" autoComplete="tel" placeholder="+45 20 12 34 56" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />}
          </Field>
          <Button size="lg" className="w-full" onClick={() => validate(0) && setStep(1)}>
            Next
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">A little about you</h1>
            <p className="text-sm text-muted">This helps us recommend areas near your faculty and match you with the right buddy.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender" error={errors.gender}>
              {(id) => (
                <Select id={id} value={f.gender} onChange={(e) => set("gender", e.target.value as StudentProfile["gender"])}>
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not">Prefer not to say</option>
                </Select>
              )}
            </Field>
            <Field label="Age" error={errors.age}>
              {(id) => <Input id={id} type="number" inputMode="numeric" value={f.age} onChange={(e) => set("age", e.target.value)} />}
            </Field>
          </div>
          <Field label="Where are you from?" error={errors.country}>
            {(id) => (
              <Select id={id} value={f.country} onChange={(e) => set("country", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code}>{c.name}</option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Home university" error={errors.homeUniversity}>
            {(id) => <Input id={id} value={f.homeUniversity} onChange={(e) => set("homeUniversity", e.target.value)} />}
          </Field>
          <Field label="Which faculty are you joining at Chula?" error={errors.faculty}>
            {(id) => (
              <Select id={id} value={f.faculty} onChange={(e) => set("faculty", e.target.value)}>
                <option value="">Select faculty</option>
                {FACULTIES.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-line p-3 text-sm">
            <input type="checkbox" checked={f.notifications} onChange={(e) => set("notifications", e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
            <span>
              <span className="block font-semibold">Allow notifications</span>
              <span className="text-muted">Get an email and WhatsApp message whenever a landlord proposes a room for you.</span>
            </span>
          </label>
          <div className="flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button size="lg" className="flex-1" onClick={finish}>
              Create account
            </Button>
          </div>
          <p className="text-center text-xs text-muted">By continuing you agree to MoveIn&apos;s terms and privacy policy.</p>
        </div>
      )}
    </Card>
  );
}
