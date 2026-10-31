import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai, Plus_Jakarta_Sans } from "next/font/google";
import { LangSync } from "@/components/language-switch";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
// Jakarta has no Thai glyphs, so Thai text falls through to Noto Sans Thai.
const thai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-thai", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MoveIn · Rooms & buddies for Chula exchange students", template: "%s · MoveIn" },
  description:
    "Find a room near Chulalongkorn University from partner landlords or former exchange students, and get a Thai buddy to help you settle into Bangkok.",
};

export const viewport: Viewport = { themeColor: "#0f66d0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${thai.variable}`}>
      <body className="min-h-dvh font-sans">
        <LangSync />
        {children}
      </body>
    </html>
  );
}
