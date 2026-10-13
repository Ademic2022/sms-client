import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/hosts";

/** The public pages. Everything else is a school's private portal. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  return [
    { url, changeFrequency: "monthly", priority: 1 },
    { url: `${url}/signup`, changeFrequency: "yearly", priority: 0.8 },
  ];
}
