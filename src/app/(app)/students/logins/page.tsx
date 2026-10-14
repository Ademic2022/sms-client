"use client";

import { useState } from "react";

import { Badge, Button, Card, Empty, ErrorNote, Loading, Notice, PageHeader, Select, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { ArmsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const ClassStudentsDocument = graphql(`
  query ClassStudentLogins($armId: ID) {
    students(armId: $armId, status: "active", limit: 200) { total items { id fullName admissionNumber hasLogin currentArm { label } } }
  }
`);
const CreateDocument = graphql(`
  mutation CreateStudentLogins($armId: ID!) {
    createStudentLogins(armId: $armId) { password student { id fullName admissionNumber currentArm { label } } }
  }
`);
const ResetDocument = graphql(`
  mutation ResetStudentPassword($studentId: ID!) {
    resetStudentPassword(studentId: $studentId) { password student { id fullName admissionNumber currentArm { label } } }
  }
`);

type Slip = { password: string; student: { id: string; fullName: string; admissionNumber: string; currentArm?: { label: string } | null } };

/** Portal logins for a class: create them in one go, reset one, and print slips with the starting passwords. */
export default function StudentLoginsPage() {
  const { school, can } = useSession();
  const arms = useGql(ArmsDocument, {});
  const [armId, setArmId] = useState("");
  const students = useGql(ClassStudentsDocument, armId ? { armId } : null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const rows = students.data?.students.items ?? [];
  const without = rows.filter((s) => !s.hasLogin).length;
  const address = typeof window !== "undefined" ? window.location.host : "";

  async function run(key: string, fn: () => Promise<Slip[]>) {
    setBusy(key);
    setErr(null);
    try {
      const made = await fn();
      // Newest first; a student reset twice keeps only their latest password.
      setSlips((old) => [...made, ...old.filter((o) => !made.some((m) => m.student.id === o.student.id))]);
      await students.mutate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!can("students.manage")) return <ErrorNote error="Only staff who manage students can create portal logins." />;

  return (
    <>
      <div className="print:hidden space-y-6">
        <PageHeader
          back={{ href: "/students", label: "Students" }}
          title="Student portal logins"
          subtitle="Students sign in with their admission number and a starting password, then choose their own."
        />
        <ErrorNote error={err} />
        <Card
          flush
          title="Choose a class"
          actions={
            <Select value={armId} onChange={(e) => setArmId(e.target.value)} className="w-auto" aria-label="Class">
              <option value="">Select a class</option>
              {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          }
        >
          {!armId ? (
            <div className="p-5"><Empty title="No class selected">Pick a class to see which students have a login.</Empty></div>
          ) : students.isLoading ? (
            <div className="p-5"><Loading /></div>
          ) : !rows.length ? (
            <div className="p-5"><Empty title="No active students in this class" /></div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 text-sm">
                <span className="text-muted">{rows.length - without} of {rows.length} have a login</span>
                <Button size="sm" busy={busy === "all"} disabled={!without}
                  onClick={() => run("all", async () => (await gql(CreateDocument, { armId })).createStudentLogins)}>
                  {without ? `Create logins for ${without} student${without === 1 ? "" : "s"}` : "Everyone has a login"}
                </Button>
              </div>
              <Table>
                <thead><tr><TH>Student</TH><TH>Admission no.</TH><TH>Login</TH><TH /></tr></thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <TD className="font-medium">{s.fullName}</TD>
                      <TD className="tabular-nums text-muted">{s.admissionNumber}</TD>
                      <TD>{s.hasLogin ? <Badge tone="good" dot>Has login</Badge> : <Badge>None yet</Badge>}</TD>
                      <TD align="right">
                        <Button size="sm" variant="secondary" busy={busy === s.id}
                          onClick={() => run(s.id, async () => [(await gql(ResetDocument, { studentId: s.id })).resetStudentPassword])}>
                          {s.hasLogin ? "Reset password" : "Create login"}
                        </Button>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Card>
        {slips.length > 0 && (
          <Notice tone="warning" title={`${slips.length} login slip${slips.length === 1 ? "" : "s"} ready`}>
            Print them now: starting passwords are shown only once. A lost slip can be replaced with Reset password.
            <div className="mt-3"><Button size="sm" onClick={() => window.print()}>Print slips</Button></div>
          </Notice>
        )}
      </div>

      {slips.length > 0 && (
        <section id="login-slips" aria-label="Login slips" className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
          {slips.map((slip) => (
            <div key={slip.student.id} className="break-inside-avoid rounded-lg border border-dashed border-line-strong bg-surface p-4 text-sm print:rounded-none print:border-black">
              <div className="font-semibold text-ink">{school?.name} student portal</div>
              <div className="mt-1 text-muted">{slip.student.fullName} · {slip.student.currentArm?.label}</div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-muted">Web address</dt><dd className="font-medium text-ink">{address}</dd>
                <dt className="text-muted">Admission number</dt><dd className="font-mono font-medium text-ink">{slip.student.admissionNumber}</dd>
                <dt className="text-muted">Starting password</dt><dd className="font-mono text-base font-semibold tracking-wide text-ink">{slip.password}</dd>
              </dl>
              <p className="mt-3 text-xs text-muted">You will choose your own password the first time you sign in. Keep it to yourself.</p>
            </div>
          ))}
        </section>
      )}
      {/* On paper, only the slips: the app's menu and this page's controls are left out. */}
      <style>{`@media print { body * { visibility: hidden; } #login-slips, #login-slips * { visibility: visible; } #login-slips { position: absolute; inset: 0 auto auto 0; width: 100%; } }`}</style>
    </>
  );
}
