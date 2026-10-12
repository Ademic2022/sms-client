"use client";

import { useState } from "react";

import { IconChevronRight } from "@/components/icons";
import { ActionDialog, Badge, Button, Card, Dialog, ErrorNote, Field, Input, Loading, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { todayIso } from "@/lib/money";

const StudentConsentDocument = graphql(`
  query StudentConsent($studentId: ID!) {
    studentConsent(studentId: $studentId) {
      noticeVersion
      guardians { guardianId guardianName relationship consent { id source givenAt recordedBy } }
      history { id guardianName noticeVersion source givenAt recordedBy withdrawnAt withdrawalReason }
    }
  }
`);

const RecordPaperDocument = graphql(`
  mutation RecordPaperConsent($studentId: ID!, $guardianId: ID!, $givenOn: Date!) {
    recordPaperConsent(studentId: $studentId, guardianId: $guardianId, givenOn: $givenOn)
  }
`);

const RecordWithdrawalDocument = graphql(`
  mutation RecordConsentWithdrawal($consentId: ID!, $reason: String!) { recordConsentWithdrawal(consentId: $consentId, reason: $reason) }
`);

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/** Consent from each guardian under the school's current privacy notice, for one student. */
export function ConsentCard({ studentId, canManage }: { studentId: string; canManage: boolean }) {
  const { data, isLoading, mutate } = useGql(StudentConsentDocument, { studentId });
  const [paperFor, setPaperFor] = useState<string | null>(null);
  const [givenOn, setGivenOn] = useState(todayIso());
  const [withdrawing, setWithdrawing] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (isLoading || !data) return <Card title="Consent"><Loading /></Card>;
  const c = data.studentConsent;
  const anyConsent = c.guardians.some((g) => g.consent);
  const missing = c.guardians.filter((g) => !g.consent);

  async function recordPaper() {
    setBusy(true);
    setErr(null);
    try {
      await gql(RecordPaperDocument, { studentId, guardianId: paperFor!, givenOn });
      setPaperFor(null);
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      flush
      title="Data protection consent"
      description={`Under privacy notice version ${c.noticeVersion}`}
      actions={!anyConsent ? <Badge tone="warn" dot>No consent on record</Badge> : <Badge tone="good" dot>Consent on record</Badge>}
    >
      {c.guardians.map((g) => (
        <div key={g.guardianId} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <div className="text-sm font-medium text-ink">{g.guardianName} <span className="font-normal text-muted">· {g.relationship}</span></div>
            <div className="mt-0.5 text-[13px] text-muted">
              {g.consent
                ? `${g.consent.source}, ${day(g.consent.givenAt)}${g.consent.source === "Paper form" && g.consent.recordedBy ? `, recorded by ${g.consent.recordedBy}` : ""}`
                : "Not given yet. They will be asked when they next sign in to the parent portal."}
            </div>
          </div>
          {canManage && (g.consent ? (
            <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={() => setWithdrawing({ id: g.consent!.id, name: g.guardianName })}>Record withdrawal</Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => { setErr(null); setGivenOn(todayIso()); setPaperFor(g.guardianId); }}>Record paper form</Button>
          ))}
        </div>
      ))}
      {c.history.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-[13px] font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
            History ({c.history.length}) <IconChevronRight size={14} className="transition group-open:rotate-90" />
          </summary>
          <ul className="space-y-2 px-5 pb-4 text-[13px] text-muted">
            {c.history.map((h) => (
              <li key={h.id}>
                <span className="text-ink">{h.guardianName}</span> · v{h.noticeVersion} · {h.source}, {day(h.givenAt)}
                {h.withdrawnAt && <span className="text-red-700 dark:text-red-300"> · withdrawn {day(h.withdrawnAt)}: {h.withdrawalReason}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

      <Dialog
        open={paperFor !== null}
        onClose={() => setPaperFor(null)}
        title="Record consent from a paper form"
        description="Use this when the parent signed the school's consent form. Keep the signed form on file."
        footer={<><Button variant="secondary" onClick={() => setPaperFor(null)}>Cancel</Button><Button busy={busy} onClick={recordPaper}>Record consent</Button></>}
      >
        <div className="space-y-4">
          <ErrorNote error={err} />
          <Field label="Parent or guardian">
            <Select value={paperFor ?? ""} onChange={(e) => setPaperFor(e.target.value)}>
              {missing.map((g) => <option key={g.guardianId} value={g.guardianId}>{g.guardianName} ({g.relationship})</option>)}
            </Select>
          </Field>
          <Field label="Date signed on the form"><Input type="date" value={givenOn} max={todayIso()} onChange={(e) => setGivenOn(e.target.value)} /></Field>
        </div>
      </Dialog>
      <ActionDialog
        open={withdrawing !== null}
        onClose={() => setWithdrawing(null)}
        title={`Record that ${withdrawing?.name ?? ""} withdrew consent?`}
        description="Use this when a parent withdraws by letter, email or in person. They will be asked for consent again the next time they sign in."
        confirmLabel="Record withdrawal"
        tone="danger"
        input={{ label: "What the parent said", placeholder: "e.g. Letter received 14 October asking us to stop" }}
        onConfirm={async (reason) => {
          await gql(RecordWithdrawalDocument, { consentId: withdrawing!.id, reason });
          await mutate();
        }}
      />
    </Card>
  );
}
