"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { moveOutDate } from "./booking";
import { msg, type Vars } from "./i18n";
import { safeLocalStorage } from "./storage";
import { fullName, nowIso, uid } from "./format";
import {
  SEED_APPLICATIONS,
  SEED_BOOKINGS,
  SEED_BUDDY_REQUESTS,
  SEED_LISTINGS,
  SEED_PROPOSALS,
  SEED_REQUESTS,
  SEED_USERS,
} from "./seed";
import type {
  BankDetails,
  Booking,
  BuddyApplication,
  BuddyRequest,
  FileRef,
  Listing,
  ListingStatus,
  Proposal,
  RoomRequest,
  StudentProfile,
  User,
} from "./types";


export interface Notification {
  id: string;
  userId: string;
  /** English template, translated when shown; {name}-style slots are filled from vars. */
  text: string;
  vars?: Vars;
  href: string;
  read: boolean;
  createdAt: string;
}

interface Data {
  users: User[];
  listings: Listing[];
  requests: RoomRequest[];
  proposals: Proposal[];
  bookings: Booking[];
  applications: BuddyApplication[];
  buddyRequests: BuddyRequest[];
  favorites: Record<string, string[]>;
  notifications: Notification[];
  currentUserId: string | null;
}

interface Actions {
  signIn: (userId: string) => void;
  signOut: () => void;
  registerStudent: (u: Pick<User, "firstName" | "lastName" | "email" | "whatsapp">, profile: StudentProfile) => User;
  registerLandlord: (u: Pick<User, "firstName" | "lastName" | "email" | "whatsapp">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;

  toggleFavorite: (listingId: string) => void;
  createListing: (l: Omit<Listing, "id" | "status" | "createdAt" | "reviews" | "landlordId">) => Listing;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  setListingStatus: (id: string, status: ListingStatus) => void;

  saveRequest: (r: Omit<RoomRequest, "id" | "studentId" | "moveOut" | "status" | "createdAt" | "updatedAt">) => RoomRequest;
  propose: (requestId: string, listingIds: string[]) => void;

  createBooking: (b: Pick<Booking, "listingId" | "moveIn" | "months" | "guests" | "note" | "tourVideoRequested" | "passport">) => Booking;
  acknowledgeLandlordId: (bookingId: string) => void;
  acceptBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  uploadTourVideo: (bookingId: string, f: FileRef) => void;
  setBankDetails: (bookingId: string, bank: BankDetails, total: number) => void;
  uploadSlip: (bookingId: string, f: FileRef) => void;
  confirmPayment: (bookingId: string) => void;
  requestContractTeam: (bookingId: string) => void;
  uploadContract: (bookingId: string, f: FileRef) => void;
  acceptContract: (bookingId: string) => void;
  uploadCountersigned: (bookingId: string, f: FileRef) => void;
  requestHelp: (bookingId: string) => void;

  requestBuddy: (bookingId?: string) => void;
  submitApplication: (a: Omit<BuddyApplication, "id" | "status" | "createdAt">) => void;
  reviewApplication: (id: string, status: "approved" | "rejected") => void;
  assignBuddy: (requestId: string, buddyId: string) => void;
  setBuddyStage: (requestId: string, stage: BuddyRequest["stage"]) => void;

  markNotificationsRead: () => void;
  resetDemo: () => void;
}

export type Store = Data & Actions;

const seed = (): Data => ({
  users: SEED_USERS,
  listings: SEED_LISTINGS,
  requests: SEED_REQUESTS,
  proposals: SEED_PROPOSALS,
  bookings: SEED_BOOKINGS,
  applications: SEED_APPLICATIONS,
  buddyRequests: SEED_BUDDY_REQUESTS,
  favorites: { u_nuhr: ["l_ashton_1br"] },
  notifications: [
    { id: "n_seed1", userId: "u_nuhr", text: msg("{name} proposed a room that matches your preferences"), vars: { name: "Somchai" }, href: "/rooms?tab=match", read: false, createdAt: "2026-10-09T09:00:00.000Z" },
    { id: "n_seed2", userId: "u_somchai", text: msg("{name} has requested to book your room"), vars: { name: "Nuhr" }, href: "/host/bookings/b_nuhr_po", read: false, createdAt: "2026-10-08T10:00:00.000Z" },
    { id: "n_seed3", userId: "u_admin", text: msg("{count} new buddy applications to review"), vars: { count: 2 }, href: "/admin/buddies", read: false, createdAt: "2026-10-09T08:00:00.000Z" },
  ],
  currentUserId: null,
});

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const me = () => get().users.find((u) => u.id === get().currentUserId);
      const notify = (userId: string, text: string, href: string, vars?: Vars): Notification => ({
        id: uid("n"),
        userId,
        text,
        vars,
        href,
        read: false,
        createdAt: nowIso(),
      });
      const patchBooking = (id: string, patch: Partial<Booking>, notes: Notification[] = []) =>
        set((s) => ({
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: nowIso() } : b)),
          notifications: [...notes, ...s.notifications],
        }));
      const booking = (id: string) => {
        const b = get().bookings.find((x) => x.id === id);
        if (!b) throw new Error(`Booking ${id} not found`);
        return b;
      };
      const firstName = (id: string) => get().users.find((u) => u.id === id)?.firstName ?? "Someone";

      return {
        ...seed(),

        signIn: (userId) => set({ currentUserId: userId }),
        signOut: () => set({ currentUserId: null }),
        registerStudent: (u, profile) => {
          const user: User = { ...u, id: uid("u"), role: "student", createdAt: nowIso(), student: profile };
          set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
          return user;
        },
        registerLandlord: (u) => {
          const user: User = { ...u, id: uid("u"), role: "landlord", createdAt: nowIso(), landlord: { phone: u.whatsapp, verified: false, hostSince: new Date().getFullYear() } };
          set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
          return user;
        },
        updateUser: (id, patch) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),

        toggleFavorite: (listingId) => {
          const id = get().currentUserId;
          if (!id) return;
          set((s) => {
            const cur = s.favorites[id] ?? [];
            const next = cur.includes(listingId) ? cur.filter((x) => x !== listingId) : [...cur, listingId];
            return { favorites: { ...s.favorites, [id]: next } };
          });
        },
        createListing: (l) => {
          const user = me();
          if (!user) throw new Error("Sign in first");
          const listing: Listing = { ...l, id: uid("l"), landlordId: user.id, status: "pending", reviews: [], createdAt: nowIso() };
          const admin = get().users.find((u) => u.role === "admin");
          set((s) => ({
            listings: [listing, ...s.listings],
            notifications: admin ? [notify(admin.id, msg("New listing to review: {title}"), "/admin/rooms", { title: listing.title }), ...s.notifications] : s.notifications,
          }));
          return listing;
        },
        updateListing: (id, patch) => set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
        setListingStatus: (id, status) => {
          const l = get().listings.find((x) => x.id === id);
          set((s) => ({
            listings: s.listings.map((x) => (x.id === id ? { ...x, status } : x)),
            notifications:
              l && l.status === "pending" && status !== "pending"
                ? [notify(l.landlordId, status === "rejected" ? msg("Your listing \"{title}\" needs changes") : msg("Your listing \"{title}\" is live!"), "/host/rooms", { title: l.title }), ...s.notifications]
                : s.notifications,
          }));
        },

        saveRequest: (r) => {
          const user = me();
          if (!user) throw new Error("Sign in first");
          const existing = get().requests.find((x) => x.studentId === user.id && x.status === "open");
          const req: RoomRequest = {
            ...r,
            id: existing?.id ?? uid("r"),
            studentId: user.id,
            moveOut: moveOutDate(r.moveIn, r.months),
            status: "open",
            createdAt: existing?.createdAt ?? nowIso(),
            updatedAt: nowIso(),
          };
          set((s) => ({ requests: existing ? s.requests.map((x) => (x.id === req.id ? req : x)) : [req, ...s.requests] }));
          return req;
        },
        propose: (requestId, listingIds) => {
          const user = me();
          const req = get().requests.find((r) => r.id === requestId);
          if (!user || !req) return;
          const already = new Set(get().proposals.filter((p) => p.requestId === requestId).map((p) => p.listingId));
          const fresh = listingIds.filter((id) => !already.has(id));
          if (fresh.length === 0) return;
          set((s) => ({
            proposals: [...fresh.map((listingId) => ({ id: uid("p"), requestId, listingId, landlordId: user.id, createdAt: nowIso() })), ...s.proposals],
            notifications: [
              notify(req.studentId, fresh.length === 1 ? msg("{name} proposed a room that matches your preferences") : msg("{name} proposed {count} rooms that match your preferences"), "/rooms?tab=match", { name: user.firstName, count: fresh.length }),
              ...s.notifications,
            ],
          }));
        },

        createBooking: (b) => {
          const user = me();
          const listing = get().listings.find((l) => l.id === b.listingId);
          if (!user || !listing) throw new Error("Missing user or listing");
          const booking: Booking = {
            ...b,
            id: uid("b"),
            studentId: user.id,
            landlordId: listing.landlordId,
            status: "requested",
            landlordAcknowledgedId: false,
            paymentReceived: false,
            contractTeamRequested: false,
            contracts: [],
            studentAccepted: false,
            buddyRequested: false,
            helpRequested: false,
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          set((s) => ({
            bookings: [booking, ...s.bookings],
            notifications: [notify(listing.landlordId, msg("{name} has requested to book {building}"), `/host/bookings/${booking.id}`, { name: user.firstName, building: listing.building }), ...s.notifications],
          }));
          return booking;
        },
        acknowledgeLandlordId: (id) => patchBooking(id, { landlordAcknowledgedId: true }),
        acceptBooking: (id) => {
          const b = booking(id);
          patchBooking(id, { status: "accepted" }, [notify(b.studentId, msg("{name} accepted your booking. Next: payment."), `/bookings/${id}`, { name: firstName(b.landlordId) })]);
        },
        declineBooking: (id) => {
          const b = booking(id);
          patchBooking(id, { status: "declined" }, [notify(b.studentId, msg("{name} couldn't accept your booking request"), `/bookings/${id}`, { name: firstName(b.landlordId) })]);
        },
        cancelBooking: (id) => {
          const b = booking(id);
          patchBooking(id, { status: "cancelled" }, [notify(b.landlordId, msg("{name} cancelled a booking request"), `/host/bookings/${id}`, { name: firstName(b.studentId) })]);
        },
        uploadTourVideo: (id, f) => {
          const b = booking(id);
          patchBooking(id, { tourVideo: f }, [notify(b.studentId, msg("Your room tour video is ready to watch"), `/bookings/${id}`)]);
        },
        setBankDetails: (id, bank, total) => {
          const b = booking(id);
          patchBooking(id, { bank, totalPayment: total }, [notify(b.studentId, msg("Payment details are ready. Please transfer and upload your slip."), `/bookings/${id}`)]);
        },
        uploadSlip: (id, f) => {
          const b = booking(id);
          patchBooking(id, { slip: f }, [notify(b.landlordId, msg("{name} uploaded a transfer slip"), `/host/bookings/${id}`, { name: firstName(b.studentId) })]);
        },
        confirmPayment: (id) => {
          const b = booking(id);
          patchBooking(id, { paymentReceived: true }, [notify(b.studentId, msg("Your payment was received. The contract comes next."), `/bookings/${id}`)]);
        },
        requestContractTeam: (id) => {
          const admin = get().users.find((u) => u.role === "admin");
          patchBooking(id, { contractTeamRequested: true }, admin ? [notify(admin.id, msg("A landlord requested the contract team"), `/admin/bookings`)] : []);
        },
        uploadContract: (id, f) => {
          const b = booking(id);
          const version = b.contracts.length + 1;
          patchBooking(id, { contracts: [...b.contracts, { ...f, version }], studentAccepted: false }, [
            notify(b.studentId, version === 1 ? msg("Your rental contract is ready to review") : msg("Contract updated to version {version}"), `/bookings/${id}`, { version }),
          ]);
        },
        acceptContract: (id) => {
          const b = booking(id);
          patchBooking(id, { studentAccepted: true }, [notify(b.landlordId, msg("{name} accepted the contract"), `/host/bookings/${id}`, { name: firstName(b.studentId) })]);
        },
        uploadCountersigned: (id, f) => {
          const b = booking(id);
          const student = get().users.find((u) => u.id === b.studentId);
          // The room is now rented: take it off the market until the tenancy ends.
          set((s) => ({
            listings: s.listings.map((l) =>
              l.id === b.listingId ? { ...l, status: "off_market", tenancy: { studentName: fullName(student), endsOn: moveOutDate(b.moveIn, b.months) } } : l,
            ),
          }));
          patchBooking(
            id,
            { countersigned: f, status: "completed", whatsappGroupUrl: `https://chat.whatsapp.com/movein-${id}` },
            [notify(b.landlordId, msg("{name} countersigned the contract. Join the WhatsApp group!"), `/host/bookings/${id}`, { name: firstName(b.studentId) })],
          );
        },
        requestHelp: (id) => {
          const admin = get().users.find((u) => u.role === "admin");
          patchBooking(id, { helpRequested: true }, admin ? [notify(admin.id, msg("A student asked for help with a contract"), `/admin/bookings`)] : []);
        },

        requestBuddy: (bookingId) => {
          const user = me();
          if (!user) return;
          if (get().buddyRequests.some((r) => r.studentId === user.id)) {
            if (bookingId) patchBooking(bookingId, { buddyRequested: true });
            return;
          }
          const admin = get().users.find((u) => u.role === "admin");
          set((s) => ({
            buddyRequests: [{ id: uid("br"), studentId: user.id, bookingId, stage: "matching", createdAt: nowIso() }, ...s.buddyRequests],
            notifications: admin ? [notify(admin.id, msg("{name} asked for a buddy"), "/admin/buddies", { name: user.firstName }), ...s.notifications] : s.notifications,
          }));
          if (bookingId) patchBooking(bookingId, { buddyRequested: true });
        },
        submitApplication: (a) =>
          set((s) => ({ applications: [{ ...a, id: uid("a"), status: "pending", createdAt: nowIso() }, ...s.applications] })),
        reviewApplication: (id, status) => {
          const a = get().applications.find((x) => x.id === id);
          if (!a) return;
          const newBuddy: User | null =
            status === "approved"
              ? {
                  id: uid("u"),
                  role: "buddy",
                  firstName: a.firstName,
                  lastName: a.lastName,
                  email: a.email,
                  whatsapp: a.whatsapp,
                  createdAt: nowIso(),
                  buddy: { university: a.university, faculty: a.faculty, year: a.year, phone: a.phone },
                }
              : null;
          set((s) => ({
            applications: s.applications.map((x) => (x.id === id ? { ...x, status } : x)),
            users: newBuddy ? [...s.users, newBuddy] : s.users,
          }));
        },
        assignBuddy: (requestId, buddyId) => {
          const r = get().buddyRequests.find((x) => x.id === requestId);
          if (!r) return;
          set((s) => ({
            buddyRequests: s.buddyRequests.map((x) => (x.id === requestId ? { ...x, buddyId, stage: x.stage === "matching" ? "choosing" : x.stage } : x)),
            notifications: [
              notify(r.studentId, msg("You've been matched with {name}! They'll message you on WhatsApp."), "/buddy", { name: firstName(buddyId) }),
              notify(buddyId, msg("You have a new buddy: {name}"), "/buddy-portal/buddies", { name: firstName(r.studentId) }),
              ...s.notifications,
            ],
          }));
        },
        setBuddyStage: (requestId, stage) =>
          set((s) => ({ buddyRequests: s.buddyRequests.map((x) => (x.id === requestId ? { ...x, stage } : x)) })),

        markNotificationsRead: () => {
          const id = get().currentUserId;
          set((s) => ({ notifications: s.notifications.map((n) => (n.userId === id ? { ...n, read: true } : n)) }));
        },
        resetDemo: () => set({ ...seed() }),
      };
    },
    {
      name: "movein-demo-v1",
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
);

/** Current signed-in user, or undefined. */
export const useMe = () => useStore((s) => s.users.find((u) => u.id === s.currentUserId));
