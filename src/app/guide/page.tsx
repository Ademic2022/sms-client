import type { Metadata } from "next";

import "@/components/landing/landing.css";
import { GuideDocument } from "@/components/guide/GuideDocument";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "User guide",
  description: `How school owners, admins, bursars, teachers and parents use ${SITE.name}: setup, attendance, results, fees, online payments and troubleshooting.`,
  alternates: { canonical: "/guide" },
  robots: { index: true, follow: true },
};

export default function GuidePage() {
  return <GuideDocument />;
}
