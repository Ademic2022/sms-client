"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { IconClose, IconPlus } from "@/components/icons";
import { Button, ButtonLink, Card, ErrorNote, Field, FormActions, FormSection, IconButton, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { ArmsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const CreateStudentDocument = graphql(`
  mutation CreateStudent($data: StudentInput!, $guardians: [GuardianInput!]!) {
    createStudent(data: $data, guardians: $guardians) { id }
  }
`);

const emptyGuardian = { title: "", firstName: "", lastName: "", phone: "", email: "", relationship: "Mother" };
const RELATIONSHIPS = ["Mother", "Father", "Guardian", "Grandparent", "Sibling", "Other relative"];

export default function NewStudentPage() {
  const router = useRouter();
  const { can } = useSession();
  const arms = useGql(ArmsDocument, {});
  const [student, setStudent] = useState({ firstName: "", middleName: "", lastName: "", gender: "", dateOfBirth: "", armId: "", admissionNumber: "", medicalNotes: "", emergencyName: "", emergencyPhone: "" });
  const [guardians, setGuardians] = useState([{ ...emptyGuardian }]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const setS = (k: keyof typeof student) => (e: { target: { value: string } }) => setStudent((s) => ({ ...s, [k]: e.target.value }));
  const setG = (i: number, k: keyof typeof emptyGuardian) => (e: { target: { value: string } }) =>
    setGuardians((gs) => gs.map((g, j) => (j === i ? { ...g, [k]: e.target.value } : g)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { createStudent } = await gql(CreateStudentDocument, {
        data: {
          firstName: student.firstName, middleName: student.middleName, lastName: student.lastName, gender: student.gender,
          armId: student.armId, dateOfBirth: student.dateOfBirth || null, admissionNumber: student.admissionNumber || null,
          medicalNotes: student.medicalNotes || null, emergencyContactName: student.emergencyName || null, emergencyContactPhone: student.emergencyPhone || null,
        },
        guardians,
      });
      router.replace(`/students/${createStudent.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      <PageHeader back={{ href: "/students", label: "Students" }} title="Add a student" subtitle="Adding a whole class? Importing from Excel is faster." actions={<ButtonLink href="/students/import" variant="secondary">Import from Excel</ButtonLink>} />
      <form onSubmit={submit}>
        <Card>
          {error && <div className="mb-6"><ErrorNote error={error} /></div>}
          <FormSection title="Student" description="Name as it should appear on report cards.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Surname"><Input value={student.lastName} onChange={setS("lastName")} required autoComplete="off" /></Field>
              <Field label="First name"><Input value={student.firstName} onChange={setS("firstName")} required autoComplete="off" /></Field>
              <Field label="Middle name" optional><Input value={student.middleName} onChange={setS("middleName")} autoComplete="off" /></Field>
              <Field label="Gender">
                <Select value={student.gender} onChange={setS("gender")} required>
                  <option value="">Select</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                </Select>
              </Field>
              <Field label="Date of birth" optional><Input type="date" value={student.dateOfBirth} onChange={setS("dateOfBirth")} /></Field>
            </div>
          </FormSection>
          <FormSection title="Admission" description="Leave the admission number blank to generate the next one in your school's format.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Class">
                <Select value={student.armId} onChange={setS("armId")} required>
                  <option value="">Select a class</option>
                  {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </Select>
              </Field>
              <Field label="Admission number" optional><Input value={student.admissionNumber} onChange={setS("admissionNumber")} placeholder="Generated automatically" /></Field>
            </div>
          </FormSection>
          <FormSection title="Parents and guardians" description="The first contact receives SMS messages and can sign in to the parent portal with this phone number.">
            <div className="space-y-4">
              {guardians.map((g, i) => (
                <div key={i} className="rounded-lg border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-ink">{i === 0 ? "Primary contact" : `Contact ${i + 1}`}</div>
                    {i > 0 && <IconButton label="Remove contact" onClick={() => setGuardians(guardians.filter((_, j) => j !== i))}><IconClose size={15} /></IconButton>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[110px_1fr_1fr]">
                    <Field label="Title" optional><Input value={g.title} onChange={setG(i, "title")} placeholder="Mrs" /></Field>
                    <Field label="First name"><Input value={g.firstName} onChange={setG(i, "firstName")} required /></Field>
                    <Field label="Surname"><Input value={g.lastName} onChange={setG(i, "lastName")} required /></Field>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field label="Phone number"><Input value={g.phone} onChange={setG(i, "phone")} inputMode="tel" required placeholder="0803 123 4567" /></Field>
                    <Field label="Email" optional><Input type="email" value={g.email} onChange={setG(i, "email")} /></Field>
                    <Field label="Relationship">
                      <Select value={g.relationship} onChange={setG(i, "relationship")}>
                        {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                      </Select>
                    </Field>
                  </div>
                </div>
              ))}
              {guardians.length < 3 && (
                <Button type="button" variant="secondary" size="sm" icon={<IconPlus size={15} />} onClick={() => setGuardians([...guardians, { ...emptyGuardian, relationship: "Father" }])}>
                  Add another contact
                </Button>
              )}
            </div>
          </FormSection>
          {can("students.view_sensitive") && (
            <FormSection title="Medical and emergency" description="Optional. Visible only to staff allowed to see sensitive records.">
              <div className="space-y-4">
                <Field label="Medical notes" optional><Textarea rows={3} value={student.medicalNotes} onChange={setS("medicalNotes")} placeholder="Allergies, conditions, medication" /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Emergency contact name" optional><Input value={student.emergencyName} onChange={setS("emergencyName")} /></Field>
                  <Field label="Emergency contact phone" optional><Input inputMode="tel" value={student.emergencyPhone} onChange={setS("emergencyPhone")} /></Field>
                </div>
              </div>
            </FormSection>
          )}
        </Card>
        <FormActions>
          <ButtonLink href="/students" variant="secondary">Cancel</ButtonLink>
          <Button type="submit" busy={busy}>Save student</Button>
        </FormActions>
      </form>
    </>
  );
}
