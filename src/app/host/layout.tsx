"use client";

import { CalendarCheck, Home, KeyRound, UserRound, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Hydrated } from "@/components/hydrated";
import { msg, useT } from "@/lib/i18n";

const NAV: NavItem[] = [
  { href: "/host", label: msg("Home"), icon: Home, exact: true },
  { href: "/host/rooms", label: msg("My Rooms"), icon: KeyRound },
  { href: "/host/students", label: msg("Student List"), icon: Users },
  { href: "/host/bookings", label: msg("Bookings"), icon: CalendarCheck },
  { href: "/host/profile", label: msg("Profile"), icon: UserRound },
];

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  // The listing wizard is full-screen and also lets new landlords sign up.
  if (usePathname() === "/host/new") return <Hydrated>{children}</Hydrated>;
  return (
    <AppShell
      nav={NAV}
      requireRole="landlord"
      aside={
        <div className="rounded-2xl bg-brand-50 p-4 text-xs ring-1 ring-brand-100">
          <p className="text-sm font-bold">{t("When do students look for rooms?")}</p>
          <p className="mt-2">
            <strong>{t("Semester 1")}</strong> {t("(starts Aug): April – August")}
          </p>
          <p className="mt-1">
            <strong>{t("Semester 2")}</strong> {t("(starts Jan): October – December")}
          </p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
