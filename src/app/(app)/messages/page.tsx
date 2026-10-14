"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";

import { IconMessage, IconSend } from "@/components/icons";
import { LowUnitsNotice } from "@/components/LowUnitsNotice";
import { ActionDialog, Badge, Button, Card, Checkbox, Empty, ErrorNote, Field, Input, Loading, Notice, PageHeader, Pager, Select, Textarea, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { localPhone } from "@/lib/money";
import { ArmsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const ResendDocument = graphql(`mutation ResendFailed($messageId: ID!) { resendFailed(messageId: $messageId) { id unitsUsed } }`);

const MessagesDocument = graphql(`
  query Messages($offset: Int!) {
    smsWalletBalance
    messages(offset: $offset, limit: 20) {
      total
      items {
        id kind audience title body unitsUsed createdAt sendSms isAutomatic
        arm { label }
        delivery { queued sent delivered failed skipped resent }
        failedRecipients { id phone error }
      }
    }
  }
`);

const EstimateDocument = graphql(`
  query EstimateMessage($body: String!, $audience: String!, $armId: ID) {
    estimateMessage(body: $body, audience: $audience, armId: $armId) { recipients units walletBalance senderId }
  }
`);

const SendDocument = graphql(`
  mutation SendMessage($audience: String!, $body: String!, $title: String!, $armId: ID, $sendSms: Boolean!, $showInApp: Boolean!) {
    sendMessage(audience: $audience, body: $body, title: $title, armId: $armId, sendSms: $sendSms, showInApp: $showInApp) { id unitsUsed }
  }
`);

const PAGE = 20;

const AUDIENCES: Record<string, { label: string; text: string }> = {
  all_parents: { label: "All parents", text: "Every parent with a child in school" },
  class_parents: { label: "One class", text: "Parents of students in a class" },
  debtors: { label: "Parents owing fees", text: "Use {balance} for each family's balance" },
  staff: { label: "All staff", text: "Teachers, bursar and administrators" },
};

const KIND_LABELS: Record<string, string> = {
  announcement: "Announcement",
  fee_reminder: "Fee reminder",
  receipt: "Payment receipt",
  result: "Results published",
  absence: "Absence alert",
};

export default function MessagesPage() {
  const { can } = useSession();
  const [resending, setResending] = useState<{ id: string; count: number } | null>(null);
  const [offset, setOffset] = useState(0);
  const { data, isLoading, mutate } = useGql(MessagesDocument, { offset });
  const arms = useGql(ArmsDocument, {});
  const [form, setForm] = useState({ audience: "all_parents", armId: "", title: "", body: "", sendSms: true, showInApp: true });
  const deferredBody = useDeferredValue(form.body);
  const ready = deferredBody.trim() && (form.audience !== "class_parents" || form.armId);
  const estimate = useGql(EstimateDocument, ready ? { body: deferredBody, audience: form.audience, armId: form.armId || null } : null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const { sendMessage } = await gql(SendDocument, { ...form, armId: form.armId || null });
      setMsg(form.sendSms ? `Message sent. ${sendMessage.unitsUsed} SMS units used.` : "Notice posted to the portal.");
      setForm({ ...form, title: "", body: "" });
      setOffset(0);
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const e = estimate.data?.estimateMessage;
  const short = e && form.sendSms && e.units > e.walletBalance;

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Announcements by SMS and in the portal. SMS is charged to your school's wallet."
        actions={data && <div className="rounded-lg border border-line bg-surface px-4 py-2 text-right shadow-sm"><div className="text-xs text-muted">SMS wallet</div><div className="font-display text-lg font-medium tabular-nums text-ink">{data.smsWalletBalance.toLocaleString("en-NG")} units</div>{can("school.manage") && <Link href="/settings/billing" className="text-xs font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)]">Buy units</Link>}</div>}
      />
      <LowUnitsNotice />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="New message">
          <div className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-ink">Send to</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(AUDIENCES).map(([k, a]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, audience: k })}
                    aria-pressed={form.audience === k}
                    className={cx("rounded-lg border px-3.5 py-2.5 text-left transition", form.audience === k ? "border-brand bg-brand/5 ring-[3px] ring-brand/10" : "border-line-strong hover:bg-subtle")}
                  >
                    <div className="text-sm font-medium text-ink">{a.label}</div>
                    <div className="text-xs text-muted">{a.text}</div>
                  </button>
                ))}
              </div>
            </fieldset>
            {form.audience === "class_parents" && (
              <Field label="Class">
                <Select value={form.armId} onChange={(ev) => setForm({ ...form, armId: ev.target.value })}>
                  <option value="">Select a class</option>
                  {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Title" optional hint="Shown with the notice in the portal. Not included in the SMS.">
              <Input value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} placeholder="e.g. Mid-term break" />
            </Field>
            <Field label="Message" hint={<>Placeholders: {"{student_name}"}, {"{balance}"}, {"{school_name}"}. Up to 160 characters is one SMS per family. <span className="tabular-nums">{form.body.length} characters.</span></>}>
              <Textarea rows={5} value={form.body} onChange={(ev) => setForm({ ...form, body: ev.target.value })} placeholder="Dear parent, school resumes on Monday, 6 January…" />
            </Field>
            <div className="space-y-3">
              <Checkbox label="Send by SMS" description="Reaches every parent, including those not on the portal." checked={form.sendSms} onChange={(v) => setForm({ ...form, sendSms: v })} />
              <Checkbox label="Post as a notice in the portal" checked={form.showInApp} onChange={(v) => setForm({ ...form, showInApp: v })} />
            </div>
            {e && form.sendSms && (
              <div className={cx("grid grid-cols-3 divide-x divide-line rounded-lg border text-center", short ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" : "border-line bg-subtle/50")}>
                <div className="px-3 py-2.5"><div className="text-xs text-muted">Recipients</div><div className="font-semibold tabular-nums text-ink">{e.recipients}</div></div>
                <div className="px-3 py-2.5"><div className="text-xs text-muted">SMS units</div><div className="font-semibold tabular-nums text-ink">{e.units}</div></div>
                <div className="px-3 py-2.5"><div className="text-xs text-muted">Sender name</div><div className="truncate font-semibold text-ink">{e.senderId}</div></div>
              </div>
            )}
            {short && (
              <Notice tone="warning" title="Not enough SMS units">
                This message needs {e?.units} units and your wallet has {e?.walletBalance}.{" "}
                {can("school.manage") ? <><Link className="font-semibold underline underline-offset-2" href="/settings/billing">Buy more units</Link> or send it as a portal notice only.</> : "Ask the school owner to buy more units, or send it as a portal notice only."}
              </Notice>
            )}
            <div className="flex justify-end border-t border-line pt-4">
              <Button icon={<IconSend size={15} />} busy={busy} onClick={send} disabled={!form.body.trim() || !!short || (!form.sendSms && !form.showInApp) || (form.audience === "class_parents" && !form.armId)}>
                Send message
              </Button>
            </div>
          </div>
        </Card>

        <Card flush title="Sent" description="Delivery status for each message">
          {isLoading ? (
            <div className="p-5"><Loading /></div>
          ) : !data?.messages.items.length ? (
            <div className="p-5"><Empty title="Nothing sent yet" icon={<IconMessage size={18} />}>Receipts, result alerts and your announcements appear here.</Empty></div>
          ) : (
            <ul className="max-h-[720px] overflow-y-auto">
              {data.messages.items.map((m) => {
                return (
                  <li key={m.id} className="border-b border-line px-5 py-4 last:border-b-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2"><span className="truncate text-sm font-medium text-ink">{m.title || KIND_LABELS[m.kind] || m.kind}</span>{m.isAutomatic && <Badge tone="brand">Automatic</Badge>}</span>
                      <time className="flex-none text-xs text-muted">{new Date(m.createdAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time>
                    </div>
                    <div className="mt-0.5 text-xs text-muted">{AUDIENCES[m.audience]?.label ?? "Individual"}{m.arm && ` · ${m.arm.label}`}</div>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{m.body}</p>
                    {m.sendSms && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.delivery.delivered > 0 && <Badge tone="good" dot>{m.delivery.delivered} delivered</Badge>}
                        {m.delivery.sent > 0 && <Badge dot>{m.delivery.sent} awaiting delivery report</Badge>}
                        {m.delivery.queued > 0 && <Badge dot>{m.delivery.queued} queued</Badge>}
                        {m.delivery.failed > 0 && <Badge tone="bad" dot>{m.delivery.failed} failed</Badge>}
                        {m.delivery.skipped > 0 && <Badge tone="warn" dot>{m.delivery.skipped} not sent: no units</Badge>}
                        {m.delivery.resent > 0 && <Badge dot>{m.delivery.resent} sent again later</Badge>}
                        <Badge>{m.unitsUsed} unit{m.unitsUsed === 1 ? "" : "s"}</Badge>
                      </div>
                    )}
                    {m.failedRecipients.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-xs">
                        <details>
                          <summary className="cursor-pointer font-medium text-red-700 dark:text-red-300">Show numbers not reached</summary>
                          <ul className="mt-1 space-y-0.5 text-muted">{m.failedRecipients.map((r) => <li key={r.id}><span className="tabular-nums">{localPhone(r.phone)}</span>: {r.error}</li>)}</ul>
                        </details>
                        {can("messaging.send") && (
                          <Button size="sm" variant="secondary" onClick={() => setResending({ id: m.id, count: m.failedRecipients.length })}>
                            Resend to {m.failedRecipients.length} number{m.failedRecipients.length === 1 ? "" : "s"}
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {data && <Pager offset={offset} pageSize={PAGE} total={data.messages.total} onChange={setOffset} />}
        </Card>
      </div>
      <ActionDialog
        open={resending !== null}
        onClose={() => setResending(null)}
        title={`Resend to ${resending?.count ?? 0} number${resending?.count === 1 ? "" : "s"}?`}
        description="Each parent gets the same text as before. This uses SMS units again. If a number is on Do Not Disturb or switched off, it may fail again."
        confirmLabel="Resend"
        onConfirm={async () => {
          const { resendFailed } = await gql(ResendDocument, { messageId: resending!.id });
          setMsg(`Resent. ${resendFailed.unitsUsed} SMS units used.`);
          await mutate();
        }}
      />
    </>
  );
}
