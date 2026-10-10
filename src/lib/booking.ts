import { addMonths, format, parseISO } from "date-fns";
import type { Booking, Listing, RoomRequest, RoomType } from "./types";

/** Move-out date is generated from move-in date plus the length of stay. */
export function moveOutDate(moveIn: string, months: number): string {
  return format(addMonths(parseISO(moveIn), months), "yyyy-MM-dd");
}

/**
 * The steps a booking goes through after the request, in order.
 * Every screen derives "what happens next" from this, so the student and
 * landlord views never disagree.
 */
export type BookingStage =
  | "awaiting_landlord"
  | "declined"
  | "cancelled"
  | "awaiting_bank_details"
  | "awaiting_payment"
  | "awaiting_payment_confirmation"
  | "awaiting_contract"
  | "awaiting_student_acceptance"
  | "awaiting_countersign"
  | "ready_to_move_in";

export function bookingStage(b: Booking): BookingStage {
  if (b.status === "declined") return "declined";
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "requested") return "awaiting_landlord";
  if (!b.bank) return "awaiting_bank_details";
  if (!b.slip) return "awaiting_payment";
  if (!b.paymentReceived) return "awaiting_payment_confirmation";
  if (b.contracts.length === 0) return "awaiting_contract";
  if (!b.studentAccepted) return "awaiting_student_acceptance";
  if (!b.countersigned) return "awaiting_countersign";
  return "ready_to_move_in";
}

/** The three big steps shown to users (matches the deck's STEP 1–3). */
export function bookingStep(stage: BookingStage): 0 | 1 | 2 | 3 {
  switch (stage) {
    case "awaiting_landlord":
    case "declined":
    case "cancelled":
      return 0;
    case "awaiting_bank_details":
    case "awaiting_payment":
    case "awaiting_payment_confirmation":
      return 1;
    case "awaiting_contract":
    case "awaiting_student_acceptance":
    case "awaiting_countersign":
      return 2;
    case "ready_to_move_in":
      return 3;
  }
}

export const STAGE_COPY: Record<BookingStage, { student: string; landlord: string }> = {
  awaiting_landlord: { student: "Waiting for the landlord to confirm", landlord: "New request. Review and accept or decline." },
  declined: { student: "The landlord declined this request", landlord: "You declined this request" },
  cancelled: { student: "You cancelled this request", landlord: "The student cancelled this request" },
  awaiting_bank_details: { student: "Confirmed! Waiting for payment details", landlord: "Add your bank details so the student can pay" },
  awaiting_payment: { student: "Transfer the reservation and deposit", landlord: "Waiting for the student's transfer" },
  awaiting_payment_confirmation: { student: "Slip uploaded. Waiting for the landlord to confirm", landlord: "Check your account and confirm you received the money" },
  awaiting_contract: { student: "The landlord will upload a rental contract", landlord: "Upload your signed rental contract" },
  awaiting_student_acceptance: { student: "Review the contract and accept it", landlord: "Waiting for the student to review the contract" },
  awaiting_countersign: { student: "Countersign the contract and upload it", landlord: "Waiting for the student's countersigned contract" },
  ready_to_move_in: { student: "All set. Ready to MoveIn!", landlord: "All set. Ready to welcome your student!" },
};

export function totalDue(listing: Pick<Listing, "rent" | "deposit">): number {
  // Reservation = first month's rent, plus the security deposit.
  return listing.rent + listing.deposit;
}

/** Score how well a listing fits a student's room request (0–100). */
export function matchScore(listing: Listing, req: RoomRequest): number {
  let score = 0;
  if (req.roomTypes.includes(listing.roomType)) score += 40;
  if (req.areaIds.length === 0 || req.areaIds.includes(listing.areaId)) score += 30;
  if (listing.rent <= req.budget) score += 20;
  else if (listing.rent <= req.budget * 1.1) score += 10;
  if (listing.minMonths <= req.months) score += 10;
  return score;
}

export function roomTypeOccupants(t: RoomType): number {
  switch (t) {
    case "2br":
    case "shared2":
      return 2;
    case "3br":
    case "shared34":
      return 3;
    default:
      return 1;
  }
}
