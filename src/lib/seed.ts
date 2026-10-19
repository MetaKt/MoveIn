import type { Booking, BuddyApplication, BuddyRequest, Listing, Proposal, RoomRequest, User } from "./types";

const T = "2026-10-01T09:00:00.000Z";

export const SEED_USERS: User[] = [
  {
    id: "u_nuhr", role: "student", firstName: "Nuhr", lastName: "Obama", email: "nuhr.obama@example.com", whatsapp: "+45 20 12 34 56", createdAt: T,
    student: { gender: "male", age: 21, country: "Denmark", countryCode: "DK", homeUniversity: "Copenhagen Business School", faculty: "bba", notifications: true },
  },
  {
    id: "u_kevin", role: "student", firstName: "Kevin", lastName: "Tran", email: "kevin.tran@example.com", whatsapp: "+1 415 555 0134", createdAt: T,
    student: { gender: "male", age: 22, country: "United States", countryCode: "US", homeUniversity: "UC Berkeley", faculty: "ise", notifications: true },
  },
  {
    id: "u_david", role: "student", firstName: "David", lastName: "Müller", email: "david.mueller@example.com", whatsapp: "+41 79 555 01 22", createdAt: T,
    student: { gender: "male", age: 20, country: "Switzerland", countryCode: "CH", homeUniversity: "University of St. Gallen", faculty: "economics", notifications: true },
  },
  {
    id: "u_lukas", role: "student", firstName: "Lukas", lastName: "Meyer", email: "lukas.meyer@example.com", whatsapp: "+49 151 5550 1234", createdAt: T,
    student: { gender: "male", age: 22, country: "Germany", countryCode: "DE", homeUniversity: "TU Munich", faculty: "ise", notifications: true },
  },
  {
    id: "u_aiko", role: "student", firstName: "Aiko", lastName: "Tanaka", email: "aiko.tanaka@example.com", whatsapp: "+81 90 5555 0123", createdAt: T,
    student: { gender: "female", age: 21, country: "Japan", countryCode: "JP", homeUniversity: "Waseda University", faculty: "polsci", notifications: true },
  },
  {
    id: "u_sofia", role: "student", firstName: "Sofia", lastName: "Rossi", email: "sofia.rossi@example.com", whatsapp: "+39 333 555 0123", createdAt: T,
    student: { gender: "female", age: 23, country: "Italy", countryCode: "IT", homeUniversity: "Bocconi University", faculty: "bba", notifications: false },
  },
  {
    id: "u_emma", role: "student", firstName: "Emma", lastName: "Larsen", email: "emma.larsen@example.com", whatsapp: "+45 31 55 50 12", createdAt: T,
    student: { gender: "female", age: 22, country: "Denmark", countryCode: "DK", homeUniversity: "Aarhus University", faculty: "commarts", notifications: true },
  },
  {
    id: "u_somchai", role: "landlord", firstName: "Somchai", lastName: "Wongsa", email: "somchai.w@example.com", whatsapp: "+66 81 234 5678", createdAt: T,
    landlord: { phone: "+66 81 234 5678", verified: true, hostSince: 2026, idDocument: { name: "thai-id-somchai.jpg", size: 182000, type: "image/jpeg", uploadedAt: T } },
  },
  {
    id: "u_nattaya", role: "landlord", firstName: "Nattaya", lastName: "Srisuk", email: "nattaya.s@example.com", whatsapp: "+66 89 555 0199", createdAt: T,
    landlord: { phone: "+66 89 555 0199", verified: true, hostSince: 2025, idDocument: { name: "thai-id-nattaya.jpg", size: 175000, type: "image/jpeg", uploadedAt: T } },
  },
  {
    id: "u_wichai", role: "landlord", firstName: "Wichai", lastName: "Thongdee", email: "wichai.t@example.com", whatsapp: "+66 86 555 0147", createdAt: T,
    landlord: { phone: "+66 86 555 0147", verified: false, hostSince: 2026 },
  },
  {
    id: "u_pakin", role: "buddy", firstName: "Pakin", lastName: "Ruchadatid", email: "pakin.r@example.com", whatsapp: "+66 81 234 5678", createdAt: T,
    buddy: { university: "Chulalongkorn University", faculty: "BAScii", year: 4, phone: "+66 81 234 5678" },
  },
  {
    id: "u_napat", role: "buddy", firstName: "Napat", lastName: "Chaiyasit", email: "napat.c@example.com", whatsapp: "+66 92 555 0110", createdAt: T,
    buddy: { university: "Chulalongkorn University", faculty: "ISE", year: 3, phone: "+66 92 555 0110" },
  },
  { id: "u_admin", role: "admin", firstName: "MoveIn", lastName: "Team", email: "team@movein.example", whatsapp: "+66 2 555 0100", createdAt: T },
];

