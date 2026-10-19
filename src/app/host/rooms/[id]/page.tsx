"use client";

import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { Badge, Button, ButtonLink, Card, EmptyState, Field, Input, Notice, Textarea } from "@/components/ui";
import { bookingStage, STAGE_COPY } from "@/lib/booking";
import { date, fullName } from "@/lib/format";
import { useMe, useStore } from "@/lib/store";
import type { Listing } from "@/lib/types";

export default function HostRoomEdit() {
  const { id } = useParams<{ id: string }>();
  const me = useMe()!;
  const listing = useStore((s) => s.listings.find((l) => l.id === id));
  if (!listing || listing.landlordId !== me.id) return <EmptyState title="Room not found" action={<ButtonLink href="/host/rooms">My rooms</ButtonLink>} />;
  return <Editor key={listing.id} listing={listing} />;
}

function Editor({ listing }: { listing: Listing }) {
  const update = useStore((s) => s.updateListing);
  const setStatus = useStore((s) => s.setListingStatus);
  const bookings = useStore((s) => s.bookings);
  const users = useStore((s) => s.users);
  const requests = useMemo(() => bookings.filter((b) => b.listingId === listing.id), [bookings, listing.id]);

  const [form, setForm] = useState({
    title: listing.title,
    rent: listing.rent,
    deposit: listing.deposit,
    availableFrom: listing.availableFrom,
    minMonths: listing.minMonths,
    description: listing.description,
    photos: listing.photos,
  });
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };
  const valid = form.title.trim() && form.rent > 0 && form.photos.length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/host/rooms" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
        <ArrowLeft className="size-4" /> My rooms
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{listing.building}</h1>
          <p className="text-sm text-muted">Edit room details</p>
        </div>
        <div className="flex gap-2">
          {listing.status !== "pending" && (
            <ButtonLink href={`/rooms/${listing.id}`} variant="secondary" size="sm" target="_blank">
              <ExternalLink className="size-4" /> View as student
            </ButtonLink>
          )}
        </div>
      </div>

      {listing.status === "pending" && <Notice className="mt-4">The MoveIn team is reviewing this room. We&apos;ll notify you on WhatsApp when it&apos;s live.</Notice>}
      {listing.status === "rejected" && <Notice tone="warn" className="mt-4">This room needs changes before it can go live. The MoveIn team will contact you on WhatsApp.</Notice>}

      {(listing.status === "on_market" || listing.status === "off_market") && (
        <Card className="mt-5 flex flex-wrap items-center gap-4 p-4">
          <div className="flex-1">
            <p className="font-semibold">{listing.status === "on_market" ? "On the market" : "Off the market"}</p>
            <p className="text-sm text-muted">{listing.status === "on_market" ? "Students can find and request this room." : listing.tenancy ? `Rented by ${listing.tenancy.studentName} until ${date(listing.tenancy.endsOn)}.` : "Hidden from students."}</p>
          </div>
          <Button variant="secondary" onClick={() => setStatus(listing.id, listing.status === "on_market" ? "off_market" : "on_market")}>
            {listing.status === "on_market" ? "Take off the market" : "Put back on the market"}
          </Button>
        </Card>
      )}

      <Card className="mt-5 space-y-5 p-5">
        <Field label="Title">{(id) => <Input id={id} maxLength={80} value={form.title} onChange={(e) => set("title", e.target.value)} />}</Field>
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Monthly rent (฿)">{(id) => <Input id={id} type="number" min={0} value={form.rent} onChange={(e) => set("rent", Number(e.target.value))} />}</Field>
          <Field label="Deposit (฿)">{(id) => <Input id={id} type="number" min={0} value={form.deposit} onChange={(e) => set("deposit", Number(e.target.value))} />}</Field>
          <Field label="Available from">{(id) => <Input id={id} type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} />}</Field>
          <Field label="Min. months">{(id) => <Input id={id} type="number" min={1} max={12} value={form.minMonths} onChange={(e) => set("minMonths", Number(e.target.value))} />}</Field>
        </div>
        <Field label="Description">{(id) => <Textarea id={id} rows={4} maxLength={500} value={form.description} onChange={(e) => set("description", e.target.value)} />}</Field>
        <div>
          <p className="mb-2 text-sm font-medium">Photos</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {form.photos.map((p, i) => (
              <div key={p.slice(-40) + i} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button
                  aria-label="Remove photo"
                  onClick={() => set("photos", form.photos.filter((_, k) => k !== i))}
                  className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/90 text-red-600 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px] font-bold">Cover</span>}
              </div>
            ))}
            <FileUpload label="Add" accept="image/*" onFile={(f) => f.url && set("photos", [...form.photos, f.url])} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
          <Button
            disabled={!valid}
            onClick={() => {
              update(listing.id, { ...form, title: form.title.trim() });
              setSaved(true);
            }}
          >
            Save changes
          </Button>
        </div>
      </Card>

      <h2 className="mb-3 mt-8 text-lg font-bold">Booking requests for this room</h2>
      {requests.length === 0 ? (
        <p className="text-sm text-muted">No requests yet.</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((b) => (
            <li key={b.id}>
              <Link href={`/host/bookings/${b.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3 hover:border-brand-300">
                <span className="text-sm font-semibold">{fullName(users.find((u) => u.id === b.studentId))}</span>
                <Badge tone="brand">{STAGE_COPY[bookingStage(b)].landlord}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
