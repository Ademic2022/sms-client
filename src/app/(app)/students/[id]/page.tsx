"use client";

import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { IconLock, IconWallet } from "@/components/icons";
import { ActionDialog, Badge, Button, ButtonLink, Card, ErrorNote, Loading, Notice, PageHeader, StatusBadge } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { localPhone, naira } from "@/lib/money";
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

function formatDate(iso: string | null | undefined) {
  return iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "Not recorded";
}

function ageInYears(iso: string | null | undefined) {
  if (!iso) return null;
  const born = new Date(iso);
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) years -= 1;
  return years;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-line py-3 text-sm last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export default function StudentPage() {
  const { id } = useParams<{ id: string }>();
  const { can } = useSession();
  const { data, error, isLoading, mutate } = useGql(StudentDocument, { id, withFees: can("fees.view"), withSubjects: can("students.view") });
  const [dialog, setDialog] = useState<null | "withdrawn" | "transferred" | "active">(null);

  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const s = data?.student;
  if (!s) return null;

  const exams = Object.entries((s.examNumbers ?? {}) as Record<string, string>);
  const age = ageInYears(s.dateOfBirth);

  return (
    <>
      <PageHeader
        back={{ href: "/students", label: "Students" }}
        title={s.fullName}
        subtitle={<><span className="tabular-nums">{s.admissionNumber}</span><span aria-hidden>·</span><span>{s.currentArm?.label ?? "No class"}</span><StatusBadge status={s.status} /></>}
        actions={
          <>
            {can("fees.view") && <ButtonLink href={`/fees/student/${s.id}`} variant="secondary" icon={<IconWallet size={16} />}>Fees account</ButtonLink>}
            {can("students.manage") && s.status === "active" && (
              <>
                <Button variant="secondary" onClick={() => setDialog("transferred")}>Transfer out</Button>
                <Button variant="secondary" onClick={() => setDialog("withdrawn")}>Withdraw</Button>
              </>
            )}
            {can("students.manage") && s.status !== "active" && <Button variant="secondary" onClick={() => setDialog("active")}>Reactivate</Button>}
          </>
        }
      />

      {s.status !== "active" && <Notice>This student is {s.status}. Their records, results and payment history are kept.</Notice>}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card title="Personal details">
            <dl className="-my-3">
              <Row label="Full name">{s.fullName}</Row>
              <Row label="Gender">{s.gender === "F" ? "Female" : "Male"}</Row>
              <Row label="Date of birth">{formatDate(s.dateOfBirth)}{age !== null && <span className="text-muted"> · {age} years</span>}</Row>
              <Row label="Admitted">{formatDate(s.admittedOn)}</Row>
              <Row label="Class">{s.currentArm?.label ?? "None"}</Row>
              {exams.map(([k, v]) => <Row key={k} label={`${k} number`}>{v}</Row>)}
            </dl>
          </Card>
          {s.medicalNotes !== null && (
            <Card title={<span className="inline-flex items-center gap-2"><IconLock size={15} className="text-muted" /> Medical and emergency</span>} description="Visible only to staff with access to sensitive records. Every view is logged.">
              <dl className="-my-3">
                <Row label="Medical notes">{s.medicalNotes || <span className="text-muted">None recorded</span>}</Row>
                <Row label="Emergency contact">{s.emergencyContactName ? <>{s.emergencyContactName} · {localPhone(s.emergencyContactPhone)}</> : <span className="text-muted">None recorded</span>}</Row>
              </dl>
            </Card>
          )}
        </div>
        <div className="space-y-5">
          {data?.ledger && (
            <Card title="Fees">
              <div className="font-display text-[30px] font-medium leading-none tabular-nums text-ink">{naira(data.ledger.balanceKobo)}</div>
              <div className="mt-2 text-sm text-muted">Balance · {naira(data.ledger.paidKobo)} paid of {naira(data.ledger.chargedKobo)} billed</div>
            </Card>
          )}
          <Card title="Parents and guardians" flush>
            {s.guardianLinks.map(({ guardian: g, relationship, isPrimary }) => (
              <div key={g.id} className="border-b border-line px-5 py-4 last:border-b-0">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  {[g.title, g.firstName, g.lastName].filter(Boolean).join(" ")}
                  {isPrimary && <Badge tone="brand">Primary contact</Badge>}
                </div>
                <div className="mt-1 text-[13px] text-muted">{relationship}</div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a className="font-medium text-brand-ink hover:underline" href={`tel:${g.phone}`}>{localPhone(g.phone)}</a>
                  {g.email && <a className="text-brand-ink hover:underline" href={`mailto:${g.email}`}>{g.email}</a>}
                </div>
              </div>
            ))}
          </Card>
          {data?.studentSubjects && data.studentSubjects.length > 0 && (
            <Card title="Subjects this term" description={`${data.studentSubjects.length} subjects`}>
              <div className="flex flex-wrap gap-1.5">{data.studentSubjects.map((sub) => <Badge key={sub.id}>{sub.name}</Badge>)}</div>
            </Card>
          )}
        </div>
      </div>

      <ActionDialog
        open={dialog === "withdrawn" || dialog === "transferred"}
        onClose={() => setDialog(null)}
        title={dialog === "transferred" ? `Record ${s.firstName} as transferred?` : `Withdraw ${s.firstName}?`}
        description="The student is removed from class lists and billing. Their records, results and payments are kept, and you can reactivate them later."
        confirmLabel={dialog === "transferred" ? "Record transfer" : "Withdraw student"}
        tone="danger"
        input={{
          label: dialog === "transferred" ? "School transferred to, and reason" : "Reason",
          placeholder: dialog === "transferred" ? "e.g. Moved to a school in Abuja" : "e.g. Family relocated abroad",
          hint: "Recorded in the student's history and the audit log.",
        }}
        onConfirm={async (reason) => {
          await gql(ChangeStatusDocument, { id, status: dialog === "transferred" ? "transferred" : "withdrawn", reason });
          await mutate();
        }}
      />
      <ActionDialog
        open={dialog === "active"}
        onClose={() => setDialog(null)}
        title={`Reactivate ${s.firstName}?`}
        description="The student returns to their class and will be included in billing and results again."
        confirmLabel="Reactivate"
        onConfirm={async () => {
          await gql(ChangeStatusDocument, { id, status: "active", reason: "Reactivated" });
          await mutate();
        }}
      />
    </>
  );
}
