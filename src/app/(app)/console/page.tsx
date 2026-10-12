"use client";

import { useState } from "react";

import { Badge, Button, Card, ErrorNote, Input, Loading, Notice, PageHeader, statusTone } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";

const PlatformSchoolsDocument = graphql(`
  query PlatformSchools($search: String) {
    platformSchools(search: $search) {
      id name slug status accessMode plan studentCount trialEndsAt lastActivityAt createdAt smsSenderId smsSenderStatus
    }
  }
`);

const SetStatusDocument = graphql(`
  mutation SetSchoolStatus($schoolId: ID!, $status: String!, $reason: String!) { setSchoolStatus(schoolId: $schoolId, status: $status, reason: $reason) { id status } }
`);
const SenderDocument = graphql(`mutation SetSenderStatus($schoolId: ID!, $status: String!) { setSenderIdStatus(schoolId: $schoolId, status: $status) }`);
const CreditDocument = graphql(`
  mutation CreditSms($schoolId: ID!, $units: Int!, $reason: String!) { creditSmsUnits(schoolId: $schoolId, units: $units, reason: $reason) }
`);

function ago(iso: string | null | undefined) {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days === 0 ? "today" : `${days}d ago`;
}

export default function ConsolePage() {
  const [search, setSearch] = useState("");
  const { data, error, isLoading, mutate } = useGql(PlatformSchoolsDocument, { search: search || null });
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, done: string) {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(done);
      await mutate();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  const schools = data?.platformSchools ?? [];
  return (
    <>
      <PageHeader title="Platform console" subtitle={`${schools.length} schools · ${schools.reduce((s, x) => s + x.studentCount, 0)} active students`} />
      <Input type="search" placeholder="Search schools" value={search} onChange={(e) => setSearch(e.target.value)} />
      <ErrorNote error={error ?? err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      {isLoading ? <Loading /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {schools.map((s) => (
            <Card key={s.id} title={<>{s.name} <span className="text-sm font-normal text-muted">· {s.slug}</span></>}>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge tone={statusTone[s.status]}>{s.status}</Badge>
                {s.accessMode !== "full" && <Badge tone="warn">{s.accessMode}</Badge>}
                <Badge>{s.plan ?? "no plan"}</Badge>
                <Badge>{s.studentCount} students</Badge>
                <Badge>active {ago(s.lastActivityAt)}</Badge>
                {s.trialEndsAt && new Date(s.trialEndsAt) > new Date() && <Badge tone="brand">trial to {new Date(s.trialEndsAt).toLocaleDateString("en-NG")}</Badge>}
              </div>
              {s.smsSenderId && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  Sender ID <strong>{s.smsSenderId}</strong>: {s.smsSenderStatus}
                  {s.smsSenderStatus === "pending" && (
                    <>
                      <Button variant="ghost" onClick={() => run(() => gql(SenderDocument, { schoolId: s.id, status: "approved" }), "Sender ID approved.")}>Approve</Button>
                      <Button variant="ghost" onClick={() => run(() => gql(SenderDocument, { schoolId: s.id, status: "rejected" }), "Sender ID rejected.")}>Reject</Button>
                    </>
                  )}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {s.status === "active" ? (
                  <Button variant="danger" onClick={() => {
                    const reason = window.prompt(`Suspend ${s.name}? Give a reason.`);
                    if (reason) void run(() => gql(SetStatusDocument, { schoolId: s.id, status: "suspended", reason }), `${s.name} suspended.`);
                  }}>Suspend</Button>
                ) : (
                  <Button variant="secondary" onClick={() => run(() => gql(SetStatusDocument, { schoolId: s.id, status: "active", reason: "" }), `${s.name} reactivated.`)}>Reactivate</Button>
                )}
                <Button variant="secondary" onClick={() => {
                  const units = Number(window.prompt("How many SMS units to add?") ?? "");
                  if (units > 0) void run(() => gql(CreditDocument, { schoolId: s.id, units, reason: "Purchase" }), `${units} units added to ${s.name}.`);
                }}>Add SMS units</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
