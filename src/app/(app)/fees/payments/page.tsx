"use client";

import { useState, type FormEvent } from "react";

import { IconDownload, IconReceipt } from "@/components/icons";
import { StudentPicker, type PickedStudent } from "@/components/StudentPicker";
import { Button, ButtonLink, Card, Dialog, Empty, ErrorNote, Field, IconButton, Input, Loading, Notice, PageHeader, Pager, Select, StatusBadge, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const RecentPaymentsDocument = graphql(`
  query RecentPayments($method: String, $offset: Int!) {
    payments(method: $method, offset: $offset, limit: 50) {
      total
      items {
        id amountKobo method status receiptNumber reference paidAt
        student { id fullName admissionNumber }
        recordedBy { fullName }
      }
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

const PAGE = 50;

const METHODS: Record<string, string> = { cash: "Cash", pos: "POS", bank: "Bank deposit or transfer", online: "Online" };

function localDateTime() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function PaymentsPage() {
  const { can } = useSession();
  const [method, setMethod] = useState("");
  const [offset, setOffset] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [range, setRange] = useState({ from: "", to: "" });
  const exportHref = `/files/payments.xlsx?${new URLSearchParams({ ...(range.from && { from: range.from }), ...(range.to && { to: range.to }), ...(method && { method }) })}`;
  const payments = useGql(RecentPaymentsDocument, { method: method || null, offset });
  const [student, setStudent] = useState<PickedStudent | null>(null);
  const balance = useGql(BalanceDocument, student ? { studentId: student.id } : null);
  const [form, setForm] = useState({ amount: "", method: "cash", reference: "", note: "", paidAt: localDateTime() });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; receipt: string; amount: number; name: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!student) return;
    const amountKobo = toKobo(form.amount);
    if (!amountKobo) {
      setErr("Enter a valid amount, for example 85,000.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const { recordPayment } = await gql(RecordPaymentDocument, {
        studentId: student.id, amountKobo, method: form.method, paidAt: new Date(form.paidAt).toISOString(), reference: form.reference, note: form.note,
      });
      setDone({ id: recordPayment.id, receipt: recordPayment.receiptNumber, amount: amountKobo, name: student.fullName });
      setStudent(null);
      setForm({ amount: "", method: "cash", reference: "", note: "", paidAt: localDateTime() });
      setOffset(0);
      void payments.mutate();
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader back={{ href: "/fees", label: "Fees and payments" }} title="Payments" subtitle="Online payments appear here automatically. Record cash, POS and bank tellers by hand." />

      {can("payments.record") && (
        <div id="record" className="scroll-mt-6">
          <Card title="Record a payment" description="The parent receives an SMS receipt as soon as you save.">
            {done && (
              <div className="mb-5">
                <Notice tone="success" title={`${naira(done.amount)} recorded for ${done.name}`}>
                  Receipt {done.receipt}.{" "}
                  <a className="font-semibold underline underline-offset-2" target="_blank" rel="noreferrer" href={`/files/receipt/${done.id}/`}>Print receipt</a>
                </Notice>
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <ErrorNote error={err} />
              <Field label="Student">
                {student ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-line-strong bg-subtle/50 px-3 py-2.5">
                    <div className="min-w-0 text-sm">
                      <div className="truncate font-medium text-ink">{student.fullName}</div>
                      <div className="text-[13px] text-muted">{student.admissionNumber} · Balance {balance.data ? <strong className="text-ink">{naira(balance.data.ledger.balanceKobo)}</strong> : "…"}</div>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setStudent(null)}>Change</Button>
                  </div>
                ) : (
                  <StudentPicker onPick={setStudent} />
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Amount">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
                    <Input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="85,000" className="pl-7 tabular-nums" />
                  </div>
                </Field>
                <Field label="Method">
                  <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="pos">POS</option>
                    <option value="bank">Bank deposit or transfer</option>
                  </Select>
                </Field>
                <Field label="Teller or reference" optional={form.method === "cash"}>
                  <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} required={form.method !== "cash"} />
                </Field>
                <Field label="Date paid">
                  <Input type="datetime-local" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} required />
                </Field>
              </div>
              <Field label="Note" optional><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></Field>
              <div className="flex justify-end border-t border-line pt-4">
                <Button type="submit" busy={busy} disabled={!student}>Save payment</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card
        flush
        title="Payments"
        actions={<>
          <Select value={method} onChange={(e) => { setMethod(e.target.value); setOffset(0); }} className="w-auto" aria-label="Method">
            <option value="">All methods</option>
            {Object.entries(METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          {can("fees.view") && <Button size="sm" variant="secondary" icon={<IconDownload size={15} />} onClick={() => setExporting(true)}>Export</Button>}
        </>}
      >
        {payments.isLoading ? (
          <div className="p-5"><Loading /></div>
        ) : !payments.data?.payments.items.length ? (
          <div className="p-5"><Empty title="No payments yet" icon={<IconReceipt size={18} />}>Payments recorded here or made online by parents will appear in this list.</Empty></div>
        ) : (
          <Table>
            <thead>
              <tr><TH>Date</TH><TH>Student</TH><TH>Receipt</TH><TH>Method</TH><TH>Status</TH><TH align="right">Amount</TH><TH /></tr>
            </thead>
            <tbody>
              {payments.data.payments.items.map((p) => (
                <tr key={p.id}>
                  <TD className="whitespace-nowrap text-muted">{new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</TD>
                  <TD><div className="font-medium">{p.student.fullName}</div><div className="text-xs text-muted">{p.student.admissionNumber}</div></TD>
                  <TD className="tabular-nums text-muted">{p.receiptNumber}</TD>
                  <TD><div>{METHODS[p.method]}</div>{(p.reference || p.recordedBy) && <div className="text-xs text-muted">{[p.reference, p.recordedBy?.fullName].filter(Boolean).join(" · ")}</div>}</TD>
                  <TD><StatusBadge status={p.status} /></TD>
                  <TD align="right" className="font-semibold tabular-nums">{naira(p.amountKobo)}</TD>
                  <TD align="right">
                    <a href={`/files/receipt/${p.id}/`} target="_blank" rel="noreferrer"><IconButton label="Open receipt" tabIndex={-1}><IconReceipt size={16} /></IconButton></a>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {payments.data && <Pager offset={offset} pageSize={PAGE} total={payments.data.payments.total} onChange={setOffset} />}
      </Card>
      <Dialog
        open={exporting}
        onClose={() => setExporting(false)}
        title="Export payments to Excel"
        description={`Every payment in the period, with receipt numbers, references and who recorded it, plus reversals and a total. ${method ? `Only ${METHODS[method as keyof typeof METHODS] ?? method} payments, as filtered.` : "All methods."}`}
        footer={<><Button variant="secondary" onClick={() => setExporting(false)}>Close</Button><ButtonLink href={exportHref} icon={<IconDownload size={15} />}>Download</ButtonLink></>}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" optional><Input type="date" value={range.from} max={range.to || undefined} onChange={(e) => setRange({ ...range, from: e.target.value })} /></Field>
          <Field label="To" optional><Input type="date" value={range.to} min={range.from || undefined} onChange={(e) => setRange({ ...range, to: e.target.value })} /></Field>
        </div>
        <p className="mt-2 text-xs text-muted">Leave both empty for every payment ever recorded.</p>
      </Dialog>
    </>
  );
}
