"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DemoBanner } from "@/components/app-shell";
import { Hydrated } from "@/components/hydrated";
import { Button, ButtonLink, Card, ChoiceTile, Field, Input, Logo, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/format";
import { FOUND_VIA } from "@/lib/reference";
import { useStore } from "@/lib/store";

const SCREENS = ["intro", "before", "arrival", "limits", "step2", "info", "contact", "step3", "whyMoveIn", "whyBuddy", "found"] as const;
const PART: Record<(typeof SCREENS)[number], number> = { intro: 0, before: 0, arrival: 0, limits: 0, step2: 1, info: 1, contact: 1, step3: 2, whyMoveIn: 2, whyBuddy: 2, found: 2 };

export default function BecomeBuddyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <header className="flex justify-center py-6">
        <Link href="/">
          <Logo size="lg" />
        </Link>
      </header>
      <Hydrated>
        <BuddyApplication />
      </Hydrated>
    </div>
  );
}

function BuddyApplication() {
  const submit = useStore((s) => s.submitApplication);
  const [i, setI] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [f, setF] = useState({
    firstName: "",
    lastName: "",
    university: "Chulalongkorn University",
    faculty: "",
    year: 1,
    email: "",
    phone: "",
    otherChannel: "LINE",
    otherId: "",
    whatsapp: "",
    whyMoveIn: "",
    whyBuddy: "",
    foundVia: "",
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setError("");
  };
  const screen = SCREENS[i];

  const check = () => {
    if (screen === "info" && (!f.firstName.trim() || !f.lastName.trim() || !f.faculty.trim())) return "Please fill in your name and faculty.";
    if (screen === "contact" && (!/^\S+@\S+\.\S+$/.test(f.email) || f.whatsapp.replace(/\D/g, "").length < 8)) return "Add a valid email and your WhatsApp number.";
    if (screen === "whyMoveIn" && f.whyMoveIn.trim().length < 10) return "Tell us a little more.";
    if (screen === "whyBuddy" && f.whyBuddy.trim().length < 10) return "Tell us a little more.";
    if (screen === "found" && !f.foundVia) return "Pick one option.";
    return "";
  };
  const next = () => {
    const e = check();
    if (e) return setError(e);
    if (i < SCREENS.length - 1) return setI(i + 1);
    submit({ ...f, phone: f.phone || f.whatsapp });
    setSent(true);
  };

  if (sent)
    return (
      <main className="mx-auto max-w-xl flex-1 px-4 py-16 text-center">
        <h1 className="text-3xl font-bold">
          Thank you so much <span className="block text-brand-600">for applying to join our team!</span>
        </h1>
        <p className="mt-4 text-muted">We&apos;re excited to get to know you! Our team will review your application and reach out to selected candidates via WhatsApp or email. Please keep an eye on your messages!</p>
        <ButtonLink href="/" className="mt-8">
          Back to MoveIn
        </ButtonLink>
      </main>
    );

  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-8">
        {screen === "intro" && (
          <Split step="Step 1" title={<>Become a <Hl>Buddy</Hl></>} image="/illustrations/buddies.png">
            You&apos;ll be the first point of contact for international students. You make sure their move-in is smooth, from choosing a room to arriving in Thailand. Open to Thai students only.
          </Split>
        )}
        {screen === "before" && (
          <Split title={<><Hl>Before</Hl> they arrive</>} sub="Your responsibility before they arrive" image="/illustrations/chat.png">
            <Bullets items={["Chat with students online (WhatsApp)", "Help them pick a room", "Answer questions about life in Thailand: transport, food and local tips", "Follow up until they decide", "Coordinate basic check-in details"]} />
          </Split>
        )}
        {screen === "arrival" && (
          <Split title={<>On <Hl>arrival day</Hl></>} sub="Be there in person for their first days in Thailand." image="/illustrations/arrive.jpg">
            <Bullets items={["Welcome and assist the student", "Bring the contract for them to sign", "Stay a friendly local contact in their first days", "Feel free to make friends and chat after they arrive"]} />
          </Split>
        )}
        {screen === "limits" && (
          <div>
            <h1 className="text-3xl font-bold">
              Know your <Hl>limits</Hl>
            </h1>
            <p className="mt-2 text-muted">Leave the paperwork to the MoveIn team, and keep these standards in every chat.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card className="border-red-200 bg-red-50 p-5">
                <p className="font-bold">
                  What you do <span className="text-red-600">not</span> need to handle
                </p>
                <Bullets items={["Contract details", "Contract paperwork", "Legal documentation"]} />
              </Card>
              <Card className="p-5">
                <p className="font-bold">
                  Performance <Hl>expectation</Hl>
                </p>
                <Bullets items={["Clear communication in English", "Fast response time", "Professional and friendly attitude"]} />
              </Card>
            </div>
          </div>
        )}
        {screen === "step2" && (
          <Split step="Step 2" title={<>Your <Hl>information</Hl></>} image="/illustrations/avatar.png">
            We use your details to match you with the right students and keep everything running smoothly.
          </Split>
        )}
        {screen === "info" && (
          <Form title="Your information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">{(id) => <Input id={id} value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />}</Field>
              <Field label="Last name">{(id) => <Input id={id} value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />}</Field>
              <Field label="University" className="sm:col-span-2">
                {(id) => (
                  <Select id={id} value={f.university} onChange={(e) => set("university", e.target.value)}>
                    <option>Chulalongkorn University</option>
                    <option>Thammasat University</option>
                    <option>Mahidol University</option>
                    <option>Other Thai university</option>
                  </Select>
                )}
              </Field>
              <Field label="Faculty">{(id) => <Input id={id} value={f.faculty} onChange={(e) => set("faculty", e.target.value)} />}</Field>
              <Field label="Year">
                {(id) => (
                  <Select id={id} value={f.year} onChange={(e) => set("year", Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </Form>
        )}
        {screen === "contact" && (
          <Form title="Contact information">
            <div className="space-y-4">
              <Field label="Email">{(id) => <Input id={id} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />}</Field>
              <Field label="Phone">{(id) => <Input id={id} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
              <div className="grid grid-cols-[1fr_1.4fr] gap-3">
                <Field label="Other contact channel">
                  {(id) => (
                    <Select id={id} value={f.otherChannel} onChange={(e) => set("otherChannel", e.target.value)}>
                      <option>LINE</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                    </Select>
                  )}
                </Field>
                <Field label="ID">{(id) => <Input id={id} value={f.otherId} onChange={(e) => set("otherId", e.target.value)} />}</Field>
              </div>
              <Field label="WhatsApp number" hint="WhatsApp is our main channel with the MoveIn team and exchange students. Please have it installed on your phone.">
                {(id) => <Input id={id} type="tel" placeholder="+66 81 234 5678" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />}
              </Field>
            </div>
          </Form>
        )}
        {screen === "step3" && (
          <Split step="Step 3" title={<>Your <Hl>motivation</Hl></>} image="/illustrations/climb.png">
            Tell us how you found MoveIn and why you&apos;d like to be a buddy.
          </Split>
        )}
        {screen === "whyMoveIn" && (
          <Form title="Your motivation">
            <Field label="Why are you interested in MoveIn?">
              {(id) => <Textarea id={id} rows={7} maxLength={1000} placeholder="What about MoveIn stood out to you? It could be our mission, our service, or the chance to help students settle in." value={f.whyMoveIn} onChange={(e) => set("whyMoveIn", e.target.value)} />}
            </Field>
          </Form>
        )}
        {screen === "whyBuddy" && (
          <Form title="Your motivation">
            <Field label="Why do you want to become an exchange buddy?">
              {(id) => <Textarea id={id} rows={7} maxLength={1000} placeholder="What do you hope to gain or give as a buddy? Meeting new people, helping students feel at home, building experience…" value={f.whyBuddy} onChange={(e) => set("whyBuddy", e.target.value)} />}
            </Field>
          </Form>
        )}
        {screen === "found" && (
          <Form title={<>How did you <Hl>find us</Hl>?</>}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FOUND_VIA.map((x) => (
                <ChoiceTile key={x} title={x} selected={f.foundVia === x} onClick={() => set("foundVia", x)} />
              ))}
            </div>
          </Form>
        )}
      </main>
      <footer className="sticky bottom-0 border-t border-line bg-canvas/95 px-4 pb-4 pt-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((p) => (
              <span key={p} className={cn("h-1.5 rounded-full", p <= PART[screen] ? "bg-brand-600" : "bg-brand-100")} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
              Back
            </Button>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button onClick={next}>{i === SCREENS.length - 1 ? "Submit application" : "Next"}</Button>
          </div>
        </div>
      </footer>
    </>
  );
}

const Hl = ({ children }: { children: ReactNode }) => <span className="text-brand-600">{children}</span>;

function Split({ step, title, sub, image, children }: { step?: string; title: ReactNode; sub?: string; image: string; children: ReactNode }) {
  return (
    <div className="grid items-center gap-8 py-6 sm:grid-cols-[1.3fr_1fr]">
      <div>
        {step && <p className="text-sm font-semibold">{step}</p>}
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        <div className="mt-4 text-ink/80">{children}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="mx-auto h-56 w-auto object-contain" />
    </div>
  );
}

function Form({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-xl py-4">
      <h1 className="mb-6 text-center text-2xl font-bold">{title}</h1>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1 rounded-2xl bg-brand-50 p-5 pl-9 text-sm">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}
