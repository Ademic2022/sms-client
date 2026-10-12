"use client";

import { useState, type FormEvent } from "react";

import { StudentPicker, type PickedStudent } from "@/components/StudentPicker";
import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, statusTone } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const RecentPaymentsDocument = graphql(`
  query RecentPayments($method: String) {
    payments(method: $method, limit: 50) {
      id amountKobo method status receiptNumber reference paidAt
      student { id fullName admissionNumber }
      recordedBy { fullName }
    }
  }
`);

const RecordPaymentDocument = graphql(`
  mutation RecordPayment($studentId: ID!, $amountKobo: Kobo!, $method: String!, $paidAt: DateTime!, $reference: String!, $note: String!) {
    recordPayment(studentId: $studentId, amountKobo: $amountKobo, method: $method, paidAt: $paidAt, reference: $reference, note: $note) {
      id receiptNumber
    }
  }
`);

const BalanceDocument = graphql(`
  query StudentBalance($studentId: ID!) { ledger(studentId: $studentId) { balanceKobo } }
`);

const METHODS: Record<string, string> = { cash: "Cash", pos: "POS", bank: "Bank deposit or transfer", online: "Online" };

export default function PaymentsPage() {
  const { can } = useSession();
  const [method, setMethod] = useState("");
  const payments = useGql(RecentPaymentsDocument, { method: method || null });
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const balance = useGql(BalanceDocument, student ? { studentId: student.id } : null);
  const [form, setForm] = useState({ amount: "", method: "cash", reference: "", note: "", paidAt: new Date().toISOString().slice(0, 16) });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; receipt: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!student) return;
    const amountKobo = toKobo(form.amount);
    if (!amountKobo) {
      setErr("Enter a valid amount.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { recordPayment } = await gql(RecordPaymentDocument, {
        studentId: student.id, amountKobo, method: form.method, paidAt: new Date(form.paidAt).toISOString(), reference: form.reference, note: form.note,
      });
      setDone({ id: recordPayment.id, receipt: recordPayment.receiptNumber });
      setStudent(null);
      setForm((f) => ({ ...f, amount: "", reference: "", note: "" }));
      void payments.mutate();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Payments" />
      {can("payments.record") && (
        <Card title="Record a cash, POS or bank payment">
          {done && <Notice tone="success">Saved as receipt {done.receipt}. The parent gets an SMS receipt. <a className="font-semibold underline" target="_blank" rel="noreferrer" href={`/files/receipt/${done.id}/`}>Print receipt</a></Notice>}
          <form onSubmit={submit} className="mt-3 space-y-3">
            <ErrorNote error={err} />
            {student ? (
              <div className="flex items-center justify-between rounded-lg bg-subtle px-3 py-2 text-sm">
                <span><span className="font-medium">{student.fullName}</span> · {student.admissionNumber} · balance <strong>{naira(balance.data?.ledger.balanceKobo)}</strong></span>
                <button type="button" className="text-brand" onClick={() => setStudent(null)}>Change</button>
              </div>
            ) : (
              <Field label="Student"><StudentPicker onPick={setStudent} /></Field>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Amount (₦)"><Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="50,000" /></Field>
              <Field label="Method">
                <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="cash">Cash</option><option value="pos">POS</option><option value="bank">Bank deposit or transfer</option>
                </Select>
              </Field>
              <Field label="Teller or reference number" hint={form.method === "cash" ? "Optional for cash." : "Required for POS and bank payments."}>
                <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} required={form.method !== "cash"} />
              </Field>
              <Field label="Date paid"><Input type="datetime-local" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} required /></Field>
            </div>
            <Field label="Note (optional)"><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
            <Button type="submit" busy={busy} disabled={!student}>Save payment</Button>
          </form>
        </Card>
      )}
      <Card title="Recent payments" actions={
        <Select value={method} onChange={(e) => setMethod(e.target.value)} className="w-auto">
          <option value="">All methods</option>
          {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      }>
        {payments.isLoading ? <Loading /> : (
          <ul className="divide-y divide-line text-sm">
            {payments.data?.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.student.fullName}</span>
                  <span className="text-xs text-muted">{p.receiptNumber} · {METHODS[p.method]}{p.reference && ` · ${p.reference}`} · {new Date(p.paidAt).toLocaleDateString("en-NG")}{p.recordedBy && ` · ${p.recordedBy.fullName}`}</span>
                </span>
                <span className="flex items-center gap-2">
                  {p.status !== "success" && <Badge tone={statusTone[p.status]}>{p.status}</Badge>}
                  <span className="font-semibold tabular-nums">{naira(p.amountKobo)}</span>
                  <a className="text-brand" target="_blank" rel="noreferrer" href={`/files/receipt/${p.id}/`}>Receipt</a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
