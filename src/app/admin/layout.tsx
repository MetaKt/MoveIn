"use client";

import { BarChart3, CalendarCheck, HeartHandshake, KeyRound, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/rooms", label: "Rooms", icon: KeyRound },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/buddies", label: "Buddies", icon: HeartHandshake },
  { href: "/admin/users", label: "Profiles", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={NAV} requireRole="admin">
      {children}
    </AppShell>
  );
}
