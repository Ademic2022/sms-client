"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, ButtonLink, Card, Empty, ErrorNote, Loading, Notice, PageHeader, Select, Stat, Textarea } from "@/components/ui";
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
  const [armId, setArmId] = useState("");
  const arms = useGql(ArmsDocument, {});
  const { data, error, isLoading, mutate } = useGql(FeesOverviewDocument, term ? { termId: term.id, armId: armId || null } : null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reminder, setReminder] = useState(`Dear parent, {student_name}'s school fees balance is {balance}. Kindly pay. Thank you. - ${school?.name ?? ""}`.slice(0, 160));
  const [showReminder, setShowReminder] = useState(false);

  if (!term) return <Notice tone="warning">Set the current term first.</Notice>;

  async function run(name: string, fn: () => Promise<string>) {
    setBusy(name);
    setErr(null);
    setMsg(null);
    try {
      setMsg(await fn());
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const f = data?.termFeeSummary;
  return (
    <>
      <PageHeader
        title="Fees"
        subtitle={term.label}
        actions={
          <>
            {can("payments.record") && <ButtonLink href="/fees/payments">Record payment</ButtonLink>}
            {can("fees.manage") && <ButtonLink href="/fees/setup" variant="secondary">Fee setup</ButtonLink>}
          </>
        }
      />
      <ErrorNote error={error ?? err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      {f && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Expected" value={naira(f.expectedKobo)} />
          <Stat label="Collected" value={naira(f.collectedKobo)} hint={`${naira(f.collectedOnlineKobo)} online`} />
          <Stat label="Outstanding" value={naira(f.outstandingKobo)} />
          <Stat label="Debtors" value={f.debtorCount} />
        </div>
      )}
      {can("fees.manage") && (
        <Card title="Term bills">
          <p className="mb-3 text-sm text-muted">Bill every active student for {term.label} from the fee setup, with their discounts. Students who already have a bill are skipped, so it is safe to run again after adding new students.</p>
          <Button busy={busy === "bills"} onClick={() => run("bills", async () => {
            const { generateBills } = await gql(GenerateBillsDocument, { termId: term.id });
            return `${generateBills} new bill(s) created.`;
          })}>Generate term bills</Button>
        </Card>
      )}
      <Card
        title="Debtors"
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={armId} onChange={(e) => setArmId(e.target.value)} className="w-auto">
              <option value="">All classes</option>
              {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
            <a className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm font-semibold" href={`/files/debtors.xlsx${armId ? `?arm=${armId}` : ""}`}>Excel</a>
            {can("messaging.send") && <Button variant="secondary" onClick={() => setShowReminder(!showReminder)}>SMS reminder</Button>}
          </div>
        }
      >
        {showReminder && (
          <div className="mb-4 space-y-2 rounded-lg bg-subtle p-3">
            <Textarea rows={3} value={reminder} onChange={(e) => setReminder(e.target.value)} />
            <p className="text-xs text-muted">{"{student_name}"} and {"{balance}"} are filled in for each parent. Sent to every debtor&apos;s parents, charged to your SMS wallet.</p>
            <Button busy={busy === "remind"} onClick={() => run("remind", async () => {
              const { sendMessage } = await gql(RemindDocument, { body: reminder });
              setShowReminder(false);
              return `Reminders queued. ${sendMessage.unitsUsed} SMS units used.`;
            })}>Send to all debtors</Button>
          </div>
        )}
        {isLoading ? (
          <Loading />
        ) : !data?.debtors.length ? (
          <Empty>No one owes fees.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {data.debtors.map((d) => (
              <li key={d.student.id}>
                <Link href={`/fees/student/${d.student.id}`} className="flex min-h-12 items-center justify-between gap-3 py-1 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{d.student.fullName}</span>
                    <span className="text-xs text-muted">{d.student.admissionNumber} · {d.student.currentArm?.label}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-red-700 dark:text-red-400">{naira(d.balanceKobo)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
