import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Celebrity Bulaye — Book Bollywood Stars, Singers & Influencers",
  description:
    "India's premier verified celebrity booking platform. Connect directly with Bollywood actors, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate events, and concerts.",
  keywords: [
    "celebrity booking",
    "book bollywood stars",
    "wedding singers",
    "hire comedian",
    "influencer booking india",
    "celebrity bulaye",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-[#9B111E] selection:text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
