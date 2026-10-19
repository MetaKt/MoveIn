"use client";

import { useState } from "react";
import { Button, Card, Field, Input, PageHeader } from "@/components/ui";
import { useMe, useStore } from "@/lib/store";

export default function BuddyProfile() {
  const me = useMe()!;
  const update = useStore((s) => s.updateUser);
  const [f, setF] = useState({
    firstName: me.firstName,
    lastName: me.lastName,
    email: me.email,
    whatsapp: me.whatsapp,
    university: me.buddy?.university ?? "",
    faculty: me.buddy?.faculty ?? "",
    year: String(me.buddy?.year ?? 1),
    phone: me.buddy?.phone ?? "",
  });
  const [saved, setSaved] = useState(false);
  const fields: [keyof typeof f, string][] = [
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["university", "University"],
    ["faculty", "Faculty"],
    ["year", "Year"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["whatsapp", "WhatsApp ID"],
  ];

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={
          <>
            Your <span className="text-brand-600">profile</span>
          </>
        }
      />
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([k, label]) => (
            <Field key={k} label={label}>
              {(id) => (
                <Input
                  id={id}
                  value={f[k]}
                  onChange={(e) => {
                    setF({ ...f, [k]: e.target.value });
                    setSaved(false);
                  }}
                />
              )}
            </Field>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
          <Button
            onClick={() => {
              update(me.id, {
                firstName: f.firstName,
                lastName: f.lastName,
                email: f.email,
                whatsapp: f.whatsapp,
                buddy: { university: f.university, faculty: f.faculty, year: Number(f.year) || 1, phone: f.phone },
              });
              setSaved(true);
            }}
          >
            Edit profile
          </Button>
        </div>
      </Card>
    </div>
  );
}
