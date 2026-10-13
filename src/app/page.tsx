import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Landing } from "@/components/landing/Landing";
import "@/components/landing/landing.css";
import { FAQS } from "@/components/landing/faqs";
import { hostname, isPlatformHost, siteUrl } from "@/lib/hosts";
import { SEO, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SEO.title} | ${SITE.name}` },
  description: SEO.description,
  keywords: SEO.keywords,
  alternates: { canonical: "/" },
  // A page's openGraph and twitter replace the layout's rather than merging, so repeat them.
  openGraph: { title: `${SITE.name}: ${SITE.tagline}`, description: SEO.description, url: "/", siteName: SITE.name, locale: "en_NG", type: "website" },
  twitter: { card: "summary_large_image", title: `${SITE.name}: ${SITE.tagline}`, description: SEO.description },
  robots: { index: true, follow: true },
};

const API_ORIGIN = process.env.API_ORIGIN ?? "http://127.0.0.1:8000";

/**
 * Whether this address belongs to a school, as confirmed by the API. The address alone is
 * not enough: "<slug>.<base domain>" may be a school that does not exist, and a hosting
 * provider's address (e.g. *.vercel.app) can look like a subdomain if the base domain is
 * set to the provider's domain. Anything the API cannot confirm, including when the API is
 * unreachable, shows the homepage rather than sending visitors to a portal that won't load.
 */
async function isSchoolHost(host: string) {
  if (isPlatformHost(host)) return false;
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
  const host = hostname((await headers()).get("host"));
  if (await isSchoolHost(host)) redirect("/dashboard");

  return (
    <>
      <StructuredData />
      <Landing />
    </>
  );
}

/**
 * Facts search engines can use for rich results: who we are, what the product costs, and
 * the answers to common questions. Kept in step with the page by reading the same data.
 */
function StructuredData() {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE.name,
        url,
        logo: `${url}/icon.svg`,
        email: SITE.contactEmail,
        areaServed: { "@type": "Country", name: "Nigeria" },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE.name,
        inLanguage: "en-NG",
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        description: SEO.description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Android, iOS",
        url,
        offers: {
          "@type": "Offer",
          price: SITE.pricePerStudentNaira,
          priceCurrency: "NGN",
          description: `Per active student, per term. ${SITE.trialDays}-day free trial.`,
        },
        publisher: { "@id": `${url}/#organization` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so no text in the data can close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
