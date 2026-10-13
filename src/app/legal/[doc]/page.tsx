import type { Metadata } from "next";
import { notFound } from "next/navigation";

import "@/components/landing/landing.css";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL_DOCS } from "@/content/legal";

type Slug = keyof typeof LEGAL_DOCS;

// The three documents are built once at deploy time; any other /legal/... address is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const doc = LEGAL_DOCS[(await params).doc as Slug];
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const doc = LEGAL_DOCS[(await params).doc as Slug];
  if (!doc) notFound();
  return <LegalDocument doc={doc} />;
}