const base = {
  reviewEachRequest: true,
  safety: { exteriorCamera: true, noiseMonitor: false },
  placeKind: "condo" as const,
  placeType: "entire" as const,
  createdAt: T,
  reviews: [],
};

export const SEED_LISTINGS: Listing[] = [
  {
    ...base, id: "l_po_studio", landlordId: "u_somchai", source: "partner", title: "Bright studio at Park Origin Phayathai", building: "Park Origin Phayathai",
    areaId: "phaya-thai", address: "Phaya Thai Rd, Thanon Phaya Thai, Ratchathewi, Bangkok 10400", lat: 13.7563, lng: 100.5328,
    roomType: "studio", sizeSqm: 28, guests: 1, bedrooms: 0, beds: 1, bathrooms: 1, rent: 18000, deposit: 36000, minMonths: 4, availableFrom: "2027-01-05",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning"], nearby: ["BTS", "7-11", "Hospital"],
    facilities: ["Swimming pool", "Gym", "Co-working space", "24h security"], photos: ["/rooms/interior-2.jpg", "/rooms/building-1.jpg", "/rooms/pool.jpg", "/rooms/coworking.jpg"],
    description: "A cosy, fully furnished studio two minutes from BTS Phaya Thai and the Airport Rail Link. Rooftop pool, gym and a quiet co-working floor for study nights.",
    status: "on_market",
    reviews: [{ author: "Abbas", country: "AE", months: 5, rating: 5, text: "I lived in this place for 5 months. It was so convenient travelling to campus and around BKK. The landlord was kind and took care of everything properly!" }],
  },
  {
    ...base, id: "l_po_1br", landlordId: "u_somchai", source: "partner", title: "1-Bedroom with city view, Park Origin Phayathai", building: "Park Origin Phayathai",
    areaId: "phaya-thai", address: "Phaya Thai Rd, Thanon Phaya Thai, Ratchathewi, Bangkok 10400", lat: 13.7563, lng: 100.5328,
    roomType: "1br", sizeSqm: 35, guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, rent: 20000, deposit: 40000, minMonths: 4, availableFrom: "2027-01-05",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning", "Desk"], nearby: ["BTS", "7-11", "Hospital"],
    facilities: ["Swimming pool", "Gym", "Co-working space", "24h security"], photos: ["/rooms/interior-1.jpg", "/rooms/building-1.jpg", "/rooms/pool.jpg", "/rooms/lobby.jpg"],
    description: "Separate bedroom and living room with floor-to-ceiling windows. Perfect if you want space to study and have friends over.",
    status: "on_market",
    reviews: [{ author: "Abbas", country: "AE", months: 5, rating: 5, text: "I lived in this place for 5 months. It was so convenient travelling to campus and around BKK. The landlord was kind and took care of everything properly!" }],
  },
  {
    ...base, id: "l_po_2br", landlordId: "u_somchai", source: "partner", title: "2-Bedroom corner unit, Park Origin Phayathai", building: "Park Origin Phayathai",
    areaId: "phaya-thai", address: "Phaya Thai Rd, Thanon Phaya Thai, Ratchathewi, Bangkok 10400", lat: 13.7563, lng: 100.5328,
    roomType: "2br", sizeSqm: 55, guests: 2, bedrooms: 2, beds: 2, bathrooms: 2, rent: 32000, deposit: 64000, minMonths: 5, availableFrom: "2027-06-01",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning", "Kitchen"], nearby: ["BTS", "7-11"],
    facilities: ["Swimming pool", "Gym", "Co-working space", "24h security"], photos: ["/rooms/interior-4.jpg", "/rooms/building-1.jpg", "/rooms/pool.jpg"],
    description: "Two bedrooms, two bathrooms. Great for two friends sharing.",
    status: "off_market", tenancy: { studentName: "Lukas Meyer", endsOn: "2027-05-31" },
  },
  {
    ...base, id: "l_ashton_1br", landlordId: "u_nattaya", source: "takeover", title: "Take over my 1-Bedroom at Ashton Chula-Silom", building: "Ashton Chula-Silom",
    areaId: "samyan-silom", address: "Rama IV Rd, Maha Phruettharam, Bang Rak, Bangkok 10500", lat: 13.733, lng: 100.53,
    roomType: "1br", sizeSqm: 32, guests: 1, bedrooms: 1, beds: 1, bathrooms: 1, rent: 16500, deposit: 33000, minMonths: 4, availableFrom: "2027-01-02",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning", "Desk"], nearby: ["MRT", "Campus", "Big C"],
    facilities: ["Swimming pool", "Gym", "Shuttle to Chula", "24h security"], photos: ["/rooms/interior-3.jpg", "/rooms/garden.jpg", "/rooms/pool.jpg"],
    description: "I'm finishing my exchange in December. The building has a free shuttle to Chula and the MRT is right downstairs. I can leave my rice cooker and desk lamp!",
    status: "on_market", currentTenant: { name: "Emma Larsen", country: "Denmark", countryCode: "DK", leavesOn: "2026-12-28" },
    reviews: [{ author: "Emma", country: "DK", months: 5, rating: 5, text: "Five minutes to class on the shuttle and the gym is never busy. Nattaya replies super fast." }],
  },
  {
    ...base, id: "l_cooper_1br", landlordId: "u_nattaya", source: "partner", title: "Furnished 1-Bedroom at Cooper Siam", building: "Cooper Siam",
    areaId: "national-stadium", address: "Rama I Rd, Rong Muang, Pathum Wan, Bangkok 10330", lat: 13.748, lng: 100.526,
    roomType: "1br", sizeSqm: 32, guests: 1, bedrooms: 1, beds: 1, bathrooms: 1, rent: 22000, deposit: 44000, minMonths: 4, availableFrom: "2027-01-05",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning"], nearby: ["BTS", "Central", "Restaurants"],
    facilities: ["Swimming pool", "Gym", "Rooftop garden", "24h security"], photos: ["/rooms/interior-4.jpg", "/rooms/lobby.jpg", "/rooms/pool.jpg"],
    description: "Brand-new building, 5 minutes to BTS National Stadium and MBK. Walk to the north side of campus.",
    status: "on_market",
  },
  {
    ...base, id: "l_cooper_2br", landlordId: "u_nattaya", source: "takeover", title: "Take over our 2-Bedroom at Cooper Siam", building: "Cooper Siam",
    areaId: "national-stadium", address: "Rama I Rd, Rong Muang, Pathum Wan, Bangkok 10330", lat: 13.748, lng: 100.526,
    roomType: "2br", sizeSqm: 52, guests: 2, bedrooms: 2, beds: 2, bathrooms: 2, rent: 40000, deposit: 80000, minMonths: 5, availableFrom: "2027-01-05",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning", "Kitchen"], nearby: ["BTS", "Central", "Restaurants"],
    facilities: ["Swimming pool", "Gym", "Rooftop garden", "24h security"], photos: ["/rooms/interior-1.jpg", "/rooms/coworking.jpg", "/rooms/pool.jpg"],
    description: "Two of us from Denmark are leaving after semester 1. Big living room, perfect for two friends.",
    status: "on_market", currentTenant: { name: "Mads Jensen", country: "Denmark", countryCode: "DK", leavesOn: "2026-12-30" },
  },
  {
    ...base, id: "l_ideo_studio", landlordId: "u_nattaya", source: "partner", title: "Studio at Ideo Q Chula-Samyan", building: "Ideo Q Chula-Samyan",
    areaId: "samyan-silom", address: "Rama IV Rd, Maha Phruettharam, Bang Rak, Bangkok 10500", lat: 13.7344, lng: 100.5282,
    roomType: "studio", sizeSqm: 24, guests: 1, bedrooms: 0, beds: 1, bathrooms: 1, rent: 15500, deposit: 31000, minMonths: 3, availableFrom: "2026-12-15",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "Hot water", "Air conditioning", "Desk"], nearby: ["MRT", "Campus", "Big C", "7-11"],
    facilities: ["Swimming pool", "Gym", "Laundry", "24h security"], photos: ["/rooms/interior-2.jpg", "/rooms/garden.jpg", "/rooms/lobby.jpg"],
    description: "Compact and modern, 3 minutes from MRT Sam Yan and Samyan Mitrtown.",
    status: "on_market",
  },
  {
    ...base, id: "l_triple_y", landlordId: "u_somchai", source: "takeover", title: "Take over my 1-Bedroom at Triple Y Residence", building: "Triple Y Residence",
    areaId: "samyan-silom", address: "Rama IV Rd, Wang Mai, Pathum Wan, Bangkok 10330", lat: 13.7338, lng: 100.528,
    roomType: "1br", sizeSqm: 30, guests: 1, bedrooms: 1, beds: 1, bathrooms: 1, rent: 19000, deposit: 38000, minMonths: 4, availableFrom: "2027-01-03",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Air conditioning"], nearby: ["MRT", "Campus", "Big C", "Gym"],
    facilities: ["Swimming pool", "Gym", "Co-working space", "24h security"], photos: ["/rooms/interior-3.jpg", "/rooms/coworking.jpg", "/rooms/pool.jpg"],
    description: "Directly connected to Samyan Mitrtown (24h). Leaving after my exchange, happy to show you around on video.",
    status: "on_market", currentTenant: { name: "Sofia Rossi", country: "Italy", countryCode: "IT", leavesOn: "2026-12-31" },
  },
  {
    ...base, id: "l_chapter_shared", landlordId: "u_somchai", source: "partner", title: "Shared 2-person unit at Chapter Chula-Samyan", building: "Chapter Chula-Samyan",
    areaId: "samyan-silom", address: "Rama IV Rd, Maha Phruettharam, Bang Rak, Bangkok 10500", lat: 13.731, lng: 100.525,
    roomType: "shared2", placeType: "shared", sizeSqm: 40, guests: 2, bedrooms: 1, beds: 2, bathrooms: 1, rent: 24000, deposit: 48000, minMonths: 4, availableFrom: "2027-01-05",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning"], nearby: ["MRT", "Campus", "Restaurants"],
    facilities: ["Swimming pool", "Gym", "Laundry"], photos: ["/rooms/interior-1.jpg", "/rooms/garden.jpg"],
    description: "Split the rent with a friend: ฿12,000 each. Two single beds, big wardrobe, and the MRT is 5 minutes away.",
    status: "on_market",
  },
  {
    ...base, id: "l_banthat_room", landlordId: "u_wichai", source: "partner", title: "Private room in a townhouse on Banthat Thong", building: "Banthat Thong Townhouse",
    areaId: "banthat-thong", address: "Banthat Thong Rd, Wang Mai, Pathum Wan, Bangkok 10330", lat: 13.7431, lng: 100.5232,
    placeKind: "house", placeType: "room", roomType: "studio", sizeSqm: 18, guests: 1, bedrooms: 1, beds: 1, bathrooms: 1, rent: 12000, deposit: 12000, minMonths: 3, availableFrom: "2027-01-01",
    amenities: ["Wi-Fi", "Essentials", "Fridge", "Hot water", "Air conditioning", "Desk"], nearby: ["Campus", "Restaurants", "7-11"],
    facilities: ["Laundry"], photos: ["/rooms/interior-2.jpg", "/rooms/garden.jpg"],
    description: "Live like a local on Bangkok's best street-food road. Your own bedroom and bathroom, shared kitchen and rooftop.",
    status: "pending",
  },
];

