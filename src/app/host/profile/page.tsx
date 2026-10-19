"use client";

import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { FileChip, FileUpload } from "@/components/file-upload";
import { Button, Card, Field, Input, Notice, PageHeader } from "@/components/ui";
import { useMe, useStore } from "@/lib/store";

export default function HostProfile() {
  const me = useMe()!;
  const update = useStore((s) => s.updateUser);
  const [f, setF] = useState({ firstName: me.firstName, lastName: me.lastName, email: me.email, whatsapp: me.whatsapp });
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={
          <>
            Your <span className="text-brand-600">profile</span>
          </>
        }
      />
      <Card className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["email", "Email"],
              ["whatsapp", "WhatsApp"],
            ] as const
          ).map(([k, label]) => (
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
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
          <Button
            onClick={() => {
              update(me.id, f);
              setSaved(true);
            }}
          >
            Edit profile
          </Button>
        </div>
      </Card>

      <Card className="mt-5 space-y-3 p-5">
        <h2 className="font-bold">Your identification</h2>
        <p className="text-sm text-muted">
          We need this to follow financial regulations and prevent fraud. Students <strong>only</strong> see your ID after you accept their booking, before any transaction.
        </p>
        {me.landlord?.verified ? (
          <Notice tone="success">
            <span className="flex items-center gap-2">
              <BadgeCheck className="size-4" /> Verified by the MoveIn team
            </span>
          </Notice>
        ) : (
          <Notice tone="warn">Waiting for the MoveIn team to verify your ID.</Notice>
        )}
        {me.landlord?.idDocument && <FileChip file={me.landlord.idDocument} label="Thai ID card" />}
        <FileUpload
          label={me.landlord?.idDocument ? "Replace ID card" : "Upload Thai ID card"}
          accept="image/*,application/pdf"
          onFile={(file) => update(me.id, { landlord: { ...me.landlord!, idDocument: file, verified: false } })}
        />
      </Card>
    </div>
  );
}
