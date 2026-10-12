"use client";

import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { NoticeText } from "@/components/privacy/NoticeText";
import { Loading } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";

const PublicNoticeDocument = graphql(`
  query PublicPrivacyNotice {
    privacyNotice { version body publishedAt schoolName }
  }
`);

export default function PrivacyNoticePage() {
  const { data, isLoading } = useGql(PublicNoticeDocument, {});
  const notice = data?.privacyNotice;
  return (
    <AuthShell
      wide
      title="Privacy notice"
      subtitle={notice ? `How ${notice.schoolName} uses your child's information. Version ${notice.version}, ${new Date(notice.publishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}.` : undefined}
      footer={<Link href="/login" className="font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)]">← Back to sign in</Link>}
    >
      {isLoading ? <Loading /> : notice ? <NoticeText body={notice.body} /> : <p className="text-sm text-muted">Open this page from your school&apos;s own web address to read its privacy notice.</p>}
    </AuthShell>
  );
}
