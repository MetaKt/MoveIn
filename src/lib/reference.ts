import type { Area, PlaceKind, PlaceType, RoomType, Station } from "./types";

export const CHULA = { lat: 13.7384, lng: 100.5321, name: "Chulalongkorn University" };

export const AREAS: Area[] = [
  {
    id: "banthat-thong",
    name: "Banthat Thong",
    tagline: "Near restaurants · cafés · parks",
    priceFrom: 20000,
    description:
      "Bangkok's favourite street-food strip runs right along the west side of campus. You can walk to class, and Chula Centenary Park is around the corner.",
    lat: 13.7428,
    lng: 100.5236,
    nearby: {
      grocery: ["Lotus's Go Fresh Banthat Thong", "Big C Mini"],
      dineout: ["Jeh O Chula", "Banthat Thong street food", "Chula Centenary Park cafés"],
      transport: ["CU Pop Bus line 1 & 4", "BTS National Stadium (10 min walk)"],
    },
  },
  {
    id: "samyan-silom",
    name: "Samyan / Silom",
    tagline: "Most popular · modern high-rises",
    priceFrom: 18000,
    description:
      "Samyan and Silom are among the most popular areas for Chula students, with modern high-rise condos, great facilities and the MRT on your doorstep.",
    lat: 13.7322,
    lng: 100.5302,
    nearby: {
      grocery: ["Big C (Chamchuri)", "Big C (Samyan Mitrtown)", "Tops Daily Silom"],
      dineout: ["Samyan Mitrtown food court", "Chamchuri Square", "Silom Soi 20 market"],
      transport: ["MRT Sam Yan", "MRT Si Lom / BTS Sala Daeng", "CU Pop Bus line 2"],
    },
  },
  {
    id: "national-stadium",
    name: "National Stadium",
    tagline: "Central · newer condos",
    priceFrom: 20000,
    description:
      "Right next to Siam's malls and the BTS, with a short ride or walk to the north side of campus. Great if you want city life on your doorstep.",
    lat: 13.7466,
    lng: 100.5292,
    nearby: {
      grocery: ["Tops MBK", "Gourmet Market Siam Paragon"],
      dineout: ["MBK food court", "Siam Square", "Bangkok Art & Culture Centre cafés"],
      transport: ["BTS National Stadium", "BTS Siam interchange"],
    },
  },
  {
    id: "phaya-thai",
    name: "Phaya Thai",
    tagline: "Airport link · city access",
    priceFrom: 15000,
    description:
      "Cheaper rents and a direct Airport Rail Link to Suvarnabhumi. Two BTS stops or a short bus ride to campus.",
    lat: 13.7568,
    lng: 100.5338,
    nearby: {
      grocery: ["Tops Phaya Thai", "7-Eleven Ratchathewi"],
      dineout: ["Victory Monument noodle boats", "Ratchathewi night stalls"],
      transport: ["BTS Phaya Thai", "Airport Rail Link Phaya Thai", "BTS Ratchathewi"],
    },
  },
];

export const STATIONS: Station[] = [
  { id: "bts-national-stadium", name: "National Stadium", line: "BTS Silom", lat: 13.7466, lng: 100.5292, minutesToChula: 10 },
  { id: "bts-siam", name: "Siam", line: "BTS Sukhumvit", lat: 13.7456, lng: 100.5341, minutesToChula: 10 },
  { id: "bts-ratchathewi", name: "Ratchathewi", line: "BTS Sukhumvit", lat: 13.7516, lng: 100.5317, minutesToChula: 15 },
  { id: "bts-phaya-thai", name: "Phaya Thai", line: "BTS Sukhumvit", lat: 13.7568, lng: 100.5338, minutesToChula: 20 },
  { id: "bts-chit-lom", name: "Chit Lom", line: "BTS Sukhumvit", lat: 13.7441, lng: 100.543, minutesToChula: 15 },
  { id: "bts-sala-daeng", name: "Sala Daeng", line: "BTS Silom", lat: 13.7286, lng: 100.5343, minutesToChula: 15 },
  { id: "mrt-sam-yan", name: "Sam Yan", line: "MRT Blue", lat: 13.7324, lng: 100.5297, minutesToChula: 8 },
  { id: "mrt-si-lom", name: "Si Lom", line: "MRT Blue", lat: 13.7297, lng: 100.5362, minutesToChula: 15 },
  { id: "mrt-hua-lamphong", name: "Hua Lamphong", line: "MRT Blue", lat: 13.7378, lng: 100.517, minutesToChula: 15 },
  { id: "mrt-lumphini", name: "Lumphini", line: "MRT Blue", lat: 13.7254, lng: 100.5453, minutesToChula: 20 },
  { id: "arl-phaya-thai", name: "Phaya Thai (Airport Link)", line: "Airport Rail Link", lat: 13.757, lng: 100.5345, minutesToChula: 20 },
];

