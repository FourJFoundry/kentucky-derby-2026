import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "🏇 Derby Picks 2026",
  description: "Pick your Kentucky Derby winner!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pressStart.variable} ${vt323.variable}`}>
      <body className="min-h-screen relative">
        {/* Fixed header: ticker + nav */}
        <div className="fixed top-0 left-0 right-0 z-30">
          <div className="bg-derby-red border-b-4 border-black overflow-hidden h-10 flex items-center">
            <div className="ticker-inner text-white font-arcade text-2xl px-8">
              🏇 2026 KENTUCKY DERBY &nbsp;·&nbsp; RACE DAY MAY 2nd &nbsp;·&nbsp;
              POST TIME ~6:57 PM ET &nbsp;·&nbsp; PICK YOUR WINNER! 🏆
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              🏇 2026 KENTUCKY DERBY &nbsp;·&nbsp; RACE DAY MAY 2nd &nbsp;·&nbsp;
              POST TIME ~6:57 PM ET &nbsp;·&nbsp; PICK YOUR WINNER! 🏆
            </div>
          </div>
          <NavBar />
        </div>
        <main className="relative z-10 pt-[88px]">{children}</main>
      </body>
    </html>
  );
}