export const SEED_REQUESTS: RoomRequest[] = [
  {
    id: "r_nuhr", studentId: "u_nuhr", months: 5, moveIn: "2027-01-05", moveOut: "2027-06-05", roomTypes: ["studio", "1br"], budget: 18000,
    areaIds: ["samyan-silom", "phaya-thai"], facilities: "Gym and a desk to study", notes: "I am a junior student from Denmark coming to Chulalongkorn.", occupants: 1,
    status: "open", createdAt: T, updatedAt: T,
  },
  {
    id: "r_kevin", studentId: "u_kevin", months: 5, moveIn: "2027-01-05", moveOut: "2027-06-05", roomTypes: ["2br", "shared2"], budget: 32000,
    areaIds: ["samyan-silom", "national-stadium"], facilities: "Pool, kitchen", notes: "Kevin and Jackson, two friends from UC Berkeley.", occupants: 2,
    status: "open", createdAt: T, updatedAt: T,
  },
  {
    id: "r_david", studentId: "u_david", months: 4, moveIn: "2027-01-10", moveOut: "2027-05-10", roomTypes: ["studio"], budget: 15500,
    areaIds: ["samyan-silom", "banthat-thong"], facilities: "", notes: "Quiet place please, I study late.", occupants: 1,
    status: "open", createdAt: T, updatedAt: T,
  },
];

