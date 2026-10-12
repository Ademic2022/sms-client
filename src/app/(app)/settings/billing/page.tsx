"use client";

import { useState } from "react";

import { IconDownload, IconMessage } from "@/components/icons";
import { SettingsNav } from "@/components/SettingsNav";
import { Badge, Button, Card, Empty, ErrorNote, Field, Input, Loading, Notice, PageHeader, Stat, Table, TD, TH, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira } from "@/lib/money";
import { useSession } from "@/lib/session";

const BillingDocument = graphql(`
  query Billing {
    billing {
      plan { name pricePerStudentKobo minimumKobo }
      accessMode trialEndsAt inTrial graceDays activeStudents outstandingKobo
      invoices { id number periodLabel studentCount pricePerStudentKobo amountKobo dueDate status paidAt paidVia readOnlyFrom isOverdue pdfUrl }
      smsBalance smsUnitPriceKobo smsMinUnits smsMaxUnits
      smsPurchases { id units amountKobo reason createdAt }
      bank { bankName accountNumber accountName }
      billingEmail
    }
  }
`);

const PayInvoiceDocument = graphql(`
  mutation PayInvoice($invoiceId: ID!, $returnPath: String!) { payInvoice(invoiceId: $invoiceId, returnPath: $returnPath) { authorizationUrl } }
`);

const BuyUnitsDocument = graphql(`
  mutation BuySmsUnits($units: Int!, $returnPath: String!) { buySmsUnits(units: $units, returnPath: $returnPath) { authorizationUrl } }
`);

const RETURN_PATH = "/settings/billing/return";
const PRESETS = [500, 1000, 5000, 10000];

function day(iso: string, month: "short" | "long" = "short") {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month, year: "numeric" });
}

function InvoiceStatus({ status, overdue }: { status: string; overdue: boolean }) {
  if (status === "paid") return <Badge tone="good" dot>Paid</Badge>;
  if (status === "void") return <Badge>Void</Badge>;
  return overdue ? <Badge tone="bad" dot>Overdue</Badge> : <Badge tone="warn" dot>Unpaid</Badge>;
}

