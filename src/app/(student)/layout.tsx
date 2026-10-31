"use client";

import { BedDouble, CalendarCheck, HeartHandshake, Map, TrainFront } from "lucide-react";
import Link from "next/link";
import { AppShell, type NavItem } from "@/components/app-shell";
import { msg, useT } from "@/lib/i18n";

const NAV: NavItem[] = [
  { href: "/explore", label: msg("Map"), icon: Map },
  { href: "/rooms", label: msg("Available Rooms"), icon: BedDouble },
  { href: "/buddy", label: msg("Buddy"), icon: HeartHandshake },
  { href: "/train-map", label: msg("Train Station Map"), icon: TrainFront },
  { href: "/bookings", label: msg("My Bookings"), icon: CalendarCheck },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <AppShell
      nav={NAV}
      aside={
        <Link href="/find-my-room" className="block rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 transition hover:ring-brand-300">
          <p className="text-sm font-bold text-ink">{t("Need help?")}</p>
          <p className="mt-1 text-xs text-muted">{t("Set your room preferences and our partners will find rooms for you.")}</p>
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
