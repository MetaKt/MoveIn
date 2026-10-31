"use client";

import { Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { DemoBanner } from "@/components/app-shell";
import { FileChip, FileUpload } from "@/components/file-upload";
import { LanguageSwitch } from "@/components/language-switch";
import { Button, ButtonLink, Chip, ChoiceTile, Field, Input, Logo, Notice, Select, Stepper, Textarea } from "@/components/ui";
import { baht, cn } from "@/lib/format";
import { msg, useT } from "@/lib/i18n";
import { AMENITIES, AREAS, FACILITIES, NEARBY, PLACE_KIND_LABEL, PLACE_TYPE_INFO, ROOM_TYPE_LABEL } from "@/lib/reference";
import { useMe, useStore } from "@/lib/store";
import type { FileRef, PlaceKind, PlaceType, RoomType } from "@/lib/types";

/** Each screen belongs to one of the three big steps shown in the progress bar. */
const SCREENS = [
  { id: "intro1", part: 0 },
  { id: "kind", part: 0 },
  { id: "type", part: 0 },
  { id: "minimum", part: 0 },
  { id: "location", part: 0 },
  { id: "basics", part: 0 },
  { id: "intro2", part: 1 },
  { id: "offer", part: 1 },
  { id: "photos", part: 1 },
  { id: "title", part: 1 },
  { id: "nearby", part: 1 },
  { id: "description", part: 1 },
  { id: "intro3", part: 2 },
  { id: "review", part: 2 },
  { id: "price", part: 2 },
  { id: "safety", part: 2 },
  { id: "identity", part: 2 },
] as const;
type ScreenId = (typeof SCREENS)[number]["id"];

export default function NewListingPage() {
  const me = useMe();
  if (!me || me.role !== "landlord") return <AccountStep />;
  return <Wizard />;
}

function Frame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/host">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <Link href="/host" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted ring-1 ring-line hover:bg-white sm:px-4">
            {t("Save & exit")}
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-6">{children}</main>
      {footer}
    </div>
  );
}

