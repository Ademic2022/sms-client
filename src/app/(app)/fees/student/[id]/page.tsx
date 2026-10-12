"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, statusTone } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const LedgerDocument = graphql(`
  query Ledger($studentId: ID!) {
    ledger(studentId: $studentId) {
      balanceKobo chargedKobo paidKobo
      student { id fullName admissionNumber currentArm { label } }
      bills { id broughtForwardKobo totalKobo term { id label } lines { id kind description amountKobo isOptional } }
      payments { id amountKobo method status receiptNumber reference paidAt reversedReason }
      discounts { id name kind value item { name } term { label } }
    }
    feeItems { id name }
  }
`);

const AddDiscountDocument = graphql(`
  mutation AddDiscount($studentId: ID!, $name: String!, $kind: String!, $value: Kobo!, $itemId: ID) {
    addDiscount(studentId: $studentId, name: $name, kind: $kind, value: $value, itemId: $itemId) { id }
  }
`);

const AddBillItemDocument = graphql(`
  mutation AddBillItem($billId: ID!, $description: String!, $amountKobo: Kobo!, $itemId: ID, $reason: String!) {
    addBillItem(billId: $billId, description: $description, amountKobo: $amountKobo, itemId: $itemId, reason: $reason) { id }
  }
`);

const ReversePaymentDocument = graphql(`
  mutation ReversePayment($paymentId: ID!, $reason: String!) { reversePayment(paymentId: $paymentId, reason: $reason) { id status } }
