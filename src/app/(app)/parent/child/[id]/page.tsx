"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { IconDownload } from "@/components/icons";
import { Badge, ButtonLink, Card, ErrorNote, Loading, Notice, PageHeader, Select, Stat, Table, TD, TH } from "@/components/ui";
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
      <PageHeader
        back={{ href: "/parent", label: "My children" }}
        title={l?.student.fullName ?? ""}
        subtitle={<><span>{l?.student.currentArm?.label}</span><span aria-hidden>·</span><span className="tabular-nums">{l?.student.admissionNumber}</span></>}
        actions={
          <Select value={termId} onChange={(e) => setTermId(e.target.value)} className="w-auto" aria-label="Term">
            {terms.data?.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>
        }
      />
      {result.isLoading ? (
        <Loading />
      ) : !r ? null : !r.visible ? (
        <Notice tone={r.reason === "fees_outstanding" ? "warning" : "info"} title={r.reason === "fees_outstanding" ? "Results on hold" : "Results not available yet"}>
          {REASONS[r.reason] ?? "Results are not available."}
        </Notice>
      ) : r.result && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Average" value={r.result.average ?? "–"} hint={`Class average ${r.classAverage ?? "–"}`} />
            <Stat label="Position" value={r.result.position ? ordinal(r.result.position) : "–"} hint={r.result.position ? `Out of ${r.classSize} students` : "Not shown by the school"} />
            <Stat label="Subjects" value={r.result.subjects.length} hint={`Total score ${Number(r.result.total)}`} />
          </div>
          <Card
            flush
            title="Subject results"
            actions={r.reportCardUrl && <ButtonLink href={r.reportCardUrl} size="sm" icon={<IconDownload size={15} />}>Report card</ButtonLink>}
          >
            <Table>
              <thead><tr><TH>Subject</TH><TH align="right">Score</TH><TH align="center">Grade</TH><TH>Remark</TH></tr></thead>
              <tbody>
                {r.result.subjects.map((s) => (
                  <tr key={s.subjectId}>
                    <TD className="font-medium">{s.subjectName}</TD>
                    <TD align="right" className="tabular-nums">{s.total ? Number(s.total) : "–"}</TD>
                    <TD align="center"><Badge tone="brand">{s.cumulativeGrade || s.grade || "–"}</Badge></TD>
                    <TD className="text-muted">{s.remark}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
      {l && (
        <Card flush title="Payments" description={`Balance ${naira(l.balanceKobo)}`}>
          {l.payments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">No payments yet.</p>
          ) : (
            <Table>
              <thead><tr><TH>Date</TH><TH>Receipt</TH><TH align="right">Amount</TH><TH /></tr></thead>
              <tbody>
                {l.payments.map((p) => (
                  <tr key={p.id}>
                    <TD className="text-muted">{new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</TD>
                    <TD className="tabular-nums">{p.receiptNumber}</TD>
                    <TD align="right" className="font-semibold tabular-nums">{naira(p.amountKobo)}</TD>
                    <TD align="right"><a className="text-[13px] font-medium text-brand-ink hover:underline" href={`/files/receipt/${p.id}/`} target="_blank" rel="noreferrer">Receipt</a></TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}
    </>
  );
}
