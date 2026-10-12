import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Landing } from "@/components/landing/Landing";
import "@/components/landing/landing.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} · Report cards and school fees for Nigerian schools`,
  description:
    "Termly report cards that compute themselves and school fees parents can pay online. For private nursery, primary and secondary schools in Nigeria.",
};

const BASE_DOMAIN = process.env.TENANT_BASE_DOMAIN ?? "localhost";
const PLATFORM_HOSTS = new Set([BASE_DOMAIN, `www.${BASE_DOMAIN}`, `app.${BASE_DOMAIN}`, "127.0.0.1"]);

export default async function Home() {
  // A school's own address goes straight to its portal; only the platform address shows the homepage.
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (host && !PLATFORM_HOSTS.has(host)) redirect("/dashboard");

  return (
    <Landing />
  );
}