export const SEED_PROPOSALS: Proposal[] = [
  { id: "p_1", requestId: "r_nuhr", listingId: "l_po_studio", landlordId: "u_somchai", createdAt: T },
  { id: "p_2", requestId: "r_nuhr", listingId: "l_ideo_studio", landlordId: "u_nattaya", createdAt: T },
];

const emptyBooking = {
  tourVideoRequested: false,
  landlordAcknowledgedId: false,
  paymentReceived: false,
  contractTeamRequested: false,
  contracts: [],
  studentAccepted: false,
  buddyRequested: false,
  helpRequested: false,
  note: "",
  guests: 1,
};

const file = (name: string, type = "application/pdf", size = 240000) => ({ name, type, size, uploadedAt: T });

export const SEED_BOOKINGS: Booking[] = [
  {
    ...emptyBooking, id: "b_nuhr_po", listingId: "l_po_1br", studentId: "u_nuhr", landlordId: "u_somchai", moveIn: "2027-01-05", months: 5,
    note: "Hi! Could you show me the view from the balcony?", passport: file("passport-nuhr.jpg", "image/jpeg", 410000), tourVideoRequested: true,
    status: "requested", createdAt: "2026-10-08T10:00:00.000Z", updatedAt: "2026-10-08T10:00:00.000Z",
  },
  {
    ...emptyBooking, id: "b_aiko_cooper", listingId: "l_cooper_1br", studentId: "u_aiko", landlordId: "u_nattaya", moveIn: "2027-02-01", months: 4,
    passport: file("passport-aiko.jpg", "image/jpeg", 380000), status: "accepted", landlordAcknowledgedId: true,
    bank: { bank: "Kasikornbank", swift: "KASITHBK", accountName: "Nattaya Srisuk", accountNumber: "123-4-56789-0", bankAddress: "1 Rat Burana Rd, Bangkok 10140", recipientAddress: "88 Rama I Rd, Bangkok 10330" },
    totalPayment: 66000, slip: file("transfer-slip-aiko.pdf"), paymentReceived: true, buddyRequested: true,
    createdAt: "2026-09-20T10:00:00.000Z", updatedAt: "2026-10-02T10:00:00.000Z",
  },
  {
    ...emptyBooking, id: "b_lukas_po", listingId: "l_po_2br", studentId: "u_lukas", landlordId: "u_somchai", moveIn: "2026-08-01", months: 10,
    passport: file("passport-lukas.jpg", "image/jpeg", 390000), status: "completed", landlordAcknowledgedId: true,
    bank: { bank: "Bangkok Bank", swift: "BKKBTHBK", accountName: "Somchai Wongsa", accountNumber: "987-6-54321-0", bankAddress: "333 Silom Rd, Bangkok 10500", recipientAddress: "12 Phaya Thai Rd, Bangkok 10400" },
    totalPayment: 96000, slip: file("transfer-slip-lukas.pdf"), paymentReceived: true,
    contracts: [{ ...file("rental-contract-v1.pdf"), version: 1 }], studentAccepted: true, countersigned: file("rental-contract-countersigned.pdf"),
    whatsappGroupUrl: "https://chat.whatsapp.com/demo-lukas-po", buddyRequested: true,
    createdAt: "2026-06-10T10:00:00.000Z", updatedAt: "2026-07-01T10:00:00.000Z",
  },
];

