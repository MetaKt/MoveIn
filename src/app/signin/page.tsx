"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DemoBanner, homeFor } from "@/components/app-shell";
import { Hydrated } from "@/components/hydrated";
import { Avatar, Card, Logo } from "@/components/ui";
import { flag, fullName, safeNext } from "@/lib/format";
import { SEED_USERS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = { student: "Exchange student", landlord: "Landlord", buddy: "Thai buddy", admin: "MoveIn team" };
const SEED_IDS = new Set(SEED_USERS.map((u) => u.id));
const PERSONAS = ["u_nuhr", "u_kevin", "u_somchai", "u_nattaya", "u_pakin", "u_admin"];

export default function SignInPage() {
  return (
    <div className="min-h-dvh">
      <DemoBanner />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/">
          <Logo size="lg" />
        </Link>
        <Suspense>
          <Hydrated>
            <SignIn />
          </Hydrated>
        </Suspense>
      </div>
    </div>
  );
}

function SignIn() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const users = useStore((s) => s.users);
  const signIn = useStore((s) => s.signIn);
  const personas = PERSONAS.map((id) => users.find((u) => u.id === id)).filter((u) => !!u);
  const extra = users.filter((u) => !SEED_IDS.has(u.id));

  const go = (id: string, role: Role) => {
    signIn(id);
    router.push(safeNext(next, homeFor(role)));
  };

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">This is a demo. Pick an account to see MoveIn from that person&apos;s side, or create your own.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[...personas, ...extra].map((u) => (
            <button key={u.id} onClick={() => go(u.id, u.role)} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-brand-400 hover:shadow-md">
              <Avatar name={fullName(u)} className="size-11" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">
                  {fullName(u)} {u.student && flag(u.student.countryCode)}
                </span>
                <span className="block text-xs text-muted">{ROLE_LABEL[u.role]}</span>
              </span>
              <ArrowRight className="size-4 text-brand-600" />
            </button>
          ))}
        </div>
      </div>
      <Card className="h-fit p-5">
        <h2 className="font-bold">New to MoveIn?</h2>
        <p className="mt-1 text-sm text-muted">Create an account in a minute.</p>
        <div className="mt-4 space-y-2">
          <Link href={`/onboarding${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="block rounded-xl border border-line p-3 hover:border-brand-400">
            <span className="block text-sm font-semibold">I&apos;m an exchange student</span>
            <span className="text-xs text-muted">Find a room and a buddy</span>
          </Link>
          <Link href="/host/new" className="block rounded-xl border border-line p-3 hover:border-brand-400">
            <span className="block text-sm font-semibold">I&apos;m a landlord</span>
            <span className="text-xs text-muted">List your room for exchange students</span>
          </Link>
          <Link href="/become-a-buddy" className="block rounded-xl border border-line p-3 hover:border-brand-400">
            <span className="block text-sm font-semibold">I&apos;m a Thai student</span>
            <span className="text-xs text-muted">Apply to become a buddy</span>
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted">In production you&apos;ll sign in with email or Google.</p>
      </Card>
    </div>
  );
}
