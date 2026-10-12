import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";

import { SITE } from "@/lib/site";

import { Providers } from "./providers";
import "./globals.css";

// One type system for the whole product: a serif for headings, a clean sans for everything else.
const display = Fraunces({ subsets: ["latin"], variable: "--ff-display", style: ["normal", "italic"], display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--ff-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: "Results, fees and communication for your school.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f3d2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
