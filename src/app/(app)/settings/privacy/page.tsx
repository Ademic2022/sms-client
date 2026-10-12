"use client";

import Link from "next/link";
import { useState } from "react";

import { NoticeText } from "@/components/privacy/NoticeText";
import { SettingsNav } from "@/components/SettingsNav";
import { ActionDialog, Badge, Button, Card, ErrorNote, Field, Loading, Notice, PageHeader, RowLink, Stat, Tabs, Textarea } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { useSession } from "@/lib/session";

const OverviewDocument = graphql(`
  query ConsentOverview {
    consentOverview(limit: 50) {
      notice { version body publishedAt }
      activeStudents withConsent dpaVersion dpaAcceptedAt dpaAcceptedBy
      missing { id fullName admissionNumber currentArm { label } }
    }
  }
`);

const PublishDocument = graphql(`
  mutation PublishPrivacyNotice($body: String!) { publishPrivacyNotice(body: $body) { version } }
`);

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default function PrivacySettingsPage() {
  const { can } = useSession();
  const allowed = can("school.manage");
  const { data, error, isLoading, mutate } = useGql(OverviewDocument, allowed ? {} : null);
  const o = data?.consentOverview;
  const [body, setBody] = useDerivedState(o?.notice, (n) => n.body, "");
  const [view, setView] = useState<"read" | "edit">("read");
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!allowed) return <><PageHeader title="Settings" /><SettingsNav /><Notice>Only the school owner or an administrator can manage privacy settings.</Notice></>;
  if (isLoading) return <Loading />;
  if (error || !o) return <ErrorNote error={error} />;

  const pct = o.activeStudents ? Math.round((o.withConsent / o.activeStudents) * 100) : 0;
  const changed = body.trim() !== o.notice.body.trim();
  const remaining = o.activeStudents - o.withConsent;

  return (
    <>
      <PageHeader title="Settings" subtitle="Privacy notice and parental consent under the Nigeria Data Protection Act 2023." />
      <SettingsNav />
      {msg && <Notice tone="success">{msg}</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Students with consent" value={`${o.withConsent} of ${o.activeStudents}`} hint={
          <span className="block h-1.5 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Consent coverage">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
          </span>
        } />
        <Stat label="Current notice" value={`Version ${o.notice.version}`} hint={`Published ${longDate(o.notice.publishedAt)}`} />
        <Stat label="Data processing agreement" value={o.dpaAcceptedAt ? "Accepted" : "Not accepted"} hint={
          o.dpaAcceptedAt ? `Version ${o.dpaVersion}, ${longDate(o.dpaAcceptedAt)}${o.dpaAcceptedBy ? ` by ${o.dpaAcceptedBy}` : ""}` : `Version ${o.dpaVersion}`
        } />
      </div>

      <Card
        title="Privacy notice"
        description="Parents read this before giving consent. Anyone can read it at your school's web address under /privacy."
        actions={<Tabs tabs={[{ key: "read", label: "Preview" }, { key: "edit", label: "Edit" }]} value={view} onChange={setView} />}
      >
        {view === "read" ? (
          <div className="max-h-[60vh] overflow-y-auto pr-2"><NoticeText body={changed ? body : o.notice.body} /></div>
        ) : (
          <div className="space-y-4">
            <Field label="Notice text" hint={<>Start a line with <code>## </code> for a heading and <code>- </code> for a bullet. Leave a blank line between paragraphs.</>}>
              <Textarea rows={22} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-[13px] leading-relaxed" />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] text-muted">{changed ? "You have unpublished changes." : "No changes yet."}</span>
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!changed} onClick={() => setBody(o.notice.body)}>Discard changes</Button>
                <Button disabled={!changed} onClick={() => setConfirming(true)}>Publish version {o.notice.version + 1}</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card
        flush
        title="Students without consent"
        description={remaining ? "Parents are asked when they sign in to the parent portal. For parents who do not use the portal, record a signed paper form from the student's profile." : undefined}
        actions={remaining ? <Badge tone="warn">{remaining} remaining</Badge> : <Badge tone="good" dot>All covered</Badge>}
      >
        {o.missing.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">Every active student has consent under the current notice.</p>
        ) : (
          <>
            {o.missing.map((st) => (
              <RowLink key={st.id} href={`/students/${st.id}`} title={st.fullName} meta={`${st.admissionNumber}${st.currentArm ? ` · ${st.currentArm.label}` : ""}`} />
            ))}
            {remaining > o.missing.length && (
              <p className="border-t border-line px-5 py-3 text-[13px] text-muted">
                Showing the first {o.missing.length}. <Link href="/students" className="font-medium text-brand hover:underline">Open the student list</Link> to find the rest.
              </p>
            )}
          </>
        )}
      </Card>

      <ActionDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Publish version ${o.notice.version + 1} of the privacy notice?`}
        description="Every parent will be asked to read the new notice and give consent again the next time they sign in. Paper consents also need to be collected again. Earlier versions and the consents given under them are kept on record."
        confirmLabel="Publish notice"
        onConfirm={async () => {
          const { publishPrivacyNotice } = await gql(PublishDocument, { body });
          await mutate();
          setView("read");
          setMsg(`Version ${publishPrivacyNotice.version} is published. Parents will be asked to consent again.`);
        }}
      />
    </>
  );
}
