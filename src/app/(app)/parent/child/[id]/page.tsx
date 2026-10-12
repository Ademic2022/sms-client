"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge, Card, ErrorNote, Loading, Notice, PageHeader, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { naira, ordinal } from "@/lib/money";
import { TermsDocument } from "@/lib/queries";

const ChildResultDocument = graphql(`
  query ChildResult($studentId: ID!, $termId: ID!) {
    childResult(studentId: $studentId, termId: $termId) {
      visible reason classSize classAverage reportCardUrl
      result {
        total average position cumulativeAverage cumulativePosition
        student { fullName currentArm { label } }
        subjects { subjectId subjectName total grade remark position cumulativeAverage cumulativeGrade }
      }
    }
  }
`);

const ChildLedgerDocument = graphql(`
  query ChildLedger($studentId: ID!) {
    ledger(studentId: $studentId) {
      balanceKobo
      student { fullName admissionNumber currentArm { label } }
      payments { id amountKobo method status receiptNumber paidAt }
    }
  }
`);

const REASONS: Record<string, string> = {
  not_published: "Results for this term have not been published yet.",
  not_yet_released: "Results will be available soon. The school has set a release date.",
  fees_outstanding: "Results are held until outstanding fees are paid. Please pay or contact the bursar.",
  not_enrolled: "Your child was not in a class this term.",
};

export default function ChildPage() {
  const { id } = useParams<{ id: string }>();
  const terms = useGql(TermsDocument, {});
  const ledger = useGql(ChildLedgerDocument, { studentId: id });
  const [chosenTerm, setTermId] = useState("");
  const termId = chosenTerm || (terms.data?.terms.find((t) => t.isCurrent)?.id ?? terms.data?.terms.at(-1)?.id ?? "");
  const result = useGql(ChildResultDocument, termId ? { studentId: id, termId } : null);

  if (ledger.isLoading) return <Loading />;
  if (ledger.error) return <ErrorNote error={ledger.error} />;
  const l = ledger.data?.ledger;
  const r = result.data?.childResult;

  return (
    <>
      <PageHeader title={l?.student.fullName ?? ""} subtitle={`${l?.student.currentArm?.label ?? ""} · ${l?.student.admissionNumber ?? ""}`} />
      <Card title="Results" actions={
        <Select value={termId} onChange={(e) => setTermId(e.target.value)} className="w-auto">
          {terms.data?.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </Select>
      }>
        {result.isLoading ? <Loading /> : !r ? null : !r.visible ? (
          <Notice tone={r.reason === "fees_outstanding" ? "warning" : "info"}>{REASONS[r.reason] ?? "Results are not available."}</Notice>
        ) : r.result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-subtle p-2"><div className="text-xs text-muted">Average</div><div className="text-lg font-bold">{r.result.average}</div></div>
              <div className="rounded-lg bg-subtle p-2"><div className="text-xs text-muted">Class average</div><div className="text-lg font-bold">{r.classAverage}</div></div>
              <div className="rounded-lg bg-subtle p-2"><div className="text-xs text-muted">Position</div><div className="text-lg font-bold">{r.result.position ? `${ordinal(r.result.position)} of ${r.classSize}` : "–"}</div></div>
            </div>
            <ul className="divide-y divide-line text-sm">
              {r.result.subjects.map((s) => (
                <li key={s.subjectId} className="flex items-center justify-between py-2">
                  <span>{s.subjectName}</span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {s.total ? Number(s.total) : "–"} <Badge tone="brand">{s.cumulativeGrade || s.grade}</Badge>
                  </span>
                </li>
              ))}
            </ul>
            {r.reportCardUrl && (
              <a href={r.reportCardUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
                Download report card
              </a>
            )}
          </div>
        )}
      </Card>
      {l && (
        <Card title={`Payments · balance ${naira(l.balanceKobo)}`}>
          {l.payments.length === 0 ? <p className="text-sm text-muted">No payments yet.</p> : (
            <ul className="divide-y divide-line text-sm">
              {l.payments.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>{new Date(p.paidAt).toLocaleDateString("en-NG")} · {p.receiptNumber}</span>
                  <span className="flex gap-3">
                    <span className="font-semibold tabular-nums">{naira(p.amountKobo)}</span>
                    <a className="text-brand" href={`/files/receipt/${p.id}/`} target="_blank" rel="noreferrer">Receipt</a>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
