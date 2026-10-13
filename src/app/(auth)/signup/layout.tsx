import type { Metadata } from "next";

import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start your free trial",
  description: `Set up ${SITE.name} for your school in minutes. ${SITE.trialDays} days free, no card needed. Report cards, school fees and SMS for Nigerian schools.`,
  alternates: { canonical: "/signup" },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: LayoutProps<"/signup">) {
  return children;
}
