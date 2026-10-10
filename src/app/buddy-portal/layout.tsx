"use client";

import { BookOpen, CircleHelp, Home, UserRound, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV: NavItem[] = [
  { href: "/buddy-portal", label: "Home", icon: Home, exact: true },
  { href: "/buddy-portal/profile", label: "Profile", icon: UserRound },
  { href: "/buddy-portal/manual", label: "Manual", icon: BookOpen },
  { href: "/buddy-portal/buddies", label: "Your Buddies", icon: Users },
  { href: "/buddy-portal/faq", label: "FAQ", icon: CircleHelp },
];

export default function BuddyPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={NAV} requireRole="buddy">
      {children}
    </AppShell>
  );
}
