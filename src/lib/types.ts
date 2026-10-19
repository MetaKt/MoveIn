export type Role = "student" | "landlord" | "buddy" | "admin";

export interface FileRef {
  name: string;
  size: number;
  type: string;
  /** Data URL for small images in demo mode; storage path in production. */
  url?: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  createdAt: string;
  student?: StudentProfile;
  landlord?: LandlordProfile;
  buddy?: BuddyProfile;
}

export interface StudentProfile {
  gender: "female" | "male" | "non-binary" | "prefer-not";
  age: number;
  country: string;
  countryCode: string;
  homeUniversity: string;
  faculty: string;
  notifications: boolean;
}

export interface LandlordProfile {
  phone: string;
  idDocument?: FileRef;
  verified: boolean;
  hostSince: number;
}

export interface BuddyProfile {
  university: string;
  faculty: string;
  year: number;
  phone: string;
}

export type RoomType = "studio" | "1br" | "2br" | "3br" | "shared2" | "shared34";
export type PlaceKind = "house" | "apartment" | "condo" | "studio" | "dormitory" | "serviced";
export type PlaceType = "entire" | "room" | "shared";
export type ListingSource = "partner" | "takeover";
export type ListingStatus = "pending" | "on_market" | "off_market" | "rejected";

export interface Review {
  author: string;
  country: string;
  months: number;
  text: string;
  rating: number;
}

export interface Listing {
  id: string;
  landlordId: string;
  source: ListingSource;
  title: string;
  building: string;
  areaId: string;
  address: string;
  lat: number;
  lng: number;
  placeKind: PlaceKind;
  placeType: PlaceType;
  roomType: RoomType;
  sizeSqm: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rent: number;
  deposit: number;
  minMonths: number;
  availableFrom: string;
  amenities: string[];
  nearby: string[];
  facilities: string[];
  photos: string[];
  description: string;
  status: ListingStatus;
  reviewEachRequest: boolean;
  safety: { exteriorCamera: boolean; noiseMonitor: boolean };
  /** For take-over rooms: the exchange student currently living there. */
  currentTenant?: { name: string; country: string; countryCode: string; leavesOn: string };
  /** For off-market rooms: who is renting it and until when. */
  tenancy?: { studentName: string; endsOn: string };
  reviews: Review[];
  createdAt: string;
}

export interface RoomRequest {
  id: string;
  studentId: string;
  months: number;
  moveIn: string;
  moveOut: string;
  roomTypes: RoomType[];
  budget: number;
  areaIds: string[];
  facilities: string;
  notes: string;
  occupants: number;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  requestId: string;
  listingId: string;
  landlordId: string;
  createdAt: string;
}

export interface BankDetails {
  bank: string;
  swift: string;
  accountName: string;
  accountNumber: string;
  bankAddress: string;
  recipientAddress: string;
}

export type BookingStatus = "requested" | "accepted" | "declined" | "cancelled" | "completed";

export interface ContractVersion extends FileRef {
  version: number;
}

export interface Booking {
  id: string;
  listingId: string;
  studentId: string;
  landlordId: string;
  moveIn: string;
  months: number;
  guests: number;
  note: string;
  passport?: FileRef;
  tourVideoRequested: boolean;
  tourVideo?: FileRef;
  status: BookingStatus;
  landlordAcknowledgedId: boolean;
  bank?: BankDetails;
  totalPayment?: number;
  slip?: FileRef;
  paymentReceived: boolean;
  contractTeamRequested: boolean;
  contracts: ContractVersion[];
  studentAccepted: boolean;
  countersigned?: FileRef;
  whatsappGroupUrl?: string;
  buddyRequested: boolean;
  helpRequested: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuddyApplication {
  id: string;
  firstName: string;
  lastName: string;
  university: string;
  faculty: string;
  year: number;
  email: string;
  phone: string;
  otherChannel: string;
  otherId: string;
  whatsapp: string;
  whyMoveIn: string;
  whyBuddy: string;
  foundVia: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface BuddyRequest {
  id: string;
  studentId: string;
  buddyId?: string;
  bookingId?: string;
  arrivalDate?: string;
  stage: "matching" | "choosing" | "arriving" | "settled";
  createdAt: string;
}

export interface Area {
  id: string;
  name: string;
  tagline: string;
  priceFrom: number;
  description: string;
  lat: number;
  lng: number;
  nearby: { grocery: string[]; dineout: string[]; transport: string[] };
}

export interface Station {
  id: string;
  name: string;
  line: "BTS Sukhumvit" | "BTS Silom" | "MRT Blue" | "Airport Rail Link";
  lat: number;
  lng: number;
  minutesToChula: number;
}