export default function BillingPage() {
  const { can } = useSession();
  const allowed = can("school.manage");
  const { data, error, isLoading } = useGql(BillingDocument, allowed ? {} : null);
  const [paying, setPaying] = useState<string | null>(null);
  const [units, setUnits] = useState("1000");
  const [err, setErr] = useState<string | null>(null);

  if (!allowed) return <><PageHeader title="Settings" /><SettingsNav /><Notice>Only the school owner or an administrator can manage billing.</Notice></>;
  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorNote error={error} />;
  const b = data.billing;

  async function go(key: string, start: () => Promise<string>) {
    setPaying(key);
    setErr(null);
    try {
      window.location.assign(await start());
    } catch (e) {
      setErr((e as Error).message);
      setPaying(null);
    }
  }

  const unpaid = b.invoices.filter((i) => i.status === "unpaid").sort((x, y) => x.dueDate.localeCompare(y.dueDate));
  const next = unpaid[0];
  const n = Number(units.replace(/,/g, ""));
  const unitsValid = Number.isInteger(n) && n >= b.smsMinUnits && n <= b.smsMaxUnits;
  const perStudent = b.plan?.pricePerStudentKobo ?? 0;
  const estimate = b.plan ? Math.max(b.activeStudents * perStudent, b.plan.minimumKobo) : 0;

  const status = b.accessMode === "read_only"
    ? { value: "Read-only", hint: next ? `Until invoice ${next.number} is paid` : "Until the overdue invoice is paid" }
    : b.inTrial
      ? { value: "Free trial", hint: `Ends ${day(b.trialEndsAt!, "long")}` }
      : next?.isOverdue
        ? { value: "Overdue", hint: new Date(next.readOnlyFrom) > new Date() ? `Read-only from ${day(next.readOnlyFrom, "long")} if unpaid` : "Please pay as soon as possible" }
        : { value: "Active", hint: next ? `Next invoice due ${day(next.dueDate, "long")}` : "Nothing owed" };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your subscription, invoices and SMS units." />
      <SettingsNav />
      <ErrorNote error={err} />

      {b.accessMode === "read_only" && next && (
        <Notice tone="error" title="The portal is read-only until this invoice is paid">
          Staff can still view and export everything, and no data has been removed. Paying online restores full access straight away.
        </Notice>
      )}
      {b.accessMode !== "read_only" && next?.isOverdue && (
        <Notice tone="warning" title={`Invoice ${next.number} was due on ${day(next.dueDate, "long")}`}>
          {new Date(next.readOnlyFrom) > new Date()
            ? `Please pay it before ${day(next.readOnlyFrom, "long")}. After that the portal becomes read-only until it is paid.`
            : "Please pay it as soon as possible to avoid the portal becoming read-only."}
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={b.plan ? `${b.plan.name} plan` : "Plan"}
          value={b.plan ? naira(perStudent) : "None"}
          hint={b.plan ? `Per active student, per term. ${b.activeStudents.toLocaleString("en-NG")} active today, about ${naira(estimate)} a term.` : "Contact us to choose a plan."}
        />
        <Stat label="Status" value={status.value} hint={status.hint} />
        <Stat label="Outstanding" value={naira(b.outstandingKobo)} hint={unpaid.length ? `${unpaid.length} unpaid invoice${unpaid.length > 1 ? "s" : ""}` : "All invoices paid"} />
      </div>

      <Card
        flush
        title="Invoices"
        description={`Raised ${b.inTrial ? "after your trial, " : ""}before each term starts and due on its first day, for the students active at the time. There are ${b.graceDays} days' grace before the portal becomes read-only.`}
      >
        {b.invoices.length === 0 ? (
          <div className="p-5">
            <Empty title="No invoices yet">
              {b.inTrial
                ? `Your first invoice will be raised for the first term that runs past ${day(b.trialEndsAt!, "long")}, when your trial ends.`
                : "Your next invoice will be raised shortly before your next term starts."}
            </Empty>
          </div>
        ) : (
          <Table>
            <thead><tr><TH>Invoice</TH><TH align="right">Students</TH><TH align="right">Amount</TH><TH>Due</TH><TH>Status</TH><TH /></tr></thead>
            <tbody>
              {b.invoices.map((i) => (
                <tr key={i.id} className={cx(i.status === "void" && "opacity-60")}>
                  <TD><div className="font-medium tabular-nums">{i.number}</div><div className="text-xs text-muted">{i.periodLabel}</div></TD>
                  <TD align="right" className="tabular-nums">{i.studentCount.toLocaleString("en-NG")}</TD>
                  <TD align="right" className="font-medium tabular-nums">{naira(i.amountKobo)}</TD>
                  <TD className="whitespace-nowrap">
                    {day(i.dueDate)}
                    {i.status === "paid" && i.paidAt && <div className="text-xs text-muted">{i.paidVia}, {day(i.paidAt)}</div>}
                  </TD>
                  <TD><InvoiceStatus status={i.status} overdue={i.isOverdue} /></TD>
                  <TD align="right">
                    <div className="flex justify-end gap-2">
                      <a href={i.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-muted hover:bg-subtle hover:text-ink">
                        <IconDownload size={15} /> PDF
                      </a>
                      {i.status === "unpaid" && (
                        <Button size="sm" busy={paying === i.id} disabled={paying !== null}
                          onClick={() => go(i.id, async () => (await gql(PayInvoiceDocument, { invoiceId: i.id, returnPath: RETURN_PATH })).payInvoice.authorizationUrl)}>
                          Pay {naira(i.amountKobo)}
                        </Button>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {b.bank && unpaid.length > 0 && (
          <div className="border-t border-line bg-subtle/40 px-5 py-4 text-sm">
            <div className="font-medium text-ink">Paying by bank transfer instead?</div>
            <p className="mt-1 text-muted">
              Transfer to {b.bank.bankName}, account <span className="font-medium tabular-nums text-ink">{b.bank.accountNumber}</span> ({b.bank.accountName}).
              Use the invoice number as the narration and email {b.billingEmail}. We mark it paid once the money arrives, usually within one working day.
            </p>
          </div>
        )}
      </Card>

      <Card title="SMS units" description={`Messages are charged to your school's own wallet. Units cost ${naira(b.smsUnitPriceKobo)} each and never expire.`}>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="text-[13px] font-medium text-muted">Balance</div>
            <div className="mt-2 font-display text-[34px] font-medium leading-none tabular-nums text-ink">{b.smsBalance.toLocaleString("en-NG")}</div>
            <div className="mt-2 text-xs text-muted">units. A standard SMS of up to 160 characters uses one unit per parent.</div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choose how many units">
              {PRESETS.map((p) => (
                <button key={p} type="button" onClick={() => setUnits(String(p))} aria-pressed={n === p}
                  className={cx("h-9 rounded-lg border px-3.5 text-sm font-medium tabular-nums transition",
                    n === p ? "border-brand bg-brand/10 text-brand-ink" : "border-line bg-surface text-ink hover:bg-subtle")}>
                  {p.toLocaleString("en-NG")}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-44">
                <Field label="Units to buy" error={units && !unitsValid ? `Between ${b.smsMinUnits.toLocaleString("en-NG")} and ${b.smsMaxUnits.toLocaleString("en-NG")}` : undefined}>
                  <Input inputMode="numeric" value={units} onChange={(e) => setUnits(e.target.value.replace(/[^\d]/g, ""))} />
                </Field>
              </div>
              <Button busy={paying === "units"} disabled={!unitsValid || paying !== null}
                onClick={() => go("units", async () => (await gql(BuyUnitsDocument, { units: n, returnPath: RETURN_PATH })).buySmsUnits.authorizationUrl)}>
                Pay {unitsValid ? naira(n * b.smsUnitPriceKobo) : ""}
              </Button>
            </div>
            <p className="text-xs text-muted">Card, bank transfer or USSD through Paystack. Units are added as soon as the payment is confirmed.</p>
          </div>
        </div>
        {b.smsPurchases.length > 0 && (
          <div className="mt-6 border-t border-line pt-4">
            <div className="mb-2 text-[13px] font-medium text-muted">Recent top-ups</div>
            <ul className="divide-y divide-line text-sm">
              {b.smsPurchases.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="inline-flex items-center gap-2 text-ink"><IconMessage size={15} className="text-muted" />{p.units.toLocaleString("en-NG")} units <span className="text-muted">· {p.reason}</span></span>
                  <span className="tabular-nums text-muted">{p.amountKobo ? `${naira(p.amountKobo)} · ` : ""}{day(p.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </>
  );
}
