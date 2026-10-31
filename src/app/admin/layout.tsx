"use client";

import { BarChart3, CalendarCheck, HeartHandshake, KeyRound, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { msg } from "@/lib/i18n";

const NAV: NavItem[] = [
  { href: "/admin", label: msg("Dashboard"), icon: BarChart3, exact: true },
  { href: "/admin/rooms", label: msg("Rooms"), icon: KeyRound },
  { href: "/admin/bookings", label: msg("Bookings"), icon: CalendarCheck },
  { href: "/admin/buddies", label: msg("Buddies"), icon: HeartHandshake },
  { href: "/admin/users", label: msg("Profiles"), icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={NAV} requireRole="admin">
      {children}
    </AppShell>
  );
}
