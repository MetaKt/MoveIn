"use client";

import { BedDouble, CalendarCheck, HeartHandshake, Map, TrainFront } from "lucide-react";
import Link from "next/link";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/explore", label: "Map", icon: Map },
  { href: "/rooms", label: "Available Rooms", icon: BedDouble },
  { href: "/buddy", label: "Buddy", icon: HeartHandshake },
  { href: "/train-map", label: "Train Station Map", icon: TrainFront },
  { href: "/bookings", label: "My Bookings", icon: CalendarCheck },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      nav={NAV}
      aside={
        <Link href="/find-my-room" className="block rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100 transition hover:ring-brand-300">
          <p className="text-sm font-bold text-ink">Need help?</p>
          <p className="mt-1 text-xs text-muted">Set your room preferences and our partners will find rooms for you.</p>
        </Link>
      }
    >
      {children}
    </AppShell>
  );
}