export const SEED_BUDDY_REQUESTS: BuddyRequest[] = [
  { id: "br_lukas", studentId: "u_lukas", buddyId: "u_pakin", bookingId: "b_lukas_po", arrivalDate: "2027-01-12", stage: "choosing", createdAt: T },
  { id: "br_aiko", studentId: "u_aiko", buddyId: "u_pakin", bookingId: "b_aiko_cooper", arrivalDate: "2027-02-03", stage: "arriving", createdAt: T },
  { id: "br_sofia", studentId: "u_sofia", buddyId: "u_pakin", arrivalDate: "2026-08-06", stage: "settled", createdAt: T },
  { id: "br_david", studentId: "u_david", stage: "matching", createdAt: "2026-10-09T10:00:00.000Z" },
];

export const SEED_APPLICATIONS: BuddyApplication[] = [
  {
    id: "a_thanawat", firstName: "Thanawat", lastName: "Kittisak", university: "Chulalongkorn University", faculty: "Engineering", year: 2, email: "thanawat.k@example.com",
    phone: "+66 95 555 0101", otherChannel: "LINE", otherId: "thanawat.k", whatsapp: "+66 95 555 0101", whyMoveIn: "I love the mission of helping new students feel at home.",
    whyBuddy: "I was an exchange student in Japan and a buddy changed my whole semester.", foundVia: "Instagram", status: "pending", createdAt: "2026-10-07T08:00:00.000Z",
  },
  {
    id: "a_ploy", firstName: "Ploy", lastName: "Suwan", university: "Chulalongkorn University", faculty: "Arts", year: 3, email: "ploy.s@example.com",
    phone: "+66 96 555 0177", otherChannel: "Instagram", otherId: "@ploy.s", whatsapp: "+66 96 555 0177", whyMoveIn: "Friends recommended it.",
    whyBuddy: "I want to practise English and make international friends.", foundVia: "From a friend", status: "pending", createdAt: "2026-10-09T08:00:00.000Z",
  },
];
