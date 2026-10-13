import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { hostname, isPlatformHost, siteUrl } from "@/lib/hosts";

// Private areas, behind sign-in or served by the API. Search engines have no business there.
// Sign-in, password reset and privacy pages are not listed: they carry a "noindex" tag, and
// search engines only see that tag if they are allowed to fetch the page.
const PRIVATE = [
  "/dashboard", "/students", "/attendance", "/scores", "/results", "/fees", "/messages",
  "/settings", "/audit", "/console", "/parent",
  "/graphql", "/api/", "/files/", "/payments/", "/webhooks/",
];

/**
 * Different per address: the platform's own address lets search engines in to the public
 * pages; a school's address (its private portal) keeps them out entirely.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = hostname((await headers()).get("host"));
  if (!isPlatformHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
