"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, PageHeader } from "@/components/ui";
import { bookingStage } from "@/lib/booking";
import { flag } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { AREAS, FACULTIES } from "@/lib/reference";
import { useStore } from "@/lib/store";

type Row = { label: string; value: number; hint?: string };

const countBy = <T,>(items: T[], key: (t: T) => string | string[] | undefined) => {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    for (const x of Array.isArray(k) ? k : k ? [k] : []) m.set(x, (m.get(x) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export default function AdminDashboard() {
  const t = useT();
  const s = useStore();

  const d = useMemo(() => {
    const students = s.users.filter((u) => u.role === "student");
    const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
    const nationality: Row[] = countBy(students, (u) => u.student && `${flag(u.student.countryCode)} ${t(u.student.country)}`).map(([label, n]) => ({
      label,
      value: pct(n, students.length),
      hint: t("{count} students", { count: n }),
    }));
    const faculty: Row[] = countBy(students, (u) => u.student?.faculty).map(([id, n]) => ({
      label: t(FACULTIES.find((f) => f.id === id)?.name ?? id),
      value: pct(n, students.length),
      hint: t("{count} students", { count: n }),
    }));
    const openReqs = s.requests.filter((r) => r.status === "open");
    const area: Row[] = countBy(openReqs, (r) => r.areaIds).map(([id, n]) => ({
      label: t(AREAS.find((a) => a.id === id)?.name ?? id),
      value: pct(n, openReqs.length),
      hint: t("{count} of {total} requests", { count: n, total: openReqs.length }),
    }));
    const favs = Object.values(s.favorites).flat();
    const favorite: Row[] = countBy(favs, (id) => s.listings.find((l) => l.id === id)?.building).map(([label, n]) => ({ label, value: n, hint: t("{count} saves", { count: n }) }));
    const completed = s.bookings.filter((b) => bookingStage(b) === "ready_to_move_in");
    const building: Row[] = countBy(completed, (b) => s.listings.find((l) => l.id === b.listingId)?.building).map(([label, n]) => ({ label, value: pct(n, completed.length), hint: t("{count} contracts", { count: n }) }));
    return {
      kpis: [
        { label: t("Students"), value: students.length, href: "/admin/users" },
        { label: t("Landlords"), value: s.users.filter((u) => u.role === "landlord").length, href: "/admin/users" },
        { label: t("Rooms on market"), value: s.listings.filter((l) => l.status === "on_market").length, href: "/admin/rooms" },
        { label: t("Rooms to review"), value: s.listings.filter((l) => l.status === "pending").length, href: "/admin/rooms" },
        { label: t("Active bookings"), value: s.bookings.filter((b) => b.status === "requested" || b.status === "accepted").length, href: "/admin/bookings" },
        { label: t("Students without buddy"), value: s.buddyRequests.filter((r) => !r.buddyId).length, href: "/admin/buddies" },
      ],
      nationality,
      faculty,
      area,
      favorite,
      building,
    };
  }, [s, t]);

  return (
    <div>
      <PageHeader eyebrow={t("Admin")} title={t("Dashboard")} subtitle={t("How MoveIn is doing this semester.")} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {d.kpis.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card className="p-4 transition hover:border-brand-300">
              <p className="text-3xl font-bold tabular-nums">{k.value}</p>
              <p className="mt-1 text-xs text-muted">{k.label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Bars title={t("Nationality")} unit="%" rows={d.nationality} />
        <Bars title={t("Faculty")} unit="%" rows={d.faculty} />
        <Bars title={t("Area popularity (room requests)")} unit="%" rows={d.area} />
        <Bars title={t("Favourited room ranking")} rows={d.favorite} />
        <Bars title={t("Buildings with completed contracts")} unit="%" rows={d.building} />
      </div>
    </div>
  );
}

/** Single-series ranked bar list: one hue, value labels in ink, hover shows the raw count. */
function Bars({ title, rows, unit = "" }: { title: string; rows: Row[]; unit?: string }) {
  const t = useT();
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{t("No data yet.")}</p>
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">{title}</caption>
          <tbody>
            {rows.slice(0, 8).map((r, i) => (
              <tr key={r.label} title={r.hint} className="group">
                <td className="w-6 py-1.5 align-middle text-xs text-muted tabular-nums">{i + 1}</td>
                <td className="max-w-0 truncate py-1.5 pr-3 align-middle" style={{ width: "40%" }}>
                  {r.label}
                </td>
                <td className="py-1.5 align-middle">
                  <div className="h-3 rounded-r bg-brand-500 transition-[width] group-hover:bg-brand-700" style={{ width: `${(r.value / max) * 100}%`, minWidth: 4 }} />
                </td>
                <td className="w-14 py-1.5 pl-3 text-right align-middle font-semibold tabular-nums">
                  {r.value}
                  {unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