`);

export default function StudentLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useSession();
  const { data, error, isLoading, mutate } = useGql(LedgerDocument, { studentId: id });
  const [err, setErr] = useState<string | null>(null);
  const [discount, setDiscount] = useState({ name: "Sibling discount", kind: "percent", value: "10", itemId: "" });
  const [extra, setExtra] = useState({ itemId: "", description: "", amount: "", reason: "" });

  if (isLoading) return <Loading />;
  if (!data) return <ErrorNote error={error} />;
  const l = data.ledger;
  const currentBill = l.bills[0];

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    try {
      await fn();
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title={l.student.fullName} subtitle={`${l.student.admissionNumber} · ${l.student.currentArm?.label ?? ""}`} />
      <div className="grid grid-cols-3 gap-3">
        <Card><div className="text-xs uppercase text-muted">Balance</div><div className="text-xl font-bold tabular-nums">{naira(l.balanceKobo)}</div></Card>
        <Card><div className="text-xs uppercase text-muted">Billed</div><div className="text-xl font-bold tabular-nums">{naira(l.chargedKobo)}</div></Card>
        <Card><div className="text-xs uppercase text-muted">Paid</div><div className="text-xl font-bold tabular-nums">{naira(l.paidKobo)}</div></Card>
      </div>
      <ErrorNote error={err} />

      {l.bills.map((bill) => (
        <Card key={bill.id} title={`Bill · ${bill.term.label}`}>
          {bill.broughtForwardKobo !== 0 && <Notice>Balance from earlier terms when this bill was made: {naira(bill.broughtForwardKobo)}</Notice>}
          <ul className="mt-2 divide-y divide-line text-sm">
            {bill.lines.map((line) => (
              <li key={line.id} className="flex justify-between py-1.5">
                <span>{line.description} {line.isOptional && <Badge>optional</Badge>} {line.kind === "discount" && <Badge tone="good">discount</Badge>}</span>
                <span className="tabular-nums">{naira(line.amountKobo)}</span>
              </li>
            ))}
            <li className="flex justify-between py-1.5 font-semibold"><span>Term total</span><span className="tabular-nums">{naira(bill.totalKobo)}</span></li>
          </ul>
        </Card>
      ))}

      <Card title="Payments">
        {l.payments.length === 0 ? <p className="text-sm text-muted">No payments yet.</p> : (
          <ul className="divide-y divide-line text-sm">
            {l.payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{p.receiptNumber}</span> · {p.method}{p.reference && ` · ${p.reference}`} · {new Date(p.paidAt).toLocaleDateString("en-NG")}
                  {p.status === "reversed" && <span className="block text-xs text-red-700">Reversed: {p.reversedReason}</span>}
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  <span className="font-semibold tabular-nums">{naira(p.amountKobo)}</span>
                  <a className="text-brand" target="_blank" rel="noreferrer" href={`/files/receipt/${p.id}/`}>Receipt</a>
                  {can("fees.manage") && p.status === "success" && (
                    <button className="text-red-700" onClick={() => {
                      const reason = window.prompt("Why is this payment being reversed? This is recorded in the audit log.");
                      if (reason) void run(() => gql(ReversePaymentDocument, { paymentId: p.id, reason }));
                    }}>Reverse</button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {can("fees.manage") && (
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="Discounts and scholarships">
            {l.discounts.length > 0 && (
              <ul className="mb-3 text-sm">
                {l.discounts.map((d) => (
                  <li key={d.id}>{d.name}: {d.kind === "percent" ? `${d.value / 100}%` : naira(d.value)}{d.item && ` of ${d.item.name}`}{d.term ? ` (${d.term.label})` : " (every term)"}</li>
                ))}
              </ul>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Name"><Input value={discount.name} onChange={(e) => setDiscount({ ...discount, name: e.target.value })} /></Field>
              <Field label="Type">
                <Select value={discount.kind} onChange={(e) => setDiscount({ ...discount, kind: e.target.value })}>
                  <option value="percent">Percentage</option><option value="fixed">Fixed amount (₦)</option>
                </Select>
              </Field>
              <Field label={discount.kind === "percent" ? "Percent" : "Amount (₦)"}><Input inputMode="decimal" value={discount.value} onChange={(e) => setDiscount({ ...discount, value: e.target.value })} /></Field>
              <Field label="Applies to">
                <Select value={discount.itemId} onChange={(e) => setDiscount({ ...discount, itemId: e.target.value })}>
                  <option value="">Whole bill</option>
                  {data.feeItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </Select>
              </Field>
            </div>
            <Button className="mt-3" variant="secondary" onClick={() => {
              const value = discount.kind === "percent" ? Math.round(Number(discount.value) * 100) : toKobo(discount.value);
              if (!value) return setErr("Enter a valid discount.");
              void run(() => gql(AddDiscountDocument, { studentId: id, name: discount.name, kind: discount.kind, value, itemId: discount.itemId || null }));
            }}>Add discount</Button>
          </Card>
          {currentBill && (
            <Card title={`Add to ${currentBill.term.label} bill`}>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Item">
                  <Select value={extra.itemId} onChange={(e) => setExtra({ ...extra, itemId: e.target.value, description: data.feeItems.find((i) => i.id === e.target.value)?.name ?? "" })}>
                    <option value="">Adjustment</option>
                    {data.feeItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </Select>
                </Field>
                <Field label="Description"><Input value={extra.description} onChange={(e) => setExtra({ ...extra, description: e.target.value })} /></Field>
                <Field label="Amount (₦)" hint="Use a minus sign for a credit."><Input value={extra.amount} onChange={(e) => setExtra({ ...extra, amount: e.target.value })} /></Field>
                <Field label="Reason"><Input value={extra.reason} onChange={(e) => setExtra({ ...extra, reason: e.target.value })} /></Field>
              </div>
              <Button className="mt-3" variant="secondary" onClick={() => {
                const negative = extra.amount.trim().startsWith("-");
                const kobo = toKobo(extra.amount.replace("-", ""));
                if (!kobo || !extra.description) return setErr("Enter a description and a valid amount.");
                void run(() => gql(AddBillItemDocument, { billId: currentBill.id, description: extra.description, amountKobo: negative ? -kobo : kobo, itemId: extra.itemId || null, reason: extra.reason }));
              }}>Add to bill</Button>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
