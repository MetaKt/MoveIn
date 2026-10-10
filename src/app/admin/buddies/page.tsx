"use client";

import { useMemo, useState } from "react";
import { Avatar, Badge, Button, Card, PageHeader, Select } from "@/components/ui";
import { date, flag, fullName } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AdminBuddies() {
  const apps = useStore((s) => s.applications);
  const reqs = useStore((s) => s.buddyRequests);
  const users = useStore((s) => s.users);
  const review = useStore((s) => s.reviewApplication);
  const assign = useStore((s) => s.assignBuddy);
  const buddies = useMemo(() => users.filter((u) => u.role === "buddy"), [users]);
  const load = (id: string) => reqs.filter((r) => r.buddyId === id && r.stage !== "settled").length;
  const unmatched = reqs.filter((r) => !r.buddyId);
  const pending = apps.filter((a) => a.status === "pending");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="Buddies" subtitle="Match students with buddies and review new buddy applications." />

      <section>
        <h2 className="mb-3 text-lg font-bold">Students waiting for a buddy ({unmatched.length})</h2>
        {unmatched.length === 0 ? (
          <p className="text-sm text-muted">Everyone has a buddy.</p>
        ) : (
          <div className="space-y-3">
            {unmatched.map((r) => (
              <AssignRow key={r.id} requestId={r.id} studentId={r.studentId} since={r.createdAt} buddies={buddies.map((b) => ({ id: b.id, name: fullName(b), load: load(b.id) }))} onAssign={assign} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Applications to review ({pending.length})</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.length === 0 && <p className="text-sm text-muted">No new applications.</p>}
          {pending.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={`${a.firstName} ${a.lastName}`} />
                <div className="flex-1">
                  <p className="font-bold">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-xs text-muted">
                    {a.university} · {a.faculty} · Year {a.year}
                  </p>
                </div>
                <Badge tone="gray">{a.foundVia}</Badge>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Why MoveIn?</dt>
                  <dd>{a.whyMoveIn}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Why be a buddy?</dt>
                  <dd>{a.whyBuddy}</dd>
                </div>
                <div className="text-xs text-muted">
                  {a.email} · WhatsApp {a.whatsapp} · {a.otherChannel} {a.otherId}
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="success" onClick={() => review(a.id, "approved")}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => review(a.id, "rejected")}>
                  Decline
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Active buddies ({buddies.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buddies.map((b) => (
            <Card key={b.id} className="flex items-center gap-3 p-4">
              <Avatar name={fullName(b)} />
              <div>
                <p className="font-semibold">{fullName(b)}</p>
                <p className="text-xs text-muted">
                  {b.buddy?.faculty} · {load(b.id)} active students
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function AssignRow({
  requestId,
  studentId,
  since,
  buddies,
  onAssign,
}: {
  requestId: string;
  studentId: string;
  since: string;
  buddies: { id: string; name: string; load: number }[];
  onAssign: (r: string, b: string) => void;
}) {
  const student = useStore((s) => s.users.find((u) => u.id === studentId));
  const [pick, setPick] = useState(buddies.slice().sort((a, b) => a.load - b.load)[0]?.id ?? "");
  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      <Avatar name={fullName(student)} />
      <div className="flex-1">
        <p className="font-semibold">
          {fullName(student)} {student?.student && flag(student.student.countryCode)}
        </p>
        <p className="text-xs text-muted">Asked {date(since, "d MMM")}</p>
      </div>
      <Select aria-label="Buddy" value={pick} onChange={(e) => setPick(e.target.value)} className="h-9 w-56 py-1.5">
        {buddies.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.load} active)
          </option>
        ))}
      </Select>
      <Button size="sm" disabled={!pick} onClick={() => onAssign(requestId, pick)}>
        Match
      </Button>
    </Card>
  );
}
