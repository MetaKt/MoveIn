"use client";

import { LifeBuoy, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { bookingStage, STAGE_COPY } from "@/lib/booking";
import { date, fullName } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AdminBookings() {
  const bookings = useStore((s) => s.bookings);
  const users = useStore((s) => s.users);
  const listings = useStore((s) => s.listings);

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Bookings" subtitle="Every booking, who is moving in and who is moving out. Help requests are flagged." />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-brand-50 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Landlord</th>
              <th className="px-4 py-3">Move in</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const stage = bookingStage(b);
              return (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{fullName(users.find((u) => u.id === b.studentId))}</td>
                  <td className="px-4 py-3">{listings.find((l) => l.id === b.listingId)?.building}</td>
                  <td className="px-4 py-3">{fullName(users.find((u) => u.id === b.landlordId))}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {date(b.moveIn, "d MMM yyyy")} · {b.months} mo
                  </td>
                  <td className="px-4 py-3">{STAGE_COPY[stage].landlord}</td>
                  <td className="space-x-1 px-4 py-3">
                    {b.helpRequested && (
                      <Badge tone="amber">
                        <LifeBuoy className="size-3" /> Student needs help
                      </Badge>
                    )}
                    {b.contractTeamRequested && (
                      <Badge tone="brand">
                        <Users className="size-3" /> Contract team
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
