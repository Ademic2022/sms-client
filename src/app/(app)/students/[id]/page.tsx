"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, statusTone } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { naira } from "@/lib/money";
import { useSession } from "@/lib/session";

const StudentDocument = graphql(`
  query StudentProfile($id: ID!, $withFees: Boolean!, $withSubjects: Boolean!) {
    student(id: $id) {
      id fullName firstName lastName admissionNumber gender dateOfBirth admittedOn status examNumbers
      medicalNotes emergencyContactName emergencyContactPhone
      currentArm { id label }
      guardianLinks { relationship isPrimary guardian { id title firstName lastName phone email } }
    }
    ledger(studentId: $id) @include(if: $withFees) { balanceKobo chargedKobo paidKobo }
    studentSubjects(studentId: $id) @include(if: $withSubjects) { id name }
  }
`);

const ChangeStatusDocument = graphql(`
  mutation ChangeStudentStatus($id: ID!, $status: String!, $reason: String!) {
    changeStudentStatus(id: $id, status: $status, reason: $reason) { id status }
  }
`);

export default function StudentPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useSession();
  const { data, error, isLoading, mutate } = useGql(StudentDocument, { id, withFees: can("fees.view"), withSubjects: can("students.view") });
  const [status, setStatus] = useState("withdrawn");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const s = data?.student;
  if (!s) return null;

  async function changeStatus(to: string) {
    setBusy(true);
    setActionError(null);
    try {
      await gql(ChangeStatusDocument, { id, status: to, reason: reason || (to === "active" ? "Reactivated" : "") });
      setReason("");
      await mutate();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const exams = Object.entries((s.examNumbers ?? {}) as Record<string, string>);

  return (
    <>
      <PageHeader
        title={s.fullName}
        subtitle={<>{s.admissionNumber} · {s.currentArm?.label ?? "No class"} {s.status !== "active" && <Badge tone={statusTone[s.status]}>{s.status}</Badge>}</>}
        actions={can("fees.view") && <Link className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold" href={`/fees/student/${s.id}`}>Fees account</Link>}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Details">
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted">Gender</dt><dd>{s.gender === "F" ? "Female" : "Male"}</dd>
            <dt className="text-muted">Date of birth</dt><dd>{s.dateOfBirth ?? "–"}</dd>
            <dt className="text-muted">Admitted</dt><dd>{s.admittedOn}</dd>
            {exams.map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-muted">{k} number</dt><dd>{v}</dd></div>
            ))}
          </dl>
          {s.medicalNotes !== null && (
            <div className="mt-3 rounded-lg bg-subtle p-3 text-sm">
              <div className="text-xs font-semibold uppercase text-muted">Restricted</div>
              <div>Medical notes: {s.medicalNotes || "None"}</div>
              <div>Emergency contact: {s.emergencyContactName || "–"} {s.emergencyContactPhone}</div>
            </div>
          )}
        </Card>
        <Card title="Parents and guardians">
          <ul className="space-y-3 text-sm">
            {s.guardianLinks.map(({ guardian: g, relationship, isPrimary }) => (
              <li key={g.id}>
                <div className="font-medium">{[g.title, g.firstName, g.lastName].filter(Boolean).join(" ")} {isPrimary && <Badge>primary</Badge>}</div>
                <div className="text-muted">{relationship} · <a className="text-brand" href={`tel:${g.phone}`}>{g.phone}</a>{g.email && ` · ${g.email}`}</div>
              </li>
            ))}
          </ul>
        </Card>
        {data?.ledger && (
          <Card title="Fees">
            <div className="text-2xl font-bold tabular-nums">{naira(data.ledger.balanceKobo)}</div>
            <div className="text-sm text-muted">balance · {naira(data.ledger.paidKobo)} paid of {naira(data.ledger.chargedKobo)} billed</div>
          </Card>
        )}
        {data?.studentSubjects && data.studentSubjects.length > 0 && (
          <Card title="Subjects this term">
            <div className="flex flex-wrap gap-1.5">{data.studentSubjects.map((sub) => <Badge key={sub.id}>{sub.name}</Badge>)}</div>
          </Card>
        )}
      </div>
      {can("students.manage") && (
        <Card title="Status">
          <ErrorNote error={actionError} />
          {s.status === "active" ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
              <Field label="Change to">
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="transferred">Transferred</option>
                </Select>
              </Field>
              <Field label="Reason"><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family relocated to Abuja" /></Field>
              <Button variant="danger" busy={busy} disabled={!reason.trim()} onClick={() => changeStatus(status)}>Save</Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Notice>This student is {s.status}. Their records and history are kept.</Notice>
              <Button variant="secondary" busy={busy} onClick={() => changeStatus("active")}>Reactivate</Button>
            </div>
          )}
        </Card>
      )}
    </>
  );
}
