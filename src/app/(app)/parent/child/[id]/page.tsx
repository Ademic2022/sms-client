"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { AttendanceCard, TermResults } from "@/components/portal/TermRecords";
import { Card, ErrorNote, Loading, PageHeader, Select, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { naira } from "@/lib/money";
import { TermsDocument } from "@/lib/queries";

const ChildLedgerDocument = graphql(`
  query ChildLedger($studentId: ID!) {
    ledger(studentId: $studentId) {
      balanceKobo
      student { fullName admissionNumber currentArm { label } }
      payments { id amountKobo method status receiptNumber paidAt }
    }
  }
`);

export default function ChildPage() {
  const { id } = useParams<{ id: string }>();
  const terms = useGql(TermsDocument, {});
  const ledger = useGql(ChildLedgerDocument, { studentId: id });
  const [chosenTerm, setTermId] = useState("");
  const termId = chosenTerm || (terms.data?.terms.find((t) => t.isCurrent)?.id ?? terms.data?.terms.at(-1)?.id ?? "");

  if (ledger.isLoading) return <Loading />;
  if (ledger.error) return <ErrorNote error={ledger.error} />;
  const l = ledger.data?.ledger;

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
      {termId && <TermResults studentId={id} termId={termId} />}
      {termId && <AttendanceCard studentId={id} termId={termId} />}
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
