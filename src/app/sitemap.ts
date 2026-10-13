import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/hosts";

/** The public pages. Everything else is a school's private portal. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  return [
    { url, changeFrequency: "monthly", priority: 1 },
    { url: `${url}/signup`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${url}/guide`, changeFrequency: "monthly", priority: 0.6 },
    ...["privacy", "dpa", "terms"].map((doc) => ({ url: `${url}/legal/${doc}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
