"use client";

import { ArrowRight, BedDouble, HeartHandshake, Repeat2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { DemoBanner } from "@/components/app-shell";
import { LanguageSwitch } from "@/components/language-switch";
import { ButtonLink, Logo } from "@/components/ui";
import { msg, useT } from "@/lib/i18n";

const WAYS = [
  { icon: SlidersHorizontal, title: msg("Tell us your preferences"), text: msg("Fill in a short form. Our partner landlords propose rooms that fit your budget and dates."), href: "/find-my-room" },
  { icon: Repeat2, title: msg("Take over a former student's room"), text: msg("Exchange students finishing their semester hand their room over to you."), href: "/rooms?tab=takeover" },
  { icon: BedDouble, title: msg("Pick from our partners' rooms"), text: msg("Browse verified condos and apartments near campus, with real reviews."), href: "/rooms?tab=available" },
];

export default function Home() {
  const t = useT();
  return (
    <div className="min-h-dvh bg-white">
      <DemoBanner />
      <header className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
        <Logo />
        <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold text-muted md:flex">
          <Link href="/explore" className="hover:text-brand-700">
            {t("Explore areas")}
          </Link>
          <Link href="/rooms?tab=available" className="hover:text-brand-700">
            {t("Rooms")}
          </Link>
          <Link href="/buddy" className="hover:text-brand-700">
            {t("Buddy service")}
          </Link>
          <Link href="/host/new" className="hover:text-brand-700">
            {t("List your room")}
          </Link>
        </nav>
        <LanguageSwitch className="ml-auto md:ml-0" />
        <ButtonLink href="/signin" size="sm">
          {t("Sign in")}
        </ButtonLink>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-14">
          <div>
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-100">{t("For exchange students at Chulalongkorn University")}</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              {t("Find your room in Bangkok")} <span className="text-brand-600">{t("before you land.")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              {t("We were once exchange students too, and we know how hard it is to find a short-term place for one semester. MoveIn finds you a verified room near campus and a Thai buddy to show you how to live like a local.")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/explore" size="lg">
                {t("Start exploring")} <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/find-my-room" size="lg" variant="secondary">
                {t("Let us find your room")}
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted">{t("Exchange students today · Expats coming soon")}</p>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rooms/interior-1.jpg" alt={t("Furnished condo living room")} className="col-span-2 aspect-[16/9] w-full rounded-3xl object-cover shadow-xl shadow-brand-900/10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rooms/pool.jpg" alt={t("Condo rooftop pool")} className="aspect-square w-full rounded-3xl object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/community/event-1.jpg" alt={t("Exchange students at a MoveIn dinner")} className="aspect-square w-full rounded-3xl object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Three ways */}
      <section className="bg-canvas py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">{t("3 ways to find your room")}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {WAYS.map((w, i) => (
              <Link key={w.title} href={w.href} className="group rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/5">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white">
                  <w.icon className="size-6" />
                </span>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-600">{t("Way {n}", { n: i + 1 })}</p>
                <h3 className="mt-1 text-lg font-bold">{t(w.title)}</h3>
                <p className="mt-2 text-sm text-muted">{t(w.text)}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {t("Get started")} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Buddy */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/buddies.png" alt="" className="mx-auto h-72 w-auto object-contain" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{t("Buddy service")}</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">{t("A local friend from day one")}</h2>
            <p className="mt-3 text-muted">
              {t("Apart from finding your room, you can get a Thai student buddy who helps you choose accommodation, meets you on arrival, and teaches you how to live like a local.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/buddy" size="lg">
                <HeartHandshake className="size-4" /> {t("I want a buddy")}
              </ButtonLink>
              <ButtonLink href="/become-a-buddy" size="lg" variant="secondary">
                {t("Become a buddy")}
              </ButtonLink>
            </div>
            <p className="mt-2 text-xs text-muted">{t("Becoming a buddy is for Thai students only.")}</p>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t("Nobody gets left behind")}</h2>
            <p className="mt-3 text-white/85">
              {t("Once you've settled in Bangkok, we organise events and outings for exchange students. We want to build a welcoming international community where everyone connects, makes friends and feels included.")}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/community/event-2.jpg" alt={t("Exchange students at a MoveIn event")} className="aspect-[16/10] w-full rounded-3xl object-cover" />
        </div>
      </section>

      {/* Landlords */}
      <section className="py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 rounded-3xl bg-canvas px-6 py-10 sm:px-10">
          <div>
            <h2 className="text-2xl font-bold">{t("Own a condo near Chula?")}</h2>
            <p className="mt-1 text-muted">{t("List it for exchange students who stay 3–6 months. You review every request yourself.")}</p>
          </div>
          <ButtonLink href="/host/new" size="lg">
            {t("List your room")}
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        <Logo size="sm" />
        <p className="mt-2">{t("A startup by BAScii students, partnering with Chulalongkorn's international exchange programme.")}</p>
      </footer>
    </div>
  );
}
