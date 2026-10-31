"use client";

import { BookOpen, CircleHelp, Home, UserRound, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { msg } from "@/lib/i18n";

const NAV: NavItem[] = [
  { href: "/buddy-portal", label: msg("Home"), icon: Home, exact: true },
  { href: "/buddy-portal/profile", label: msg("Profile"), icon: UserRound },
  { href: "/buddy-portal/manual", label: msg("Manual"), icon: BookOpen },
  { href: "/buddy-portal/buddies", label: msg("Your Buddies"), icon: Users },
  { href: "/buddy-portal/faq", label: msg("FAQ"), icon: CircleHelp },
];

export default function BuddyPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={NAV} requireRole="buddy">
      {children}
    </AppShell>
  );
}
