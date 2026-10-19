"use client";

import { useMemo, useState } from "react";
import { Card, Input, PageHeader, Tabs } from "@/components/ui";
import { flag, fullName } from "@/lib/format";
import { FACULTIES } from "@/lib/reference";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function AdminUsers() {
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
      <PageHeader eyebrow="Admin" title="Profiles" />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full max-w-md">
          <Tabs<Exclude<Role, "admin">>
            value={role}
            onChange={setRole}
            items={[
              { value: "student", label: "Customers" },
              { value: "landlord", label: "Landlords" },
              { value: "buddy", label: "Buddies" },
            ]}
          />
        </div>
        <Input aria-label="Search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-brand-50 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">{role === "student" ? "From / faculty" : role === "landlord" ? "Rooms" : "Faculty"}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{fullName(u)}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.whatsapp}</td>
                <td className="px-4 py-3">
                  {role === "student" && u.student && `${flag(u.student.countryCode)} ${u.student.homeUniversity} · ${FACULTIES.find((f) => f.id === u.student!.faculty)?.name ?? ""}`}
                  {role === "landlord" && `${listings.filter((l) => l.landlordId === u.id).length} rooms · ${u.landlord?.verified ? "ID verified" : "not verified"}`}
                  {role === "buddy" && `${u.buddy?.faculty}, year ${u.buddy?.year}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
