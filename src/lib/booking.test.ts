import { describe, expect, it } from "vitest";
import { bookingStage, bookingStep, matchScore, moveOutDate, totalDue } from "./booking";
import { safeNext } from "./format";
import { SEED_BOOKINGS, SEED_LISTINGS, SEED_REQUESTS } from "./seed";
import type { Booking } from "./types";

const base: Booking = { ...SEED_BOOKINGS[0], status: "requested" };
const file = { name: "f.pdf", size: 1, type: "application/pdf", uploadedAt: "2026-01-01" };
const bank = { bank: "B", swift: "KASITHBK", accountName: "A", accountNumber: "1", bankAddress: "x", recipientAddress: "y" };

describe("moveOutDate", () => {
  it("adds whole months to the move-in date", () => {
    expect(moveOutDate("2027-01-05", 5)).toBe("2027-06-05");
  });
  it("clamps to the end of shorter months", () => {
    expect(moveOutDate("2027-01-31", 1)).toBe("2027-02-28");
  });
});

describe("bookingStage", () => {
  it("walks through every step in order", () => {
    let b: Booking = { ...base };
    expect(bookingStage(b)).toBe("awaiting_landlord");
    b = { ...b, status: "accepted" };
    expect(bookingStage(b)).toBe("awaiting_bank_details");
    b = { ...b, bank, totalPayment: 1 };
    expect(bookingStage(b)).toBe("awaiting_payment");
    b = { ...b, slip: file };
    expect(bookingStage(b)).toBe("awaiting_payment_confirmation");
    b = { ...b, paymentReceived: true };
    expect(bookingStage(b)).toBe("awaiting_contract");
    b = { ...b, contracts: [{ ...file, version: 1 }] };
    expect(bookingStage(b)).toBe("awaiting_student_acceptance");
    b = { ...b, studentAccepted: true };
    expect(bookingStage(b)).toBe("awaiting_countersign");
    b = { ...b, countersigned: file, status: "completed" };
    expect(bookingStage(b)).toBe("ready_to_move_in");
  });

  it("maps stages to the three big steps", () => {
    expect(bookingStep("awaiting_landlord")).toBe(0);
    expect(bookingStep("awaiting_payment")).toBe(1);
    expect(bookingStep("awaiting_countersign")).toBe(2);
    expect(bookingStep("ready_to_move_in")).toBe(3);
  });

  it("treats declined and cancelled as terminal", () => {
    expect(bookingStage({ ...base, status: "declined", bank })).toBe("declined");
    expect(bookingStage({ ...base, status: "cancelled" })).toBe("cancelled");
  });
});

describe("matchScore", () => {
  const nuhr = SEED_REQUESTS.find((r) => r.id === "r_nuhr")!;
  it("scores a room that fits type, area, budget and length at 100", () => {
    const ideo = SEED_LISTINGS.find((l) => l.id === "l_ideo_studio")!;
    expect(matchScore(ideo, nuhr)).toBe(100);
  });
  it("scores a wrong room type lower", () => {
    const twoBed = SEED_LISTINGS.find((l) => l.id === "l_cooper_2br")!;
    expect(matchScore(twoBed, nuhr)).toBeLessThan(70);
  });
});

describe("totalDue", () => {
  it("is first month plus deposit", () => {
    expect(totalDue({ rent: 18000, deposit: 36000 })).toBe(54000);
  });
});

describe("safeNext", () => {
  it("allows same-site paths", () => expect(safeNext("/rooms", "/")).toBe("/rooms"));
  it("blocks protocol-relative and absolute URLs", () => {
    expect(safeNext("//evil.com", "/")).toBe("/");
    expect(safeNext("https://evil.com", "/")).toBe("/");
    expect(safeNext("/\\evil.com", "/")).toBe("/");
  });
});
