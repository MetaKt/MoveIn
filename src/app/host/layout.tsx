"use client";

import { CalendarCheck, Home, KeyRound, UserRound, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Hydrated } from "@/components/hydrated";

const NAV: NavItem[] = [
  { href: "/host", label: "Home", icon: Home, exact: true },
  { href: "/host/rooms", label: "My Rooms", icon: KeyRound },
  { href: "/host/students", label: "Student List", icon: Users },
  { href: "/host/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/host/profile", label: "Profile", icon: UserRound },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
  // The listing wizard is full-screen and also lets new landlords sign up.
  if (usePathname() === "/host/new") return <Hydrated>{children}</Hydrated>;
  return (
    <AppShell
      nav={NAV}
      requireRole="landlord"
      aside={
        <div className="rounded-2xl bg-brand-50 p-4 text-xs ring-1 ring-brand-100">
          <p className="text-sm font-bold">When do students look for rooms?</p>
          <p className="mt-2">
            <strong>Semester 1</strong> (starts Aug): April – August
          </p>
          <p className="mt-1">
            <strong>Semester 2</strong> (starts Jan): October – December
          </p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
