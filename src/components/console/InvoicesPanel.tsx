"use client";

import { useState } from "react";

import { ActionDialog, Badge, Button, Card, Empty, ErrorNote, Loading, Notice, Table, TD, TH, Tabs } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira } from "@/lib/money";

const InvoicesDocument = graphql(`
  query PlatformInvoices($status: String) {
    platformInvoices(status: $status) {
      schoolName schoolSlug
      invoice { id number periodLabel studentCount amountKobo dueDate status paidAt paidVia paymentReference voidReason isOverdue readOnlyFrom }
    }
  }
`);

const GenerateDocument = graphql(`mutation GenerateInvoices { generateInvoices { schoolName invoice { number } } }`);
const MarkPaidDocument = graphql(`
  mutation MarkInvoicePaid($invoiceId: ID!, $reference: String!) { markInvoicePaid(invoiceId: $invoiceId, reference: $reference) { id status } }
`);
const VoidDocument = graphql(`
  mutation VoidInvoice($invoiceId: ID!, $reason: String!) { voidInvoice(invoiceId: $invoiceId, reason: $reason) { id status } }
`);

type Filter = "unpaid" | "overdue" | "paid" | "all";
type Target = { id: string; number: string; school: string; amount: number };

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/** Subscription invoices across every school, for the platform team. */
export function InvoicesPanel() {
  const [filter, setFilter] = useState<Filter>("unpaid");
  const { data, error, isLoading, mutate } = useGql(InvoicesDocument, { status: filter === "all" ? null : filter });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState<Target | null>(null);
  const [voiding, setVoiding] = useState<Target | null>(null);
  const rows = data?.platformInvoices ?? [];

  async function generate() {
    setBusy(true);
    setMsg(null);
    try {
      const { generateInvoices } = await gql(GenerateDocument);
      setMsg(generateInvoices.length
        ? `Raised ${generateInvoices.length} invoice${generateInvoices.length > 1 ? "s" : ""}: ${generateInvoices.map((r) => `${r.invoice.number} (${r.schoolName})`).join(", ")}.`
        : "No invoices are due to be raised. Every running or upcoming term is already invoiced or still in a trial.");
      await mutate();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card
      flush
      title="Subscription invoices"
      description="Raised automatically every few hours, before each term starts. Record bank transfers here; online payments are applied by themselves."
      actions={<Button size="sm" variant="secondary" busy={busy} onClick={generate}>Raise due invoices now</Button>}
    >
      <div className="border-b border-line px-5 pt-1">
        <Tabs tabs={[{ key: "unpaid", label: "Unpaid" }, { key: "overdue", label: "Overdue" }, { key: "paid", label: "Paid" }, { key: "all", label: "All" }]} value={filter} onChange={setFilter} />
      </div>
      {msg && <div className="border-b border-line p-4"><Notice tone="info">{msg}</Notice></div>}
      <ErrorNote error={error} />
      {isLoading ? (
        <div className="p-5"><Loading /></div>
      ) : !rows.length ? (
        <div className="p-5"><Empty title={filter === "overdue" ? "Nothing overdue" : "No invoices here"} /></div>
      ) : (
        <Table>
          <thead><tr><TH>School</TH><TH>Invoice</TH><TH align="right">Amount</TH><TH>Due</TH><TH>Status</TH><TH /></tr></thead>
          <tbody>
            {rows.map(({ schoolName, schoolSlug, invoice: i }) => {
              const target = { id: i.id, number: i.number, school: schoolName, amount: i.amountKobo };
              return (
                <tr key={i.id}>
                  <TD><div className="font-medium">{schoolName}</div><div className="text-xs text-muted">{schoolSlug}</div></TD>
                  <TD><div className="tabular-nums">{i.number}</div><div className="text-xs text-muted">{i.periodLabel} · {i.studentCount} students</div></TD>
                  <TD align="right" className="font-medium tabular-nums">{naira(i.amountKobo)}</TD>
                  <TD className="whitespace-nowrap">{day(i.dueDate)}{i.status === "unpaid" && i.isOverdue && <div className="text-xs text-muted">Read-only from {day(i.readOnlyFrom)}</div>}</TD>
                  <TD>
                    {i.status === "paid" ? <><Badge tone="good" dot>Paid</Badge><div className="mt-1 text-xs text-muted">{i.paidVia}{i.paymentReference ? ` · ${i.paymentReference.slice(0, 18)}` : ""}</div></>
                      : i.status === "void" ? <><Badge>Void</Badge><div className="mt-1 text-xs text-muted">{i.voidReason}</div></>
                        : i.isOverdue ? <Badge tone="bad" dot>Overdue</Badge> : <Badge tone="warn" dot>Unpaid</Badge>}
                  </TD>
                  <TD align="right">
                    {i.status === "unpaid" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setPaying(target)}>Record transfer</Button>
                        <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={() => setVoiding(target)}>Void</Button>
                      </div>
                    )}
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <ActionDialog
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={`Record payment of ${paying?.number ?? ""}`}
        description={`Only after ${naira(paying?.amount)} from ${paying?.school ?? "the school"} has arrived in the platform account. The school gets full access back straight away.`}
        confirmLabel="Mark as paid"
        input={{ label: "Bank reference or note", placeholder: "e.g. GTB transfer 0123456789, 14 Oct" }}
        onConfirm={async (reference) => {
          await gql(MarkPaidDocument, { invoiceId: paying!.id, reference });
          setMsg(`${paying!.number} marked as paid.`);
          await mutate();
        }}
      />
      <ActionDialog
        open={voiding !== null}
        onClose={() => setVoiding(null)}
        title={`Void ${voiding?.number ?? ""}?`}
        description="Use this for an invoice raised in error. The school no longer owes it. Raise a corrected one with the button above."
        confirmLabel="Void invoice"
        tone="danger"
        input={{ label: "Reason", placeholder: "e.g. Student count included graduated students" }}
        onConfirm={async (reason) => {
          await gql(VoidDocument, { invoiceId: voiding!.id, reason });
          setMsg(`${voiding!.number} voided.`);
          await mutate();
        }}
      />
    </Card>
  );
}
