import { differenceInCalendarMonths, format, parseISO } from "date-fns";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...v: ClassValue[]) => twMerge(clsx(v));

export const baht = (n: number) => `฿${n.toLocaleString("en-US")}`;

export const date = (iso: string, f = "d MMMM yyyy") => format(parseISO(iso), f);

export const monthsLeft = (iso: string, from = new Date()) => Math.max(0, differenceInCalendarMonths(parseISO(iso), from));

export const flag = (code: string) =>
  code.length === 2 && code !== "UN"
    ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "🌏";

export const fullName = (u?: { firstName: string; lastName: string }) => (u ? `${u.firstName} ${u.lastName}`.trim() : "Unknown");

export const fileSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

export const nowIso = () => new Date().toISOString();

/** WhatsApp click-to-chat link from a phone number in any format. */
export const whatsappLink = (phone: string, text?: string) =>
  `https://wa.me/${phone.replace(/[^0-9]/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** Only allow same-site relative redirects (blocks "//evil.com" and "https://…"). */
export const safeNext = (next: string | null | undefined, fallback: string) =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
