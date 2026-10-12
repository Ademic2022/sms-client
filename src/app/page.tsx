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

const BASE_DOMAIN = (process.env.TENANT_BASE_DOMAIN ?? "localhost").toLowerCase();
const PLATFORM_HOSTS = new Set([BASE_DOMAIN, `www.${BASE_DOMAIN}`, `app.${BASE_DOMAIN}`, "127.0.0.1"]);
const API_ORIGIN = process.env.API_ORIGIN ?? "http://127.0.0.1:8000";

/**
 * Whether this address belongs to a school. "<slug>.<base domain>" always does. Any other
 * host (a school's custom domain, or the hosting provider's own address) is checked with
 * the API, and anything it cannot confirm shows the homepage instead of a login screen.
 */
async function isSchoolHost(host: string) {
  if (!host || PLATFORM_HOSTS.has(host)) return false;
  const suffix = `.${BASE_DOMAIN}`;
  if (host.endsWith(suffix)) return !host.slice(0, -suffix.length).includes(".");
  try {
    const response = await fetch(`${API_ORIGIN}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-Host": host },
      body: JSON.stringify({ query: "{ school { slug } }" }),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return false;
    const body = await response.json();
    return Boolean(body?.data?.school?.slug);
  } catch {
    return false;
  }
}

export default async function Home() {
  // A school's own address goes straight to its portal; every other address shows the homepage.
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  if (await isSchoolHost(host)) redirect("/dashboard");

  return (
    <Landing />
  );
}
