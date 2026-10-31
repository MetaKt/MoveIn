"use client";

import { useMemo, useState } from "react";
import { Card, Input, PageHeader, Tabs } from "@/components/ui";
import { flag, fullName } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { FACULTIES } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function AdminUsers() {
  const t = useT();
  const users = useStore((s) => s.users);
  const listings = useStore((s) => s.listings);
  const [role, setRole] = useState<Exclude<Role, "admin">>("student");
  const [q, setQ] = useState("");
  const shown = useMemo(
    () => users.filter((u) => u.role === role && `${fullName(u)} ${u.email}`.toLowerCase().includes(q.toLowerCase())),
    [users, role, q],
  );

  return (
    <div>
      <PageHeader eyebrow={t("Admin")} title={t("Profiles")} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-md">
          <Tabs<Exclude<Role, "admin">>
            value={role}
            onChange={setRole}
            items={[
              { value: "student", label: t("Customers") },
              { value: "landlord", label: t("Landlords") },
              { value: "buddy", label: t("Buddies") },
            ]}
          />
        </div>
        <Input aria-label={t("Search")} placeholder={t("Search name or email")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-brand-50 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">{t("Name")}</th>
              <th className="px-4 py-3">{t("Email")}</th>
              <th className="px-4 py-3">{t("WhatsApp")}</th>
              <th className="px-4 py-3">{role === "student" ? t("From / faculty") : role === "landlord" ? t("Rooms") : t("Faculty")}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{fullName(u)}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.whatsapp}</td>
                <td className="px-4 py-3">
                  {role === "student" && u.student && `${flag(u.student.countryCode)} ${u.student.homeUniversity} · ${t(FACULTIES.find((f) => f.id === u.student!.faculty)?.name ?? "")}`}
                  {role === "landlord" &&
                    `${t("{count} rooms", { count: listings.filter((l) => l.landlordId === u.id).length })} · ${u.landlord?.verified ? t("ID verified") : t("not verified")}`}
                  {role === "buddy" && t("{faculty}, year {year}", { faculty: u.buddy?.faculty ?? "", year: u.buddy?.year ?? "" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
