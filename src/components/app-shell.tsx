"use client";

import { Bell, LogOut, Menu, RotateCcw, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { Hydrated } from "@/components/hydrated";
import { Avatar, ButtonLink, Logo } from "@/components/ui";
import { cn, fullName } from "@/lib/format";
import { useMe, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
}

const HOME_FOR: Record<Role, string> = { student: "/explore", landlord: "/host", buddy: "/buddy-portal", admin: "/admin" };
export const homeFor = (r: Role) => HOME_FOR[r];

export function AppShell({
  nav,
  children,
  requireRole,
  aside,
}: {
  nav: NavItem[];
  children: ReactNode;
  /** When set, only users with this role can see the pages. */
  requireRole?: Role;
  /** Extra card at the bottom of the sidebar. */
  aside?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-dvh">
      <DemoBanner />
      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-white/60 px-4 py-6 lg:flex">
          <Link href="/" className="mb-8 px-2">
            <Logo />
          </Link>
          <SideNav nav={nav} />
          {aside && <div className="mt-auto">{aside}</div>}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-[900] lg:hidden" role="dialog" aria-modal>
            <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white px-4 py-6 shadow-xl">
              <div className="mb-8 flex items-center justify-between px-2">
                <Logo />
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-brand-50">
                  <X className="size-5" />
                </button>
              </div>
              <SideNav nav={nav} />
              {aside && <div className="mt-auto">{aside}</div>}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-[800] flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-6 lg:border-none lg:bg-transparent lg:backdrop-blur-none">
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-line lg:hidden">
              <Menu className="size-5 text-brand-700" />
            </button>
            <Link href="/" className="lg:hidden">
              <Logo size="sm" />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Hydrated fallback={null}>
                <Notifications />
                <ProfileMenu />
              </Hydrated>
            </div>
          </header>
          <main className="px-4 pb-16 pt-2 sm:px-6 lg:px-10">
            <Hydrated>{requireRole ? <RoleGate role={requireRole}>{children}</RoleGate> : children}</Hydrated>
          </main>
        </div>
      </div>
    </div>
  );
}

function SideNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {nav.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const me = useMe();
  const pathname = usePathname();
  if (me?.role === role) return <>{children}</>;
  const who = { student: "students", landlord: "landlords", buddy: "buddies", admin: "the MoveIn team" }[role];
  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <h1 className="text-2xl font-bold">This page is for {who}</h1>
      <p className="mt-2 text-sm text-muted">{me ? `You're signed in as ${fullName(me)} (${me.role}).` : "Please sign in to continue."}</p>
      <ButtonLink href={`/signin?next=${encodeURIComponent(pathname)}`} className="mt-6">
        {me ? "Switch account" : "Sign in"}
      </ButtonLink>
    </div>
  );
}

function Notifications() {
  const me = useMe();
  const all = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);
  const mine = useMemo(() => all.filter((n) => n.userId === me?.id).slice(0, 8), [all, me?.id]);
  const unread = mine.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  if (!me) return null;
  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unread) setTimeout(markRead, 1500);
        }}
        className="relative grid size-10 place-items-center rounded-full bg-white ring-1 ring-line hover:ring-brand-300"
      >
        <Bell className="size-5 text-brand-700" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          <p className="border-b border-line px-4 py-3 text-sm font-semibold">Notifications</p>
          {mine.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-96 overflow-auto">
              {mine.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} onClick={() => setOpen(false)} className={cn("block px-4 py-3 text-sm hover:bg-brand-50", !n.read && "bg-brand-50/60 font-medium")}>
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="border-t border-line bg-slate-50 px-4 py-2 text-[11px] text-muted">In production these also go out by email and WhatsApp.</p>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const me = useMe();
  const signOut = useStore((s) => s.signOut);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  if (!me)
    return (
      <ButtonLink href="/signin" size="sm" className="h-10">
        <UserRound className="size-4" /> Sign in
      </ButtonLink>
    );
  return (
    <div className="relative" ref={ref}>
      <button aria-label="Account menu" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full bg-white p-0.5 pr-3 ring-1 ring-line hover:ring-brand-300">
        <Avatar name={fullName(me)} />
        <span className="hidden text-sm font-semibold sm:block">{me.firstName}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-xl">
          <div className="px-4 pb-2">
            <p className="text-sm font-semibold">{fullName(me)}</p>
            <p className="text-xs capitalize text-muted">{me.role === "landlord" ? "Landlord / host" : me.role}</p>
          </div>
          <Link href={homeFor(me.role)} className="block px-4 py-2 text-sm hover:bg-brand-50" onClick={() => setOpen(false)}>
            My home
          </Link>
          <Link href="/signin" className="block px-4 py-2 text-sm hover:bg-brand-50" onClick={() => setOpen(false)}>
            Switch account
          </Link>
          <button
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function DemoBanner() {
  const reset = useStore((s) => s.resetDemo);
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ink px-4 py-1.5 text-center text-xs text-white/85">
      <span>
        <strong className="text-white">Demo mode</strong> · dummy data saved in this browser only
      </span>
      <Link href="/signin" className="font-semibold text-brand-200 underline-offset-2 hover:underline">
        Switch role
      </Link>
      <button
        onClick={() => {
          if (confirm("Reset all demo data to the starting state?")) {
            reset();
            location.assign("/");
          }
        }}
        className="inline-flex items-center gap-1 font-semibold text-brand-200 hover:underline"
      >
        <RotateCcw className="size-3" /> Reset demo
      </button>
    </div>
  );
}

function useClickOutside<T extends HTMLElement>(fn: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fn();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [fn]);
  return ref;
}
