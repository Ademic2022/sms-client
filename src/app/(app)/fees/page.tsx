"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconDownload, IconMessage, IconPlus, IconSettings, IconWallet } from "@/components/icons";
import { ActionDialog, Button, ButtonLink, Card, Dialog, Empty, ErrorNote, Field, Loading, Notice, PageHeader, Select, Stat, Table, TD, TH, Textarea } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira } from "@/lib/money";
import { ArmsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const FeesOverviewDocument = graphql(`
  query FeesOverview($termId: ID!, $armId: ID) {
    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }
    debtors(armId: $armId) { balanceKobo student { id fullName admissionNumber currentArm { label } } }
  }
`);

const GenerateBillsDocument = graphql(`
  mutation GenerateBills($termId: ID!) { generateBills(termId: $termId) }
`);

const RemindDocument = graphql(`
  mutation RemindDebtors($body: String!) {
    sendMessage(audience: "debtors", body: $body, showInApp: false) { id unitsUsed }
  }
`);

export default function FeesPage() {
  const { term, can, school } = useSession();
  const router = useRouter();
  const [armId, setArmId] = useState("");
  const arms = useGql(ArmsDocument, {});
  const { data, error, isLoading, mutate } = useGql(FeesOverviewDocument, term ? { termId: term.id, armId: armId || null } : null);
  const [msg, setMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "bills" | "remind">(null);
  const [reminder, setReminder] = useState(`Dear parent, {student_name}'s school fees balance is {balance}. Kindly make payment. Thank you. ${school?.name ?? ""}`.trim());
  const [remindBusy, setRemindBusy] = useState(false);
  const [remindErr, setRemindErr] = useState<string | null>(null);

  if (!term) return <Notice tone="warning" title="No current term">Set the current term in Settings before managing fees.</Notice>;

  const f = data?.termFeeSummary;
  const rate = f && f.expectedKobo ? Math.round((f.collectedKobo / f.expectedKobo) * 100) : 0;
  const debtors = data?.debtors ?? [];
  const debtorTotal = debtors.reduce((n, d) => n + d.balanceKobo, 0);

  return (
    <>
      <PageHeader
        eyebrow={term.label}
        title="Fees and payments"
        actions={
          <>
            {can("fees.manage") && <ButtonLink href="/fees/setup" variant="secondary" icon={<IconSettings size={16} />}>Fee setup</ButtonLink>}
            {can("fees.view") && <ButtonLink href="/fees/payments" variant="secondary" icon={<IconWallet size={16} />}>Payments</ButtonLink>}
            {can("payments.record") && <ButtonLink href="/fees/payments#record" icon={<IconPlus size={16} />}>Record payment</ButtonLink>}
          </>
        }
      />
      <ErrorNote error={error} />
      {msg && <Notice tone="success">{msg}</Notice>}
      {f && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <Stat label="Billed this term" value={naira(f.expectedKobo)} />
          <Stat label="Collected" value={naira(f.collectedKobo)} hint={`${rate}% of billed`} />
          <Stat label="Collected online" value={naira(f.collectedOnlineKobo)} hint="Card, transfer and USSD" />
          <Stat label="Outstanding" value={naira(f.outstandingKobo)} hint={`${f.debtorCount} students owing`} />
        </div>
      )}

      {can("fees.manage") && (
        <Card title="Term bills" description={`Bill every active student for ${term.label} from your fee setup, with their discounts applied.`}
          actions={<Button size="sm" onClick={() => setDialog("bills")}>Generate bills</Button>}>
          <p className="text-sm leading-relaxed text-muted">
            Students who already have a bill for this term are skipped, so it is safe to run again after admitting new students. Optional items such as bus and lessons are added per student from their fees account.
          </p>
        </Card>
      )}

      <Card
        flush
        title="Students owing"
        description={debtors.length ? `${debtors.length} students · ${naira(debtorTotal)} outstanding` : undefined}
        actions={
          <>
            <Select value={armId} onChange={(e) => setArmId(e.target.value)} className="w-auto" aria-label="Class">
              <option value="">All classes</option>
              {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
            <ButtonLink href={`/files/debtors.xlsx${armId ? `?arm=${armId}` : ""}`} variant="secondary" size="sm" icon={<IconDownload size={15} />}>Excel</ButtonLink>
            {can("messaging.send") && debtors.length > 0 && <Button variant="secondary" size="sm" icon={<IconMessage size={15} />} onClick={() => setDialog("remind")}>SMS reminder</Button>}
          </>
        }
      >
        {isLoading ? (
          <div className="p-5"><Loading /></div>
        ) : !debtors.length ? (
          <div className="p-5"><Empty title="No outstanding balances" icon={<IconWallet size={18} />}>Every student in this view has paid in full.</Empty></div>
        ) : (
          <Table>
            <thead><tr><TH>Student</TH><TH>Admission no.</TH><TH>Class</TH><TH align="right">Balance</TH></tr></thead>
            <tbody>
              {debtors.map((d) => (
                <tr key={d.student.id} className="cursor-pointer transition hover:bg-subtle/60" onClick={() => router.push(`/fees/student/${d.student.id}`)}>
                  <TD className="font-medium">{d.student.fullName}</TD>
                  <TD className="tabular-nums text-muted">{d.student.admissionNumber}</TD>
                  <TD>{d.student.currentArm?.label}</TD>
                  <TD align="right" className="font-semibold tabular-nums">{naira(d.balanceKobo)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <ActionDialog
        open={dialog === "bills"}
        onClose={() => setDialog(null)}
        title={`Generate bills for ${term.label}?`}
        description="Every active student without a bill this term is charged the compulsory items for their level, less their discounts. Each parent's balance updates immediately."
        confirmLabel="Generate bills"
        onConfirm={async () => {
          const { generateBills } = await gql(GenerateBillsDocument, { termId: term.id });
          setMsg(generateBills ? `${generateBills} new bill${generateBills === 1 ? "" : "s"} created.` : "Every student already has a bill for this term.");
          await mutate();
        }}
      />
      <Dialog
        open={dialog === "remind"}
        onClose={() => setDialog(null)}
        title="Send a fee reminder"
        description={`Sent by SMS to the parents of all ${f?.debtorCount ?? debtors.length} students owing, charged to your SMS wallet.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button icon={<IconMessage size={15} />} busy={remindBusy} disabled={!reminder.trim()} onClick={async () => {
              setRemindBusy(true);
              setRemindErr(null);
              try {
                const { sendMessage } = await gql(RemindDocument, { body: reminder });
                setMsg(`Reminders are on their way. ${sendMessage.unitsUsed} SMS units used.`);
                setDialog(null);
              } catch (e) {
                setRemindErr((e as Error).message);
              } finally {
                setRemindBusy(false);
              }
            }}>Send reminders</Button>
          </>
        }
      >
        <div className="space-y-3">
          <ErrorNote error={remindErr} />
          <Field label="Message" hint={<>{"{student_name}"} and {"{balance}"} are filled in for each family. {reminder.length} characters.</>}>
            <Textarea rows={4} value={reminder} onChange={(e) => setReminder(e.target.value)} />
          </Field>
        </div>
      </Dialog>
    </>
  );
}
