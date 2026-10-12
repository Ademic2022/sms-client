"use client";

import { useDeferredValue, useState } from "react";

import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { ArmsDocument } from "@/lib/queries";

const MessagesDocument = graphql(`
  query Messages {
    smsWalletBalance
    messages(limit: 30) {
      id kind audience title body unitsUsed createdAt sendSms
      arm { label }
      delivery { queued sent delivered failed skipped }
      failedRecipients { id phone error }
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

const AUDIENCES: Record<string, string> = {
  all_parents: "All parents",
  class_parents: "Parents in one class",
  staff: "All staff",
  debtors: "Parents of students owing fees",
};

export default function MessagesPage() {
  const { data, isLoading, mutate } = useGql(MessagesDocument, {});
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
      setMsg(`Message sent. ${sendMessage.unitsUsed} SMS units used.`);
      setForm({ ...form, title: "", body: "" });
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
      <PageHeader title="Messages" subtitle={data ? <>SMS wallet: <strong>{data.smsWalletBalance}</strong> units</> : undefined} />
      <Card title="New announcement">
        <div className="space-y-3">
          <ErrorNote error={err} />
          {msg && <Notice tone="success">{msg}</Notice>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Send to">
              <Select value={form.audience} onChange={(ev) => setForm({ ...form, audience: ev.target.value })}>
                {Object.entries(AUDIENCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            {form.audience === "class_parents" && (
              <Field label="Class">
                <Select value={form.armId} onChange={(ev) => setForm({ ...form, armId: ev.target.value })}>
                  <option value="">Choose…</option>
                  {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </Select>
              </Field>
            )}
          </div>
          <Field label="Title (shown in the portal)"><Input value={form.title} onChange={(ev) => setForm({ ...form, title: ev.target.value })} /></Field>
          <Field label="Message" hint="You can use {student_name}, {balance} and {school_name}. Keep it under 160 characters for one SMS per parent.">
            <Textarea rows={4} value={form.body} onChange={(ev) => setForm({ ...form, body: ev.target.value })} />
          </Field>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.sendSms} onChange={(ev) => setForm({ ...form, sendSms: ev.target.checked })} /> Send by SMS</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.showInApp} onChange={(ev) => setForm({ ...form, showInApp: ev.target.checked })} /> Show as a notice in the portal</label>
          </div>
          {e && form.sendSms && (
            <Notice tone={short ? "warning" : "info"}>
              {e.recipients} recipients · {e.units} SMS units · sender name {e.senderId}
              {short && ` · Your wallet has ${e.walletBalance} units. Buy more units first.`}
            </Notice>
          )}
          <Button busy={busy} onClick={send} disabled={!form.body.trim() || !!short || (form.audience === "class_parents" && !form.armId)}>Send</Button>
        </div>
      </Card>
      <Card title="Sent">
        {isLoading ? <Loading /> : (
          <ul className="divide-y divide-line text-sm">
            {data?.messages.map((m) => (
              <li key={m.id} className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{m.title || AUDIENCES[m.audience] || m.kind}{m.arm && ` · ${m.arm.label}`}</span>
                  <span className="text-xs text-muted">{new Date(m.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-muted">{m.body}</p>
                {m.sendSms && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge tone="good">{m.delivery.sent + m.delivery.delivered} sent</Badge>
                    {m.delivery.queued > 0 && <Badge>{m.delivery.queued} queued</Badge>}
                    {m.delivery.failed > 0 && <Badge tone="bad">{m.delivery.failed} failed</Badge>}
                    {m.delivery.skipped > 0 && <Badge tone="warn">{m.delivery.skipped} not sent (no units)</Badge>}
                    <Badge>{m.unitsUsed} units</Badge>
                  </div>
                )}
                {m.failedRecipients.length > 0 && (
                  <details className="mt-1 text-xs"><summary className="cursor-pointer text-red-700">Failed numbers</summary>
                    <ul>{m.failedRecipients.map((r) => <li key={r.id}>{r.phone}: {r.error}</li>)}</ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
