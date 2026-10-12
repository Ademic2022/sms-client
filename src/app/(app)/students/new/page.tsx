"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, Card, ErrorNote, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
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

export default function NewStudentPage() {
  const router = useRouter();
  const { can } = useSession();
  const arms = useGql(ArmsDocument, {});
  const [student, setStudent] = useState({ firstName: "", middleName: "", lastName: "", gender: "", dateOfBirth: "", armId: "", admissionNumber: "", medicalNotes: "" });
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
          medicalNotes: student.medicalNotes || null,
        },
        guardians,
      });
      router.replace(`/students/${createStudent.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Add student" />
      <form onSubmit={submit} className="space-y-4">
        <ErrorNote error={error} />
        <Card title="Student">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Surname"><Input value={student.lastName} onChange={setS("lastName")} required /></Field>
            <Field label="First name"><Input value={student.firstName} onChange={setS("firstName")} required /></Field>
            <Field label="Middle name"><Input value={student.middleName} onChange={setS("middleName")} /></Field>
            <Field label="Gender">
              <Select value={student.gender} onChange={setS("gender")} required>
                <option value="">Choose…</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </Select>
            </Field>
            <Field label="Date of birth"><Input type="date" value={student.dateOfBirth} onChange={setS("dateOfBirth")} /></Field>
            <Field label="Class">
              <Select value={student.armId} onChange={setS("armId")} required>
                <option value="">Choose…</option>
                {arms.data?.arms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </Select>
            </Field>
            <Field label="Admission number" hint="Leave blank to generate one."><Input value={student.admissionNumber} onChange={setS("admissionNumber")} /></Field>
          </div>
          {can("students.view_sensitive") && (
            <div className="mt-4">
              <Field label="Medical notes (optional)" hint="Only staff with permission to see sensitive records can view this.">
                <Textarea rows={2} value={student.medicalNotes} onChange={setS("medicalNotes")} />
              </Field>
            </div>
          )}
        </Card>
        {guardians.map((g, i) => (
          <Card key={i} title={i === 0 ? "Parent or guardian" : `Another guardian`}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Title"><Input value={g.title} onChange={setG(i, "title")} placeholder="Mrs" /></Field>
              <Field label="First name"><Input value={g.firstName} onChange={setG(i, "firstName")} required /></Field>
              <Field label="Surname"><Input value={g.lastName} onChange={setG(i, "lastName")} required /></Field>
              <Field label="Phone" hint="Used for SMS and to log in to the parent portal."><Input value={g.phone} onChange={setG(i, "phone")} inputMode="tel" required /></Field>
              <Field label="Email (optional)"><Input type="email" value={g.email} onChange={setG(i, "email")} /></Field>
              <Field label="Relationship">
                <Select value={g.relationship} onChange={setG(i, "relationship")}>
                  {["Mother", "Father", "Guardian", "Grandparent", "Sibling"].map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>
            </div>
          </Card>
        ))}
        <div className="flex flex-wrap gap-2">
          {guardians.length < 3 && <Button type="button" variant="secondary" onClick={() => setGuardians([...guardians, { ...emptyGuardian, relationship: "Father" }])}>Add another guardian</Button>}
          <Button type="submit" busy={busy}>Save student</Button>
        </div>
      </form>
    </>
  );
}
