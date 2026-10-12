"use client";

import { useState } from "react";

import { IconBuilding } from "@/components/icons";
import { ActionDialog, Badge, Button, Card, Empty, ErrorNote, Loading, Notice, PageHeader, SearchInput, Stat, StatusBadge, Table, TD, TH } from "@/components/ui";
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

type SchoolRow = { id: string; name: string; slug: string };

function ago(iso: string | null | undefined) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
}

export default function ConsolePage() {
  const [search, setSearch] = useState("");
  const { data, error, isLoading, mutate } = useGql(PlatformSchoolsDocument, { search: search || null });
  const [msg, setMsg] = useState<string | null>(null);
  const [suspending, setSuspending] = useState<SchoolRow | null>(null);
  const [reactivating, setReactivating] = useState<SchoolRow | null>(null);
  const [crediting, setCrediting] = useState<SchoolRow | null>(null);

  const schools = data?.platformSchools ?? [];
  const students = schools.reduce((s, x) => s + x.studentCount, 0);
  const trials = schools.filter((s) => s.trialEndsAt && new Date(s.trialEndsAt) > new Date()).length;
  const pendingSenders = schools.filter((s) => s.smsSenderStatus === "pending");

  async function done(text: string) {
    setMsg(text);
    await mutate();
  }

  return (
    <>
      <PageHeader title="Schools" subtitle="Every school on the platform, its usage and its status." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Schools" value={schools.length} />
        <Stat label="Active students" value={students.toLocaleString("en-NG")} />
        <Stat label="On free trial" value={trials} />
        <Stat label="Sender names awaiting approval" value={pendingSenders.length} />
      </div>
      <ErrorNote error={error} />
      {msg && <Notice tone="success">{msg}</Notice>}

      {pendingSenders.length > 0 && (
        <Card flush title="SMS sender names awaiting network approval" description="Record the decision once the networks have approved or rejected the name.">
          {pendingSenders.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 last:border-b-0">
              <div className="text-sm"><span className="font-medium text-ink">{s.smsSenderId}</span> <span className="text-muted">· {s.name}</span></div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={async () => { await gql(SenderDocument, { schoolId: s.id, status: "rejected" }); await done(`${s.smsSenderId} marked as rejected.`); }}>Rejected</Button>
                <Button size="sm" onClick={async () => { await gql(SenderDocument, { schoolId: s.id, status: "approved" }); await done(`${s.smsSenderId} approved. ${s.name} now sends under its own name.`); }}>Approved</Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card flush>
        <div className="border-b border-line p-4"><SearchInput placeholder="Search by name or web address" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search schools" /></div>
        {isLoading ? (
          <div className="p-5"><Loading /></div>
        ) : !schools.length ? (
          <div className="p-5"><Empty title="No schools found" icon={<IconBuilding size={18} />} /></div>
        ) : (
          <Table>
            <thead><tr><TH>School</TH><TH align="right">Students</TH><TH>Plan</TH><TH>Status</TH><TH>Last active</TH><TH /></tr></thead>
            <tbody>
              {schools.map((s) => {
                const onTrial = s.trialEndsAt && new Date(s.trialEndsAt) > new Date();
                return (
                  <tr key={s.id}>
                    <TD><div className="font-medium">{s.name}</div><div className="text-xs text-muted">{s.slug}</div></TD>
                    <TD align="right" className="tabular-nums">{s.studentCount.toLocaleString("en-NG")}</TD>
                    <TD>{onTrial ? <Badge tone="brand">Trial to {new Date(s.trialEndsAt!).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</Badge> : <span className="text-muted">{s.plan ?? "No plan"}</span>}</TD>
                    <TD><StatusBadge status={s.status === "active" && s.accessMode !== "full" ? s.accessMode : s.status} /></TD>
                    <TD className="text-muted">{ago(s.lastActivityAt)}</TD>
                    <TD align="right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setCrediting(s)}>Add SMS units</Button>
                        {s.status === "active" ? (
                          <Button size="sm" variant="ghost" className="text-red-700 dark:text-red-300" onClick={() => setSuspending(s)}>Suspend</Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setReactivating(s)}>Reactivate</Button>
                        )}
                      </div>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      <ActionDialog
        open={suspending !== null}
        onClose={() => setSuspending(null)}
        title={`Suspend ${suspending?.name ?? ""}?`}
        description="Nobody at the school can sign in until it is reactivated, and parents cannot pay online. No data is deleted."
        confirmLabel="Suspend school"
        tone="danger"
        input={{ label: "Reason", placeholder: "e.g. Requested by the proprietor", hint: "Recorded in the platform audit log." }}
        onConfirm={async (reason) => {
          await gql(SetStatusDocument, { schoolId: suspending!.id, status: "suspended", reason });
          await done(`${suspending!.name} suspended.`);
        }}
      />
      <ActionDialog
        open={reactivating !== null}
        onClose={() => setReactivating(null)}
        title={`Reactivate ${reactivating?.name ?? ""}?`}
        description="Staff, parents and students can sign in again straight away."
        confirmLabel="Reactivate school"
        onConfirm={async () => {
          await gql(SetStatusDocument, { schoolId: reactivating!.id, status: "active", reason: "" });
          await done(`${reactivating!.name} reactivated.`);
        }}
      />
      <ActionDialog
        open={crediting !== null}
        onClose={() => setCrediting(null)}
        title={`Add SMS units to ${crediting?.name ?? ""}`}
        description="Use after the school has paid for units."
        confirmLabel="Add units"
        input={{ label: "Number of units", type: "number", placeholder: "5000" }}
        onConfirm={async (value) => {
          const units = Number(value);
          if (!Number.isInteger(units) || units <= 0) throw new Error("Enter a whole number of units.");
          const { creditSmsUnits } = await gql(CreditDocument, { schoolId: crediting!.id, units, reason: "Purchase" });
          await done(`${units.toLocaleString("en-NG")} units added to ${crediting!.name}. New balance ${creditSmsUnits.toLocaleString("en-NG")}.`);
        }}
      />
    </>
  );
}
