"use client";

import { useState } from "react";

import { CATEGORIES } from "@/components/setup/AcademicDialogs";
import { Button, Checkbox, Dialog, ErrorNote, Field, Input, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";

/* ------------------------------------------------------------ Edit details */

const UpdateStudentDocument = graphql(`
  mutation UpdateStudent($id: ID!, $data: StudentInput!) { updateStudent(id: $id, data: $data) { id } }
`);

export const EXAMS = ["Common Entrance", "BECE", "WASSCE", "NECO"] as const;

export interface StudentForm {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  armId: string;
  admissionNumber: string;
  examNumbers: Record<string, string>;
}

export function EditStudentDialog({
  open,
  onClose,
  studentId,
  initial,
  arms,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  studentId: string;
  initial: StudentForm;
  arms: { id: string; label: string }[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof StudentForm) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const classChanged = form.armId !== initial.armId;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await gql(UpdateStudentDocument, {
        id: studentId,
        data: {
          firstName: form.firstName, middleName: form.middleName, lastName: form.lastName, gender: form.gender, armId: form.armId,
          dateOfBirth: form.dateOfBirth || null, admissionNumber: form.admissionNumber || null, examNumbers: form.examNumbers,
        },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit student details"
      description="Changes appear on report cards from the next time they are generated. Every change is recorded in the audit log."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy} onClick={save}>Save changes</Button></>}
    >
      <div className="space-y-4">
        <ErrorNote error={error} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Surname"><Input value={form.lastName} onChange={set("lastName")} /></Field>
          <Field label="First name"><Input value={form.firstName} onChange={set("firstName")} /></Field>
          <Field label="Middle name" optional><Input value={form.middleName} onChange={set("middleName")} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={set("gender")}>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </Select>
          </Field>
          <Field label="Date of birth" optional><Input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} /></Field>
          <Field label="Admission number"><Input value={form.admissionNumber} onChange={set("admissionNumber")} /></Field>
          <div className="col-span-2">
            <Field label="Class" hint={classChanged ? "Moving class keeps this term's scores, but they only count in the new class's subjects." : undefined}>
              <Select value={form.armId} onChange={set("armId")}>
                {arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </Select>
            </Field>
          </div>
        </div>
        <fieldset className="rounded-lg border border-line p-3">
          <legend className="px-1 text-[13px] font-medium text-ink">External exam numbers</legend>
          <div className="grid grid-cols-2 gap-3">
            {EXAMS.map((exam) => (
              <Field key={exam} label={exam} optional>
                <Input value={form.examNumbers[exam] ?? ""} onChange={(e) => setForm({ ...form, examNumbers: { ...form.examNumbers, [exam]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </fieldset>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------ Add guardian */

const AddGuardianDocument = graphql(`
  mutation AddGuardian($studentId: ID!, $guardian: GuardianInput!) { addGuardian(studentId: $studentId, guardian: $guardian) { id } }
`);

const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Grandparent", "Sibling", "Other relative"];

export function AddGuardianDialog({ open, onClose, studentId, studentName, onSaved }: { open: boolean; onClose: () => void; studentId: string; studentName: string; onSaved: () => void }) {
  const empty = { title: "", firstName: "", lastName: "", phone: "", email: "", relationship: "Father" };
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await gql(AddGuardianDocument, { studentId, guardian: form });
      setForm(empty);
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Add a parent or guardian for ${studentName}`}
      description="They can sign in to the parent portal with this phone number and will receive the school's SMS messages."
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy} disabled={!form.firstName || !form.lastName || !form.phone} onClick={save}>Add guardian</Button></>}
    >
      <div className="space-y-4">
        <ErrorNote error={error} />
        <div className="grid grid-cols-[96px_1fr_1fr] gap-3">
          <Field label="Title" optional><Input value={form.title} onChange={set("title")} placeholder="Mr" /></Field>
          <Field label="First name"><Input value={form.firstName} onChange={set("firstName")} /></Field>
          <Field label="Surname"><Input value={form.lastName} onChange={set("lastName")} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone number"><Input value={form.phone} onChange={set("phone")} inputMode="tel" placeholder="0803 123 4567" /></Field>
          <Field label="Email" optional><Input type="email" value={form.email} onChange={set("email")} /></Field>
        </div>
        <Field label="Relationship">
          <Select value={form.relationship} onChange={set("relationship")}>
            {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
          </Select>
        </Field>
      </div>
    </Dialog>
  );
}

/* --------------------------------------------------------- SSS electives */

const SetStudentSubjectsDocument = graphql(`
  mutation SetStudentSubjects($studentId: ID!, $subjectIds: [ID!]!) { setStudentSubjects(studentId: $studentId, subjectIds: $subjectIds) { id } }
`);

export function ElectivesDialog({
  open,
  onClose,
  studentId,
  studentName,
  electives,
  chosen,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  electives: { category: string; subject: { id: string; name: string } }[];
  chosen: string[];
  onSaved: () => void;
}) {
  const [picked, setPicked] = useState<string[]>(chosen);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groups = CATEGORIES.filter(([k]) => k !== "core")
    .map(([k, label]) => [label, electives.filter((e) => e.category === k)] as const)
    .filter(([, items]) => items.length);
  const trades = electives.filter((e) => e.category === "trade").map((e) => e.subject.id);
  const tradeCount = picked.filter((id) => trades.includes(id)).length;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await gql(SetStudentSubjectsDocument, { studentId, subjectIds: picked });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Electives for ${studentName}`}
      description="Compulsory subjects are always included. Choose the electives and trade subject this student takes this session."
      footer={
        <>
          <span className="mr-auto self-center text-sm text-muted">{picked.length} chosen</span>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button busy={busy} onClick={save}>Save electives</Button>
        </>
      }
    >
      <div className="space-y-4">
        <ErrorNote error={error} />
        {trades.length > 0 && tradeCount !== 1 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            The national curriculum expects senior students to take one trade subject. {tradeCount === 0 ? "None is chosen yet." : `${tradeCount} are chosen.`}
          </p>
        )}
        <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
          {groups.map(([label, items]) => (
            <div key={label}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((e) => (
                  <Checkbox
                    key={e.subject.id}
                    label={e.subject.name}
                    checked={picked.includes(e.subject.id)}
                    onChange={(v) => setPicked(v ? [...picked, e.subject.id] : picked.filter((id) => id !== e.subject.id))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
