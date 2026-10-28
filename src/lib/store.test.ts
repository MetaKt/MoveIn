import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "./store";

const file = { name: "f.pdf", size: 1, type: "application/pdf", uploadedAt: "2026-01-01" };
const bank = { bank: "B", swift: "KASITHBK", accountName: "A", accountNumber: "1", bankAddress: "x", recipientAddress: "y" };

describe("booking flow in the demo store", () => {
  beforeEach(() => useStore.getState().resetDemo());

  it("takes the room off the market once the contract is countersigned", () => {
    const s = useStore.getState;
    s().signIn("u_kevin");
    const b = s().createBooking({ listingId: "l_ideo_studio", moveIn: "2027-01-05", months: 5, guests: 1, note: "", tourVideoRequested: false, passport: file });
    s().acknowledgeLandlordId(b.id);
    s().acceptBooking(b.id);
    s().setBankDetails(b.id, bank, 54000);
    s().uploadSlip(b.id, file);
    s().confirmPayment(b.id);
    s().uploadContract(b.id, file);
    s().acceptContract(b.id);
    expect(s().listings.find((l) => l.id === "l_ideo_studio")?.status).toBe("on_market");
    s().uploadCountersigned(b.id, file);
    const room = s().listings.find((l) => l.id === "l_ideo_studio");
    expect(room?.status).toBe("off_market");
    expect(room?.tenancy).toEqual({ studentName: "Kevin Tran", endsOn: "2027-06-05" });
  });
});