function AccountStep() {
  const t = useT();
  const register = useStore((s) => s.registerLandlord);
  const me = useMe();
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", whatsapp: "" });
  const [err, setErr] = useState("");
  return (
    <Frame>
      <p className="text-sm font-semibold text-brand-600">{t("List your room on MoveIn")}</p>
      <h1 className="mt-1 text-3xl font-bold">{t("First, create your host account")}</h1>
      {me && <Notice className="mt-4">{t("You're signed in with another role. Create a separate landlord account to list rooms.")}</Notice>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(
          [
            ["firstName", msg("First name")],
            ["lastName", msg("Last name")],
            ["email", msg("Email")],
            ["whatsapp", msg("WhatsApp / phone")],
          ] as const
        ).map(([k, label]) => (
          <Field key={k} label={t(label)}>
            {(id) => <Input id={id} value={f[k]} type={k === "email" ? "email" : "text"} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </Field>
        ))}
      </div>
      {err && <p className="mt-2 text-sm font-medium text-red-600">{err}</p>}
      <Button
        size="lg"
        className="mt-6"
        onClick={() => {
          if (Object.values(f).some((v) => !v.trim()) || !/^\S+@\S+\.\S+$/.test(f.email)) return setErr(t("Please fill in every field with a valid email."));
          register({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim(), whatsapp: f.whatsapp.trim() });
        }}
      >
        {t("Continue")}
      </Button>
      <p className="mt-4 text-sm text-muted">
        {t("Already a host?")}{" "}
        <Link href="/signin?next=/host/new" className="font-semibold text-brand-700">
          {t("Sign in")}
        </Link>
      </p>
    </Frame>
  );
}

function Wizard() {
  const t = useT();
  const me = useMe()!;
  const router = useRouter();
  const createListing = useStore((s) => s.createListing);
  const updateUser = useStore((s) => s.updateUser);
  const listings = useStore((s) => s.listings);

  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState({
    placeKind: "condo" as PlaceKind,
    placeType: "entire" as PlaceType,
    roomType: "studio" as RoomType,
    minMonths: 4,
    building: "",
    address: "",
    areaId: AREAS[0].id,
    sizeSqm: 28,
    guests: 1,
    bedrooms: 0,
    beds: 1,
    bathrooms: 1,
    amenities: [] as string[],
    facilities: [] as string[],
    photos: [] as string[],
    title: "",
    nearby: [] as string[],
    description: "",
    rent: 0,
    deposit: 0,
    availableFrom: "2027-01-05",
    exteriorCamera: false,
    noiseMonitor: false,
    idDoc: me.landlord?.idDocument as FileRef | undefined,
  });
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setError("");
  };
  const toggle = (k: "amenities" | "facilities" | "nearby", v: string, max = 99) => {
    const cur = d[k];
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : cur.length >= max ? cur : [...cur, v]);
  };

  const suggested = useMemo(() => {
    const similar = listings.filter((l) => l.areaId === d.areaId && l.roomType === d.roomType && l.status !== "pending");
    if (!similar.length) return AREAS.find((a) => a.id === d.areaId)!.priceFrom;
    return Math.round(similar.reduce((s, l) => s + l.rent, 0) / similar.length / 500) * 500;
  }, [listings, d.areaId, d.roomType]);

  const screen: ScreenId = SCREENS[i].id;
  const part = SCREENS[i].part;
  const inPart = SCREENS.filter((s) => s.part === part);
  const partProgress = (inPart.findIndex((s) => s.id === screen) + 1) / inPart.length;

  const check = (): string => {
    switch (screen) {
      case "location":
        return d.building.trim() && d.address.trim() ? "" : t("Add the building name and address.");
      case "photos":
        return d.photos.length >= 1 ? "" : t("Add at least one photo (5 or more is best).");
      case "title":
        return d.title.trim().length >= 5 ? "" : t("Give your room a short title.");
      case "description":
        return d.description.trim().length >= 20 ? "" : t("Write at least a couple of sentences.");
      case "price":
        return d.rent >= 1000 ? "" : t("Set a monthly rent.");
      case "identity":
        return d.idDoc ? "" : t("Upload your ID to publish.");
      default:
        return "";
    }
  };

  const next = () => {
    const e = check();
    if (e) return setError(e);
    if (i < SCREENS.length - 1) return setI(i + 1);
    const area = AREAS.find((a) => a.id === d.areaId)!;
    createListing({
      source: "partner",
      title: d.title.trim(),
      building: d.building.trim(),
      areaId: d.areaId,
      address: d.address.trim(),
      lat: area.lat + (Math.random() - 0.5) * 0.004,
      lng: area.lng + (Math.random() - 0.5) * 0.004,
      placeKind: d.placeKind,
      placeType: d.placeType,
      roomType: d.roomType,
      sizeSqm: d.sizeSqm,
      guests: d.guests,
      bedrooms: d.bedrooms,
      beds: d.beds,
      bathrooms: d.bathrooms,
      rent: d.rent,
      deposit: d.deposit || d.rent * 2,
      minMonths: d.minMonths,
      availableFrom: d.availableFrom,
      amenities: d.amenities,
      nearby: d.nearby,
      facilities: d.facilities,
      photos: d.photos,
      description: d.description.trim(),
      reviewEachRequest: true,
      safety: { exteriorCamera: d.exteriorCamera, noiseMonitor: d.noiseMonitor },
    });
    if (d.idDoc && d.idDoc !== me.landlord?.idDocument) updateUser(me.id, { landlord: { ...me.landlord!, idDocument: d.idDoc } });
    setDone(true);
  };

  if (done)
    return (
      <Frame>
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            {t("Thank you so much")} <span className="block text-brand-600">{t("for listing your room!")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted">{t("We're excited to have you on board. Our team will review your listing and reach out soon. Please keep an eye on your WhatsApp!")}</p>
          <ButtonLink href="/host/rooms" size="lg" className="mt-8">
            {t("Done")}
          </ButtonLink>
        </div>
      </Frame>
    );

  return (
    <Frame
      footer={
        <footer className="sticky bottom-0 border-t border-line bg-canvas/95 px-4 pb-4 pt-3 backdrop-blur sm:px-8">
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((p) => (
              <span key={p} className="h-1.5 overflow-hidden rounded-full bg-brand-100">
                <span className="block h-full rounded-full bg-brand-600 transition-all" style={{ width: `${p < part ? 100 : p === part ? partProgress * 100 : 0}%` }} />
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => (i === 0 ? router.push("/host") : setI(i - 1))}>
              {t("Back")}
            </Button>
            {error && <p className="px-3 text-sm font-medium text-red-600">{error}</p>}
            <Button onClick={next}>{i === SCREENS.length - 1 ? t("Create listing") : t("Next")}</Button>
          </div>
        </footer>
      }
    >
      {screen === "intro1" && (
        <Intro
          step={1}
          title={t("Tell us about your room")}
          text={t("Tell us what kind of place you have, where it is and how many students it fits. It takes about 5 minutes.")}
          image="/illustrations/handover.jpg"
        />
      )}
      {screen === "kind" && (
        <Q title={t("Which best describes your place?")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(Object.keys(PLACE_KIND_LABEL) as PlaceKind[]).map((k) => (
              <ChoiceTile key={k} title={t(PLACE_KIND_LABEL[k])} selected={d.placeKind === k} onClick={() => set("placeKind", k)} />
            ))}
          </div>
        </Q>
      )}
      {screen === "type" && (
        <Q title={t("What type of place?")}>
          <div className="space-y-3">
            {(Object.keys(PLACE_TYPE_INFO) as PlaceType[]).map((k) => (
              <ChoiceTile key={k} title={t(PLACE_TYPE_INFO[k].label)} hint={t(PLACE_TYPE_INFO[k].hint)} selected={d.placeType === k} onClick={() => set("placeType", k)} />
            ))}
          </div>
          <p className="mb-2 mt-6 text-sm font-medium">{t("Room type students will see")}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROOM_TYPE_LABEL) as RoomType[]).map((rt) => (
              <Chip key={rt} selected={d.roomType === rt} onClick={() => set("roomType", rt)}>
                {t(ROOM_TYPE_LABEL[rt])}
              </Chip>
            ))}
          </div>
        </Q>
      )}
      {screen === "minimum" && (
        <Q
          title={t("Minimum rental period")}
          sub={t("Most exchange students stay 3 to 6 months. A shorter minimum means more students can book your room. You can change this anytime.")}
        >
          <input type="range" min={1} max={12} value={d.minMonths} onChange={(e) => set("minMonths", Number(e.target.value))} className="w-full accent-brand-600" aria-label={t("Minimum months")} />
          <p className="mt-3 rounded-xl border border-line bg-white px-4 py-3 font-semibold">{t("{months} months", { months: d.minMonths })}</p>
        </Q>
      )}
      {screen === "location" && (
        <Q title={t("Where is your place?")} sub={t("Students see the general area until they book.")}>
          <div className="space-y-4">
            <Field label={t("Building / project name")}>{(id) => <Input id={id} placeholder={t("e.g. Ideo Q Chula-Samyan")} value={d.building} onChange={(e) => set("building", e.target.value)} />}</Field>
            <Field label={t("Address")}>{(id) => <Input id={id} placeholder="800 Rama IV Rd, Bang Rak, Bangkok 10500" value={d.address} onChange={(e) => set("address", e.target.value)} />}</Field>
            <Field label={t("Area")}>
              {(id) => (
                <Select id={id} value={d.areaId} onChange={(e) => set("areaId", e.target.value)}>
                  {AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {t(a.name)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </Q>
      )}
      {screen === "basics" && (
        <Q title={hl(t("Share some [basics] about your place"))} sub={t("You can add more details later.")}>
          <Stepper label={t("Guests")} value={d.guests} onChange={(n) => set("guests", n)} min={1} max={6} />
          <Stepper label={t("Bedrooms")} value={d.bedrooms} onChange={(n) => set("bedrooms", n)} min={0} max={5} />
          <Stepper label={t("Beds")} value={d.beds} onChange={(n) => set("beds", n)} min={1} max={6} />
          <Stepper label={t("Bathrooms")} value={d.bathrooms} onChange={(n) => set("bathrooms", n)} min={1} max={4} />
          <Field label={t("Size (m²)")} className="mt-4">
            {(id) => <Input id={id} type="number" min={10} value={d.sizeSqm} onChange={(e) => set("sizeSqm", Number(e.target.value))} />}
          </Field>
        </Q>
      )}
      {screen === "intro2" && (
        <Intro
          step={2}
          title={hl(t("Make your room [stand out]"))}
          text={t("Add your amenities and at least 5 photos, then give it a title and a short description.")}
          image="/illustrations/study.png"
        />
      )}
      {screen === "offer" && (
        <Q title={hl(t("What does your place [offer]?"))} sub={t("You can add more amenities after you publish.")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {AMENITIES.map((a) => (
              <ChoiceTile key={a} title={t(a)} selected={d.amenities.includes(a)} onClick={() => toggle("amenities", a)} />
            ))}
          </div>
          <p className="mb-2 mt-6 text-sm font-medium">{t("Building facilities")}</p>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((a) => (
              <Chip key={a} selected={d.facilities.includes(a)} onClick={() => toggle("facilities", a)}>
                {t(a)}
              </Chip>
            ))}
          </div>
        </Q>
      )}
      {screen === "photos" && (
        <Q title={hl(t("Add [photos] of your room"))} sub={t("5 photos or more works best. The first one is your cover.")}>
          <div className="grid grid-cols-3 gap-3">
            {d.photos.map((p, k) => (
              <div key={k} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="h-full w-full object-cover" />
                <button aria-label={t("Remove photo")} onClick={() => set("photos", d.photos.filter((_, x) => x !== k))} className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-white/90 text-red-600">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <FileUpload label={t("Add photos")} accept="image/*" hint={t("JPG or PNG")} onFile={(f) => f.url && set("photos", [...d.photos, f.url])} />
          </div>
          <button type="button" onClick={() => set("photos", ["/rooms/interior-3.jpg", "/rooms/lobby.jpg", "/rooms/pool.jpg"])} className="mt-2 text-xs font-semibold text-brand-700 underline">
            {t("Demo: use sample photos")}
          </button>
        </Q>
      )}
      {screen === "title" && (
        <Q title={hl(t("Give your room a [title]"))} sub={t("Short titles work best. You can always change it later.")}>
          <Textarea maxLength={50} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder={t("e.g. Bright studio near Chula, 5 min to MRT")} aria-label={t("Title")} />
          <p className="mt-1 text-xs text-muted">{d.title.length}/50</p>
        </Q>
      )}
      {screen === "nearby" && (
        <Q title={hl(t("What's [nearby]?"))} sub={t("Choose up to 4 highlights. We'll use them in your listing.")}>
          <div className="flex flex-wrap justify-center gap-2">
            {NEARBY.map((n) => (
              <Chip key={n} selected={d.nearby.includes(n)} onClick={() => toggle("nearby", n, 4)}>
                {t(n)}
              </Chip>
            ))}
          </div>
        </Q>
      )}
      {screen === "description" && (
        <Q title={hl(t("Write a [description]"))} sub={t("Tell students what is great about your place.")}>
          <Textarea rows={7} maxLength={500} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder={t("You'll have a comfortable stay in this cosy room, close to campus and the BTS…")} aria-label={t("Description")} />
          <p className="mt-1 text-xs text-muted">{d.description.length}/500</p>
        </Q>
      )}
      {screen === "intro3" && (
        <Intro
          step={3}
          title={hl(t("Finish up and [publish]"))}
          text={t("Choose your booking settings, set your price and publish your listing.")}
          image="/illustrations/climb.png"
        />
      )}
      {screen === "review" && (
        <Q title={t("Booking review")}>
          <ChoiceTile selected title={t("We let you review each request")} hint={t("Check every booking request yourself before you accept.")} onClick={() => undefined} icon={<Check className="size-3" />} />
        </Q>
      )}
      {screen === "price" && (
        <Q
          title={hl(t("Now, set your [price]"))}
          sub={t("Similar {type} listings nearby rent for about {price}/month.", { type: t(ROOM_TYPE_LABEL[d.roomType]).toLowerCase(), price: baht(suggested) })}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5">
              <label htmlFor="rent" className="text-xs text-muted">
                {t("Monthly rent (฿)")}
              </label>
              <input id="rent" type="number" inputMode="numeric" min={0} step={500} value={d.rent || ""} placeholder={String(suggested)} onChange={(e) => set("rent", Number(e.target.value))} className="block w-full bg-transparent text-4xl font-bold outline-none" />
              {!d.rent && (
                <button type="button" className="mt-1 text-xs font-semibold text-brand-700 underline" onClick={() => set("rent", suggested)}>
                  {t("Use suggested {price}", { price: baht(suggested) })}
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Security deposit (฿)")} hint={t("Usually 2 months' rent")}>
                {(id) => <Input id={id} type="number" min={0} value={d.deposit || ""} placeholder={d.rent ? String(d.rent * 2) : ""} onChange={(e) => set("deposit", Number(e.target.value))} />}
              </Field>
              <Field label={t("Available from")}>{(id) => <Input id={id} type="date" value={d.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} />}</Field>
            </div>
          </div>
        </Q>
      )}
      {screen === "safety" && (
        <Q title={hl(t("Share [safety] details"))} sub={t("Does your place have any safety devices?")}>
          <div className="space-y-2">
            {(
              [
                ["exteriorCamera", msg("Exterior security camera")],
                ["noiseMonitor", msg("Noise decibel monitor")],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 text-sm font-medium">
                {t(label)}
                <input type="checkbox" checked={d[k]} onChange={(e) => set(k, e.target.checked)} className="size-5 accent-brand-600" />
              </label>
            ))}
          </div>
          <Notice className="mt-4">
            {t("Good to know: cameras that see inside the home are not allowed, even if turned off. All outdoor cameras must be disclosed. Follow local laws.")}
          </Notice>
        </Q>
      )}
      {screen === "identity" && (
        <Q
          title={hl(t("Your [identification]"))}
          sub={t("We need this to follow financial regulations and prevent fraud. Students only see your ID after you accept their booking, before any transaction.")}
        >
          {d.idDoc ? (
            <div className="flex items-center gap-3">
              <FileChip file={d.idDoc} label={t("Thai ID card")} className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => set("idDoc", undefined)}>
                {t("Replace")}
              </Button>
            </div>
          ) : (
            <FileUpload label={t("Upload Thai ID card")} accept="image/*,application/pdf" onFile={(f) => set("idDoc", f)} />
          )}
        </Q>
      )}
    </Frame>
  );
}

function Hl({ children }: { children: ReactNode }) {
  return <span className="text-brand-600">{children}</span>;
}

/** Renders "Add [photos]" with the bracketed words highlighted, so each language can place them. */
const hl = (text: string) => text.split(/\[(.+?)\]/).map((part, i) => (i % 2 ? <Hl key={i}>{part}</Hl> : part));

function Q({ title, sub, children }: { title: ReactNode; sub?: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="text-center text-2xl font-bold sm:text-3xl">{title}</h1>
      {sub && <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted">{sub}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Intro({ step, title, text, image }: { step: number; title: ReactNode; text: string; image: string }) {
  const t = useT();
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[1fr_220px]">
      <div>
        <p className="text-sm font-semibold">{t("Step {n}", { n: step })}</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-muted">{text}</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className={cn("mx-auto h-48 w-auto rounded-3xl object-contain")} />
    </div>
  );
}
