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
 * Whether this address belongs to a school, as confirmed by the API. The address alone is
 * not enough: "<slug>.<base domain>" may be a school that does not exist, and a hosting
 * provider's address (e.g. *.vercel.app) can look like a subdomain if the base domain is
 * set to the provider's domain. Anything the API cannot confirm, including when the API is
 * unreachable, shows the homepage rather than sending visitors to a portal that won't load.
 */
async function isSchoolHost(host: string) {
  if (!host || PLATFORM_HOSTS.has(host)) return false;
  try {
    // A GET query: read-only, so Django's CSRF check (which a POST without a cookie fails) does not apply.
    const response = await fetch(`${API_ORIGIN}/graphql?${new URLSearchParams({ query: "{ school { slug } }" })}`, {
      headers: { "X-Forwarded-Host": host },
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