export const LINE_COLORS: Record<Station["line"], string> = {
  "BTS Sukhumvit": "#58a618",
  "BTS Silom": "#00796b",
  "MRT Blue": "#1e3a8a",
  "Airport Rail Link": "#b91c1c",
};

/** Dummy faculty → area recommendations. MoveIn's team should confirm these. */
export const FACULTIES: { id: string; name: string; areaIds: string[] }[] = [
  { id: "ise", name: "International School of Engineering (ISE)", areaIds: ["banthat-thong", "samyan-silom", "national-stadium"] },
  { id: "bba", name: "Commerce & Accountancy (BBA)", areaIds: ["samyan-silom", "banthat-thong", "phaya-thai"] },
  { id: "bascii", name: "School of Integrated Innovation (BAScii)", areaIds: ["samyan-silom", "national-stadium", "phaya-thai"] },
  { id: "arts", name: "Arts", areaIds: ["national-stadium", "banthat-thong", "phaya-thai"] },
  { id: "polsci", name: "Political Science", areaIds: ["national-stadium", "samyan-silom", "phaya-thai"] },
  { id: "commarts", name: "Communication Arts", areaIds: ["national-stadium", "samyan-silom", "phaya-thai"] },
  { id: "economics", name: "Economics", areaIds: ["samyan-silom", "national-stadium", "phaya-thai"] },
  { id: "science", name: "Science", areaIds: ["banthat-thong", "national-stadium", "samyan-silom"] },
  { id: "medicine", name: "Medicine", areaIds: ["samyan-silom", "banthat-thong", "phaya-thai"] },
  { id: "architecture", name: "Architecture", areaIds: ["banthat-thong", "national-stadium", "samyan-silom"] },
  { id: "other", name: "Other", areaIds: ["samyan-silom", "national-stadium", "phaya-thai"] },
];

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  studio: "Studio",
  "1br": "1 Bedroom",
  "2br": "2 Bedroom",
  "3br": "3 Bedroom",
  shared2: "Shared unit (2 people)",
  shared34: "Shared unit (3–4 people)",
};

export const PLACE_KIND_LABEL: Record<PlaceKind, string> = {
  house: "House",
  apartment: "Apartment",
  condo: "Condo",
  studio: "Studio",
  dormitory: "Dormitory",
  serviced: "Serviced residence",
};

export const PLACE_TYPE_INFO: Record<PlaceType, { label: string; hint: string }> = {
  entire: { label: "An entire place", hint: "Students have the whole place to themselves." },
  room: { label: "A room", hint: "Students get their own room in a home, plus shared spaces." },
  shared: { label: "A shared room", hint: "Students sleep in a shared room with other people." },
};

export const AMENITIES = ["Wi-Fi", "Essentials", "Fridge", "TV", "Hot water", "Washing machine", "Air conditioning", "Kitchen", "Desk"];
export const FACILITIES = ["Swimming pool", "Gym", "Co-working space", "Laundry", "24h security", "Parking", "Rooftop garden", "Shuttle to Chula"];
export const NEARBY = ["7-11", "MRT", "BTS", "Gym", "Central", "Restaurants", "Campus", "Hospital", "Big C"];

export const COUNTRIES: { name: string; code: string }[] = [
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Belgium", code: "BE" },
  { name: "Canada", code: "CA" },
  { name: "China", code: "CN" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "Hong Kong", code: "HK" },
  { name: "India", code: "IN" },
  { name: "Indonesia", code: "ID" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "Korea", code: "KR" },
  { name: "Netherlands", code: "NL" },
  { name: "Norway", code: "NO" },
  { name: "Singapore", code: "SG" },
  { name: "Spain", code: "ES" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Taiwan", code: "TW" },
  { name: "United Kingdom", code: "GB" },
  { name: "United States", code: "US" },
  { name: "Other", code: "UN" },
];

export const FOUND_VIA = ["Instagram", "Facebook", "TikTok", "From a friend", "Fastwork", "Other"];

export const SEMESTERS = [
  { label: "Semester 1 (Aug–Dec)", lookFor: "April – August" },
  { label: "Semester 2 (Jan–May)", lookFor: "October – December" },
];
