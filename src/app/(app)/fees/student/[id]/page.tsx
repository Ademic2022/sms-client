"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { IconClose, IconPlus, IconReceipt } from "@/components/icons";
import { ActionDialog, Badge, Button, Card, Dialog, ErrorNote, Field, IconButton, Input, Loading, Notice, PageHeader, Select, Stat, StatusBadge, Table, TD } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const LedgerDocument = graphql(`
  query Ledger($studentId: ID!) {
    ledger(studentId: $studentId) {
      balanceKobo chargedKobo paidKobo
      openingBalance { amountKobo asOf note }
      student { id fullName admissionNumber currentArm { label } }
      bills { id broughtForwardKobo totalKobo term { id label } lines { id kind description amountKobo isOptional } }
      payments { id amountKobo method status receiptNumber reference paidAt reversedReason }
      discounts { id name kind value item { name } term { label } }
    }
    feeItems { id name }
  }
`);

const SetOpeningDocument = graphql(`
  mutation SetOpeningBalance($studentId: ID!, $amountKobo: Int, $asOf: Date, $note: String!) {
    setOpeningBalance(studentId: $studentId, amountKobo: $amountKobo, asOf: $asOf, note: $note) { amountKobo }
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

const RemoveBillItemDocument = graphql(`
  mutation RemoveBillItem($lineId: ID!, $reason: String!) { removeBillItem(lineId: $lineId, reason: $reason) { id } }
`);

const ReversePaymentDocument = graphql(`
  mutation ReversePayment($paymentId: ID!, $reason: String!) { reversePayment(paymentId: $paymentId, reason: $reason) { id status } }
`);

const METHODS: Record<string, string> = { cash: "Cash", pos: "POS", bank: "Bank", online: "Online" };

export default function StudentLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useSession();
  const { data, error, isLoading, mutate } = useGql(LedgerDocument, { studentId: id });
  const [msg, setMsg] = useState<string | null>(null);
  const [reversing, setReversing] = useState<{ id: string; receipt: string; amount: number } | null>(null);
  const [removing, setRemoving] = useState<{ id: string; description: string; amount: number } | null>(null);
  const [dialog, setDialog] = useState<null | "discount" | "item" | "opening">(null);
  const [opening, setOpening] = useState({ amount: "", asOf: "", note: "" });
  const [discount, setDiscount] = useState({ name: "Sibling discount", kind: "percent", value: "10", itemId: "" });
  const [extra, setExtra] = useState({ itemId: "", description: "", amount: "", credit: false, reason: "" });
  const [busy, setBusy] = useState(false);
  const [dialogErr, setDialogErr] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (!data) return <ErrorNote error={error} />;
  const l = data.ledger;
  const currentBill = l.bills[0];
  const manage = can("fees.manage");

  async function runDialog(fn: () => Promise<unknown>, done: string) {
    setBusy(true);
    setDialogErr(null);
    try {
      await fn();
      setMsg(done);
      setDialog(null);
      await mutate();
    } catch (e) {
      setDialogErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        back={{ href: "/fees", label: "Fees and payments" }}
        eyebrow="Fees account"
        title={l.student.fullName}
        subtitle={<><span className="tabular-nums">{l.student.admissionNumber}</span><span aria-hidden>·</span><span>{l.student.currentArm?.label}</span></>}
        actions={
          manage && (
            <>
              <Button variant="secondary" onClick={() => { setDialogErr(null); setDialog("discount"); }}>Add discount</Button>
              {currentBill && <Button icon={<IconPlus size={16} />} onClick={() => { setDialogErr(null); setDialog("item"); }}>Add to bill</Button>}
            </>
          )
        }
      />
      {msg && <Notice tone="success">{msg}</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Balance owing" value={naira(l.balanceKobo)} hint={l.balanceKobo <= 0 ? "Fully paid" : undefined} />
        <Stat label="Total billed" value={naira(l.chargedKobo)} hint={l.openingBalance ? "Including the opening balance" : undefined} />
        <Stat label="Total paid" value={naira(l.paidKobo)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          {(l.openingBalance || manage) && (
            <Card
              title="Opening balance"
              description="What was owed, or paid ahead, before the school started using the portal."
              actions={manage && (
                <Button size="sm" variant="secondary" onClick={() => {
                  setDialogErr(null);
                  setOpening({ amount: l.openingBalance ? String(l.openingBalance.amountKobo / 100) : "", asOf: l.openingBalance?.asOf ?? "", note: l.openingBalance?.note ?? "" });
                  setDialog("opening");
                }}>{l.openingBalance ? "Change" : "Add"}</Button>
              )}
            >
              {l.openingBalance ? (
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-muted">
                    {l.openingBalance.amountKobo < 0 ? "Paid ahead" : "Owed"} as of {new Date(l.openingBalance.asOf).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    {l.openingBalance.note && ` · ${l.openingBalance.note}`}
                  </span>
                  <span className="font-semibold tabular-nums text-ink">{naira(l.openingBalance.amountKobo)}</span>
                </div>
              ) : <p className="text-sm text-muted">None recorded.</p>}
            </Card>
          )}
          {l.bills.length === 0 && <Card title="Bills"><p className="text-sm text-muted">No bills yet. Generate term bills from the Fees page.</p></Card>}
          {l.bills.map((bill) => (
            <Card key={bill.id} flush title={bill.term.label} description={bill.broughtForwardKobo ? `Balance from earlier terms when billed: ${naira(bill.broughtForwardKobo)}` : undefined}>
              <Table>
                <tbody>
                  {bill.lines.map((line) => (
                    <tr key={line.id}>
                      <TD>
                        <span className="text-ink">{line.description}</span>
                        {line.isOptional && <span className="ml-2"><Badge>Optional</Badge></span>}
                        {line.kind === "discount" && <span className="ml-2"><Badge tone="good">Discount</Badge></span>}
                        {line.kind === "adjustment" && <span className="ml-2"><Badge tone="warn">Adjustment</Badge></span>}
                      </TD>
                      <TD align="right" className={line.amountKobo < 0 ? "tabular-nums text-emerald-700 dark:text-emerald-300" : "tabular-nums"}>{naira(line.amountKobo)}</TD>
                      {manage && (
                        <TD align="right" className="w-12">
                          <IconButton label={`Remove ${line.description}`} onClick={() => setRemoving({ id: line.id, description: line.description, amount: line.amountKobo })}>
                            <IconClose size={14} />
                          </IconButton>
                        </TD>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-subtle/50">
                    <TD className="font-semibold">Term total</TD>
                    <TD align="right" className="font-semibold tabular-nums">{naira(bill.totalKobo)}</TD>
                    {manage && <TD />}
                  </tr>
                </tbody>
              </Table>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card flush title="Payments" description={`${l.payments.length} recorded`}>
            {l.payments.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">No payments yet.</p>
            ) : (
              <ul>
                {l.payments.map((p) => (
                  <li key={p.id} className="border-b border-line px-5 py-3.5 last:border-b-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold tabular-nums text-ink">{naira(p.amountKobo)}</div>
                        <div className="text-[13px] text-muted">
                          {new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} · {METHODS[p.method]}{p.reference && ` · ${p.reference}`}
                        </div>
                        <div className="text-xs tabular-nums text-muted">{p.receiptNumber}</div>
                        {p.status === "reversed" && <div className="mt-1 text-xs text-red-700 dark:text-red-300">Reversed: {p.reversedReason}</div>}
                      </div>
                      <div className="flex flex-none items-center gap-1">
                        {p.status !== "success" && <StatusBadge status={p.status} />}
                        <a href={`/files/receipt/${p.id}/`} target="_blank" rel="noreferrer"><IconButton label="Open receipt" tabIndex={-1}><IconReceipt size={16} /></IconButton></a>
                        {manage && p.status === "success" && (
                          <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={() => setReversing({ id: p.id, receipt: p.receiptNumber, amount: p.amountKobo })}>Reverse</Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {l.discounts.length > 0 && (
            <Card title="Discounts and scholarships">
              <ul className="space-y-2 text-sm">
                {l.discounts.map((d) => (
                  <li key={d.id} className="flex justify-between gap-3">
                    <span className="text-ink">{d.name}{d.item && <span className="text-muted"> · {d.item.name}</span>}</span>
                    <span className="text-muted">{d.kind === "percent" ? `${d.value / 100}%` : naira(d.value)} · {d.term ? d.term.label : "Every term"}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <ActionDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing?.description ?? ""} from the bill?`}
        description={removing && removing.amount < 0
          ? `This discount is worth ${naira(-removing.amount)}. Removing it increases the balance by that amount. The change is recorded in the audit log with your name.`
          : `${removing ? naira(removing.amount) : ""} will no longer be charged, and the balance goes down by that amount. The change is recorded in the audit log with your name.`}
        confirmLabel="Remove from bill"
        tone="danger"
        input={{ label: "Reason", placeholder: "e.g. Student does not use the school bus this term" }}
        onConfirm={async (reason) => {
          await gql(RemoveBillItemDocument, { lineId: removing!.id, reason });
          setMsg(`${removing!.description} removed from the bill.`);
          await mutate();
        }}
      />
      <ActionDialog
        open={reversing !== null}
        onClose={() => setReversing(null)}
        title={`Reverse ${reversing ? naira(reversing.amount) : ""} payment?`}
        description={`Receipt ${reversing?.receipt ?? ""} will be marked reversed and the amount added back to the balance. This cannot be undone and is recorded in the audit log with your name.`}
        confirmLabel="Reverse payment"
        tone="danger"
        input={{ label: "Reason", placeholder: "e.g. Recorded twice; duplicate of RCT/2026/000318" }}
        onConfirm={async (reason) => {
          await gql(ReversePaymentDocument, { paymentId: reversing!.id, reason });
          setMsg(`Payment ${reversing!.receipt} reversed.`);
          await mutate();
        }}
      />

      <Dialog
        open={dialog === "discount"}
        onClose={() => setDialog(null)}
        title="Add a discount"
        description="Applies to this term's bill now and to future bills until removed."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button busy={busy} onClick={() => {
              const value = discount.kind === "percent" ? Math.round(Number(discount.value) * 100) : toKobo(discount.value);
              if (!value || value < 0) return setDialogErr("Enter a valid discount.");
              void runDialog(() => gql(AddDiscountDocument, { studentId: id, name: discount.name, kind: discount.kind, value, itemId: discount.itemId || null }), `${discount.name} added.`);
            }}>Add discount</Button>
          </>
        }
      >
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <Field label="Name"><Input value={discount.name} onChange={(e) => setDiscount({ ...discount, name: e.target.value })} placeholder="Sibling discount, Staff child, Scholarship" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={discount.kind} onChange={(e) => setDiscount({ ...discount, kind: e.target.value })}>
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </Select>
            </Field>
            <Field label={discount.kind === "percent" ? "Percent" : "Amount (₦)"}>
              <Input inputMode="decimal" value={discount.value} onChange={(e) => setDiscount({ ...discount, value: e.target.value })} />
            </Field>
          </div>
          <Field label="Applies to">
            <Select value={discount.itemId} onChange={(e) => setDiscount({ ...discount, itemId: e.target.value })}>
              <option value="">The whole bill</option>
              {data.feeItems.map((i) => <option key={i.id} value={i.id}>{i.name} only</option>)}
            </Select>
          </Field>
        </div>
      </Dialog>

      {currentBill && (
        <Dialog
          open={dialog === "item"}
          onClose={() => setDialog(null)}
          title={`Add to ${currentBill.term.label} bill`}
          description="For optional items such as bus or lessons, or a one-off adjustment. Every change is recorded in the audit log."
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
              <Button busy={busy} onClick={() => {
                const kobo = toKobo(extra.amount);
                if (!kobo || !extra.description.trim()) return setDialogErr("Enter a description and a valid amount.");
                if (extra.credit && !extra.reason.trim()) return setDialogErr("Give a reason for the credit.");
                void runDialog(
                  () => gql(AddBillItemDocument, { billId: currentBill.id, description: extra.description, amountKobo: extra.credit ? -kobo : kobo, itemId: extra.itemId || null, reason: extra.reason }),
                  `${extra.description} added to the bill.`,
                );
              }}>Add to bill</Button>
            </>
          }
        >
          <div className="space-y-4">
            <ErrorNote error={dialogErr} />
            <Field label="Item">
              <Select value={extra.itemId} onChange={(e) => setExtra({ ...extra, itemId: e.target.value, description: data.feeItems.find((i) => i.id === e.target.value)?.name ?? extra.description, credit: false })}>
                <option value="">Adjustment (not a fee item)</option>
                {data.feeItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </Select>
            </Field>
            <Field label="Description"><Input value={extra.description} onChange={(e) => setExtra({ ...extra, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (₦)"><Input inputMode="decimal" value={extra.amount} onChange={(e) => setExtra({ ...extra, amount: e.target.value })} placeholder="35,000" /></Field>
              {!extra.itemId && (
                <Field label="Type">
                  <Select value={extra.credit ? "credit" : "charge"} onChange={(e) => setExtra({ ...extra, credit: e.target.value === "credit" })}>
                    <option value="charge">Charge</option>
                    <option value="credit">Credit</option>
                  </Select>
                </Field>
              )}
            </div>
            <Field label="Reason" optional={!extra.credit}><Input value={extra.reason} onChange={(e) => setExtra({ ...extra, reason: e.target.value })} /></Field>
          </div>
        </Dialog>
      )}
      <Dialog
        open={dialog === "opening"}
        onClose={() => setDialog(null)}
        title="Opening balance"
        description="Enter what the student owed when the school joined. Use a minus sign for money paid ahead, e.g. -10000."
        footer={<>
          {l.openingBalance && (
            <Button variant="ghost" className="mr-auto text-red-700 dark:text-red-300" busy={busy}
              onClick={() => runDialog(() => gql(SetOpeningDocument, { studentId: id, amountKobo: null, note: "" }), "Opening balance removed.")}>Remove</Button>
          )}
          <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
          <Button busy={busy} onClick={() => {
            const negative = opening.amount.trim().startsWith("-");
            const kobo = toKobo(opening.amount.replace("-", ""));
            if (kobo === null) { setDialogErr("Enter an amount in naira, e.g. 25000."); return; }
            void runDialog(() => gql(SetOpeningDocument, { studentId: id, amountKobo: negative ? -kobo : kobo, asOf: opening.asOf || null, note: opening.note }), "Opening balance saved.");
          }}>Save</Button>
        </>}
      >
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <Field label="Amount in naira"><Input inputMode="decimal" placeholder="25000" value={opening.amount} onChange={(e) => setOpening({ ...opening, amount: e.target.value })} /></Field>
          <Field label="As of" optional hint="Defaults to today."><Input type="date" value={opening.asOf} onChange={(e) => setOpening({ ...opening, asOf: e.target.value })} /></Field>
          <Field label="Note" optional><Input placeholder="e.g. From the 2025/2026 ledger" value={opening.note} onChange={(e) => setOpening({ ...opening, note: e.target.value })} /></Field>
        </div>
      </Dialog>
    </>
  );
}
