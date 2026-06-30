import type { Metadata } from "next";
import { Instrument_Serif, Manrope, Geist } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { cn } from "@/lib/utils";
import SmoothScroll from "@/components/SmoothScroll";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "M. Fatihul Iqmal | Full-stack Web Developer",
  description: "Portfolio of Muhammad Fatihul Iqmal}",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        instrumentSerif.variable,
        manrope.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
