"use client";

import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { IconLock, IconWallet } from "@/components/icons";
import { ImageUpload } from "@/components/ImageUpload";
import { ConsentCard } from "@/components/students/ConsentCard";
import { AddGuardianDialog, EditStudentDialog, ElectivesDialog } from "@/components/students/StudentDialogs";
import { ActionDialog, Badge, Button, ButtonLink, Card, ErrorNote, Loading, Notice, PageHeader, StatusBadge } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { localPhone, naira } from "@/lib/money";
import { ArmsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const StudentDocument = graphql(`
  query StudentProfile($id: ID!, $withFees: Boolean!, $withSubjects: Boolean!) {
    student(id: $id) {
      id fullName firstName middleName lastName admissionNumber gender dateOfBirth admittedOn status examNumbers photoUrl
      medicalNotes emergencyContactName emergencyContactPhone
      currentArm { id label levelId }
      guardianLinks { relationship isPrimary guardian { id title firstName lastName phone email } }
    }
    ledger(studentId: $id) @include(if: $withFees) { balanceKobo chargedKobo paidKobo }
    studentSubjects(studentId: $id) @include(if: $withSubjects) { id name }
  }
`);

const LevelElectivesDocument = graphql(`
  query LevelElectives {
    levels { id hasSubjectSelection levelSubjects { category subject { id name } } }
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
  const [dialog, setDialog] = useState<null | "withdrawn" | "transferred" | "active" | "edit" | "guardian" | "electives">(null);
  const manage = can("students.manage");
  const levels = useGql(LevelElectivesDocument, can("students.view") ? {} : null);
  const arms = useGql(ArmsDocument, manage ? {} : null);

  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const s = data?.student;
  if (!s) return null;

  const exams = Object.entries((s.examNumbers ?? {}) as Record<string, string>);
  const age = ageInYears(s.dateOfBirth);
  const level = levels.data?.levels.find((l) => l.id === s.currentArm?.levelId);
  const electives = level?.hasSubjectSelection ? level.levelSubjects.filter((ls) => ls.category !== "core") : [];
  const electiveIds = new Set(electives.map((e) => e.subject.id));
  const chosenElectives = (data?.studentSubjects ?? []).filter((sub) => electiveIds.has(sub.id));

  return (
    <>
      <PageHeader
        back={{ href: "/students", label: "Students" }}
        title={s.fullName}
        subtitle={<><span className="tabular-nums">{s.admissionNumber}</span><span aria-hidden>·</span><span>{s.currentArm?.label ?? "No class"}</span><StatusBadge status={s.status} /></>}
        actions={
          <>
            {can("fees.view") && <ButtonLink href={`/fees/student/${s.id}`} variant="secondary" icon={<IconWallet size={16} />}>Fees account</ButtonLink>}
            {manage && <Button variant="secondary" onClick={() => setDialog("edit")}>Edit details</Button>}
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
          <Card title="Personal details" actions={manage && <Button size="sm" variant="ghost" onClick={() => setDialog("edit")}>Edit</Button>}>
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
          {(manage || s.photoUrl) && (
            <Card title="Passport photograph" description={manage ? "Printed on the report card. Re-sized and cleaned of location data on upload." : undefined}>
              {manage ? (
                <ImageUpload label="Photo" url={s.photoUrl} endpoint={`/files/students/${s.id}/photo/`} onChange={() => void mutate()} shape="portrait" emptyText="No photo" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photoUrl!} alt={s.fullName} className="h-32 w-26 rounded-xl border border-line object-cover" />
              )}
            </Card>
          )}
          {data?.ledger && (
            <Card title="Fees">
              <div className="font-display text-[30px] font-medium leading-none tabular-nums text-ink">{naira(data.ledger.balanceKobo)}</div>
              <div className="mt-2 text-sm text-muted">Balance · {naira(data.ledger.paidKobo)} paid of {naira(data.ledger.chargedKobo)} billed</div>
            </Card>
          )}
          <Card title="Parents and guardians" flush actions={manage && <Button size="sm" variant="ghost" onClick={() => setDialog("guardian")}>Add</Button>}>
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
          {can("students.view") && <ConsentCard studentId={s.id} canManage={manage} />}
          {level?.hasSubjectSelection && (
            <Card title="Electives" description={`${chosenElectives.length} chosen for this session`}
              actions={manage && electives.length > 0 && <Button size="sm" variant="ghost" onClick={() => setDialog("electives")}>{chosenElectives.length ? "Change" : "Choose"}</Button>}>
              {chosenElectives.length ? (
                <div className="flex flex-wrap gap-1.5">{chosenElectives.map((sub) => <Badge key={sub.id} tone="brand">{sub.name}</Badge>)}</div>
              ) : (
                <p className="text-sm text-muted">No electives chosen yet. Until they are, only compulsory subjects appear on this student&apos;s score sheets and report card.</p>
              )}
            </Card>
          )}
          {data?.studentSubjects && data.studentSubjects.length > 0 && (
            <Card title="Subjects this term" description={`${data.studentSubjects.length} subjects`}>
              <div className="flex flex-wrap gap-1.5">{data.studentSubjects.map((sub) => <Badge key={sub.id}>{sub.name}</Badge>)}</div>
            </Card>
          )}
        </div>
      </div>

      {dialog === "edit" && (
        <EditStudentDialog
          open
          onClose={() => setDialog(null)}
          studentId={s.id}
          arms={arms.data?.arms ?? (s.currentArm ? [s.currentArm] : [])}
          initial={{
            firstName: s.firstName, middleName: s.middleName, lastName: s.lastName, gender: s.gender, dateOfBirth: s.dateOfBirth ?? "",
            armId: s.currentArm?.id ?? "", admissionNumber: s.admissionNumber, examNumbers: (s.examNumbers ?? {}) as Record<string, string>,
          }}
          onSaved={() => void mutate()}
        />
      )}
      <AddGuardianDialog open={dialog === "guardian"} onClose={() => setDialog(null)} studentId={s.id} studentName={s.firstName} onSaved={() => void mutate()} />
      {dialog === "electives" && (
        <ElectivesDialog open onClose={() => setDialog(null)} studentId={s.id} studentName={s.firstName} electives={electives}
          chosen={chosenElectives.map((c) => c.id)} onSaved={() => void mutate()} />
      )}

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
