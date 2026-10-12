"use client";

import { useState, type FormEvent } from "react";

import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";

const StaffDocument = graphql(`
  query Staff {
    staff { id title isActive user { id fullName phone email } roles { code name } }
    roles { code name isSystem }
    levels { id arms { id label } levelSubjects { subject { id name } } }
    subjectAssignments { id arm { label } subject { name } teacher { user { fullName } } }
  }
`);

const AddStaffDocument = graphql(`
  mutation AddStaff($firstName: String!, $lastName: String!, $phone: String, $email: String, $roleCodes: [String!]!) {
    addStaff(firstName: $firstName, lastName: $lastName, phone: $phone, email: $email, roleCodes: $roleCodes) { id }
  }
`);

const SetRolesDocument = graphql(`
  mutation SetStaffRoles($id: ID!, $roleCodes: [String!]!, $isActive: Boolean!) {
    setStaffRoles(membershipId: $id, roleCodes: $roleCodes, isActive: $isActive) { id }
  }
`);

const AssignDocument = graphql(`
  mutation AssignSubjectTeacher($armId: ID!, $subjectId: ID!, $teacherId: ID!) {
    assignSubjectTeacher(armId: $armId, subjectId: $subjectId, teacherId: $teacherId) { id }
  }
`);

const STAFF_ROLES = ["owner", "admin", "class_teacher", "subject_teacher", "bursar"];

export default function StaffPage() {
  const { data, error, isLoading, mutate } = useGql(StaffDocument, {});
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", roles: ["subject_teacher"] });
  const [assign, setAssign] = useState({ armId: "", subjectId: "", teacherId: "" });
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (!data) return <ErrorNote error={error} />;
  const roles = data.roles.filter((r) => STAFF_ROLES.includes(r.code) || !r.isSystem);
  const level = data.levels.find((l) => l.arms.some((a) => a.id === assign.armId));

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

  async function add(e: FormEvent) {
    e.preventDefault();
    await run(() => gql(AddStaffDocument, { firstName: form.firstName, lastName: form.lastName, phone: form.phone || null, email: form.email || null, roleCodes: form.roles }),
      `${form.firstName} added. They can set their password with "Forgot password" on the login page.`);
    setForm({ firstName: "", lastName: "", phone: "", email: "", roles: ["subject_teacher"] });
  }

  return (
    <>
      <PageHeader title="Staff and roles" />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card title="Staff">
        <ul className="divide-y divide-line text-sm">
          {data.staff.map((m) => {
            const codes = m.roles.map((r) => r.code);
            return (
              <li key={m.id} className="py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-medium">{m.user.fullName}</span> {!m.isActive && <Badge tone="bad">inactive</Badge>}
                    <span className="block text-xs text-muted">{m.user.phone ?? m.user.email}</span>
                  </span>
                  <span className="flex flex-wrap gap-1">
                    {roles.map((r) => (
                      <button key={r.code} onClick={() => run(() => gql(SetRolesDocument, {
                        id: m.id, isActive: m.isActive,
                        roleCodes: codes.includes(r.code) ? codes.filter((c) => c !== r.code) : [...codes, r.code],
                      }), "Roles updated.")}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${codes.includes(r.code) ? "bg-brand text-white" : "bg-subtle text-muted"}`}>
                        {r.name}
                      </button>
                    ))}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
      <Card title="Add a staff member">
        <form onSubmit={add} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required /></Field>
            <Field label="Surname"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required /></Field>
            <Field label="Phone"><Input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {roles.map((r) => (
              <label key={r.code} className="flex items-center gap-2">
                <input type="checkbox" checked={form.roles.includes(r.code)} onChange={(e) => setForm({ ...form, roles: e.target.checked ? [...form.roles, r.code] : form.roles.filter((c) => c !== r.code) })} />
                {r.name}
              </label>
            ))}
          </div>
          <Button type="submit" disabled={!form.roles.length || (!form.phone && !form.email)}>Add staff member</Button>
        </form>
      </Card>
      <Card title="Subject teachers">
        <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <Field label="Class">
            <Select value={assign.armId} onChange={(e) => setAssign({ ...assign, armId: e.target.value, subjectId: "" })}>
              <option value="">Choose…</option>
              {data.levels.flatMap((l) => l.arms).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </Field>
          <Field label="Subject">
            <Select value={assign.subjectId} onChange={(e) => setAssign({ ...assign, subjectId: e.target.value })} disabled={!level}>
              <option value="">Choose…</option>
              {level?.levelSubjects.map((ls) => <option key={ls.subject.id} value={ls.subject.id}>{ls.subject.name}</option>)}
            </Select>
          </Field>
          <Field label="Teacher">
            <Select value={assign.teacherId} onChange={(e) => setAssign({ ...assign, teacherId: e.target.value })}>
              <option value="">Choose…</option>
              {data.staff.filter((m) => m.isActive).map((m) => <option key={m.id} value={m.id}>{m.user.fullName}</option>)}
            </Select>
          </Field>
          <Button disabled={!assign.armId || !assign.subjectId || !assign.teacherId} onClick={() => run(() => gql(AssignDocument, assign), "Teacher assigned.")}>Assign</Button>
        </div>
        <ul className="mt-4 grid gap-1 text-sm sm:grid-cols-2">
          {data.subjectAssignments.map((a) => (
            <li key={a.id} className="rounded bg-subtle px-2 py-1">{a.arm.label} · {a.subject.name} · <span className="text-muted">{a.teacher.user.fullName}</span></li>
          ))}
        </ul>
      </Card>
    </>
  );
}
