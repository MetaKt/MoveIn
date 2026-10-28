"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { moveOutDate } from "./booking";
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

/** localStorage that never throws (private mode, quota exceeded). */
const safeLocalStorage = {
  getItem: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  setItem: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      console.warn("MoveIn demo: could not save to browser storage", e);
    }
  },
  removeItem: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

export interface Notification {
  id: string;
  userId: string;
  text: string;
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
    { id: "n_seed1", userId: "u_nuhr", text: "Somchai proposed a room that matches your preferences", href: "/rooms?tab=match", read: false, createdAt: "2026-10-09T09:00:00.000Z" },
    { id: "n_seed2", userId: "u_somchai", text: "Nuhr has requested to book your room", href: "/host/bookings/b_nuhr_po", read: false, createdAt: "2026-10-08T10:00:00.000Z" },
    { id: "n_seed3", userId: "u_admin", text: "2 new buddy applications to review", href: "/admin/buddies", read: false, createdAt: "2026-10-09T08:00:00.000Z" },
  ],
  currentUserId: null,
});

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const me = () => get().users.find((u) => u.id === get().currentUserId);
      const notify = (userId: string, text: string, href: string): Notification => ({
        id: uid("n"),
        userId,
        text,
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
            notifications: admin ? [notify(admin.id, `New listing to review: ${listing.title}`, "/admin/rooms"), ...s.notifications] : s.notifications,
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
                ? [notify(l.landlordId, status === "rejected" ? `Your listing "${l.title}" needs changes` : `Your listing "${l.title}" is live!`, "/host/rooms"), ...s.notifications]
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
              notify(req.studentId, `${user.firstName} proposed ${fresh.length === 1 ? "a room" : `${fresh.length} rooms`} that match your preferences`, "/rooms?tab=match"),
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
            notifications: [notify(listing.landlordId, `${user.firstName} has requested to book ${listing.building}`, `/host/bookings/${booking.id}`), ...s.notifications],
          }));
          return booking;
        },
        acknowledgeLandlordId: (id) => patchBooking(id, { landlordAcknowledgedId: true }),
        acceptBooking: (id) => {
          const b = booking(id);
          patchBooking(id, { status: "accepted" }, [notify(b.studentId, `${firstName(b.landlordId)} accepted your booking. Next: payment.`, `/bookings/${id}`)]);
        },
        declineBooking: (id) => {
          const b = booking(id);
          patchBooking(id, { status: "declined" }, [notify(b.studentId, `${firstName(b.landlordId)} couldn't accept your booking request`, `/bookings/${id}`)]);
        },
        cancelBooking: (id) => {
          const b = booking(id);
          patchBooking(id, { status: "cancelled" }, [notify(b.landlordId, `${firstName(b.studentId)} cancelled a booking request`, `/host/bookings/${id}`)]);
        },
        uploadTourVideo: (id, f) => {
          const b = booking(id);
          patchBooking(id, { tourVideo: f }, [notify(b.studentId, "Your room tour video is ready to watch", `/bookings/${id}`)]);
        },
        setBankDetails: (id, bank, total) => {
          const b = booking(id);
          patchBooking(id, { bank, totalPayment: total }, [notify(b.studentId, "Payment details are ready. Please transfer and upload your slip.", `/bookings/${id}`)]);
        },
        uploadSlip: (id, f) => {
          const b = booking(id);
          patchBooking(id, { slip: f }, [notify(b.landlordId, `${firstName(b.studentId)} uploaded a transfer slip`, `/host/bookings/${id}`)]);
        },
        confirmPayment: (id) => {
          const b = booking(id);
          patchBooking(id, { paymentReceived: true }, [notify(b.studentId, "Your payment was received. The contract comes next.", `/bookings/${id}`)]);
        },
        requestContractTeam: (id) => {
          const admin = get().users.find((u) => u.role === "admin");
          patchBooking(id, { contractTeamRequested: true }, admin ? [notify(admin.id, "A landlord requested the contract team", `/admin/bookings`)] : []);
        },
        uploadContract: (id, f) => {
          const b = booking(id);
          const version = b.contracts.length + 1;
          patchBooking(id, { contracts: [...b.contracts, { ...f, version }], studentAccepted: false }, [
            notify(b.studentId, version === 1 ? "Your rental contract is ready to review" : `Contract updated to version ${version}`, `/bookings/${id}`),
          ]);
        },
        acceptContract: (id) => {
          const b = booking(id);
          patchBooking(id, { studentAccepted: true }, [notify(b.landlordId, `${firstName(b.studentId)} accepted the contract`, `/host/bookings/${id}`)]);
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
            [notify(b.landlordId, `${firstName(b.studentId)} countersigned the contract. Join the WhatsApp group!`, `/host/bookings/${id}`)],
          );
        },
        requestHelp: (id) => {
          const admin = get().users.find((u) => u.role === "admin");
          patchBooking(id, { helpRequested: true }, admin ? [notify(admin.id, "A student asked for help with a contract", `/admin/bookings`)] : []);
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
            notifications: admin ? [notify(admin.id, `${user.firstName} asked for a buddy`, "/admin/buddies"), ...s.notifications] : s.notifications,
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
              notify(r.studentId, `You've been matched with ${firstName(buddyId)}! They'll message you on WhatsApp.`, "/buddy"),
              notify(buddyId, `You have a new buddy: ${firstName(r.studentId)}`, "/buddy-portal/buddies"),
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
