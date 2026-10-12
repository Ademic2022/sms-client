"use client";

import { useState } from "react";

import { IconPlus, IconUpload } from "@/components/icons";
import { ImportDialog } from "@/components/ImportDialog";
import { SettingsNav } from "@/components/SettingsNav";
import { Badge, Button, Card, Checkbox, Dialog, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { localPhone } from "@/lib/money";

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

const ROLE_HELP: Record<string, string> = {
  owner: "Everything, including the revenue dashboard",
  admin: "Set up the school, students, results and fees",
  class_teacher: "Register, broadsheet and comments for their class",
  subject_teacher: "Scores for the subjects they are assigned",
  bursar: "Bills, payments, debtors and reminders",
};

type Member = { id: string; isActive: boolean; user: { fullName: string; phone?: string | null; email?: string | null }; roles: { code: string; name: string }[] };

export default function StaffPage() {
  const { data, error, isLoading, mutate } = useGql(StaffDocument, {});
  const [dialog, setDialog] = useState<null | "add" | "assign">(null);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", roles: ["subject_teacher"] });
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [assign, setAssign] = useState({ armId: "", subjectId: "", teacherId: "" });
  const [busy, setBusy] = useState(false);
  const [dialogErr, setDialogErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  if (isLoading) return <Loading />;
  if (!data) return <ErrorNote error={error} />;
  const roles = data.roles.filter((r) => STAFF_ROLES.includes(r.code) || !r.isSystem);
  const level = data.levels.find((l) => l.arms.some((a) => a.id === assign.armId));

  async function runDialog(fn: () => Promise<string>, close: () => void) {
    setBusy(true);
    setDialogErr(null);
    try {
      setMsg(await fn());
      close();
      await mutate();
    } catch (e) {
      setDialogErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const roleChecklist = (selected: string[], onChange: (codes: string[]) => void) => (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-[13px] font-medium text-ink">Roles</legend>
      {roles.map((r) => (
        <Checkbox key={r.code} label={r.name} description={ROLE_HELP[r.code]} checked={selected.includes(r.code)}
          onChange={(v) => onChange(v ? [...selected, r.code] : selected.filter((c) => c !== r.code))} />
      ))}
    </fieldset>
  );

  return (
    <>
      <PageHeader title="Settings" subtitle="Who works at the school and what each person can do." />
      <SettingsNav />
      {msg && <Notice tone="success">{msg}</Notice>}

      <Card flush title="Staff" description={`${data.staff.length} people`}
        actions={<>
          <Button size="sm" variant="secondary" icon={<IconUpload size={15} />} onClick={() => setImporting(true)}>Import from Excel</Button>
          <Button size="sm" icon={<IconPlus size={15} />} onClick={() => { setDialogErr(null); setForm({ firstName: "", lastName: "", phone: "", email: "", roles: ["subject_teacher"] }); setDialog("add"); }}>Add staff member</Button>
        </>}>
        <Table>
          <thead><tr><TH>Name</TH><TH>Contact</TH><TH>Roles</TH><TH>Status</TH><TH /></tr></thead>
          <tbody>
            {data.staff.map((m) => (
              <tr key={m.id}>
                <TD className="font-medium">{m.user.fullName}</TD>
                <TD className="text-muted">{m.user.phone ? localPhone(m.user.phone) : m.user.email}</TD>
                <TD><div className="flex flex-wrap gap-1">{m.roles.filter((r) => r.code !== "parent").map((r) => <Badge key={r.code}>{r.name}</Badge>)}</div></TD>
                <TD>{m.isActive ? <Badge tone="good" dot>Active</Badge> : <Badge tone="bad" dot>Deactivated</Badge>}</TD>
                <TD align="right">
                  <Button size="sm" variant="secondary" onClick={() => { setDialogErr(null); setEditing(m); setEditRoles(m.roles.map((r) => r.code)); setEditActive(m.isActive); }}>Edit</Button>
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card flush title="Subject teachers" description="Who teaches each subject in each class this session. Teachers only see score sheets assigned to them."
        actions={<Button size="sm" variant="secondary" onClick={() => { setDialogErr(null); setDialog("assign"); }}>Assign a teacher</Button>}>
        {data.subjectAssignments.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No subject teachers assigned yet.</p>
        ) : (
          <Table>
            <thead><tr><TH>Class</TH><TH>Subject</TH><TH>Teacher</TH></tr></thead>
            <tbody>
              {data.subjectAssignments.map((a) => (
                <tr key={a.id}><TD className="font-medium">{a.arm.label}</TD><TD>{a.subject.name}</TD><TD className="text-muted">{a.teacher.user.fullName}</TD></tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Dialog open={dialog === "add"} onClose={() => setDialog(null)} title="Add a staff member"
        description="They sign in with this phone number or email. They set their own password using “Forgot password” on the sign-in page."
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
          <Button busy={busy} disabled={!form.roles.length || (!form.phone && !form.email) || !form.firstName || !form.lastName}
            onClick={() => runDialog(async () => {
              await gql(AddStaffDocument, { firstName: form.firstName, lastName: form.lastName, phone: form.phone || null, email: form.email || null, roleCodes: form.roles });
              return `${form.firstName} ${form.lastName} added.`;
            }, () => setDialog(null))}>Add staff member</Button></>}>
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
            <Field label="Surname"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
            <Field label="Phone"><Input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0803 123 4567" /></Field>
            <Field label="Email" optional><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          </div>
          {roleChecklist(form.roles, (codes) => setForm({ ...form, roles: codes }))}
        </div>
      </Dialog>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing ? editing.user.fullName : ""} description="Changes are recorded in the audit log."
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          <Button busy={busy} onClick={() => runDialog(async () => {
            await gql(SetRolesDocument, { id: editing!.id, roleCodes: editRoles, isActive: editActive });
            return `${editing!.user.fullName} updated.`;
          }, () => setEditing(null))}>Save changes</Button></>}>
        <div className="space-y-5">
          <ErrorNote error={dialogErr} />
          {roleChecklist(editRoles, setEditRoles)}
          <div className="border-t border-line pt-4">
            <Checkbox label="Account active" description="Deactivated staff cannot sign in. Their history is kept." checked={editActive} onChange={setEditActive} />
          </div>
        </div>
      </Dialog>

      <Dialog open={dialog === "assign"} onClose={() => setDialog(null)} title="Assign a subject teacher" description="Replaces any teacher already assigned to that subject in that class."
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
          <Button busy={busy} disabled={!assign.armId || !assign.subjectId || !assign.teacherId}
            onClick={() => runDialog(async () => { await gql(AssignDocument, assign); return "Teacher assigned."; }, () => setDialog(null))}>Assign</Button></>}>
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <Field label="Class">
            <Select value={assign.armId} onChange={(e) => setAssign({ ...assign, armId: e.target.value, subjectId: "" })}>
              <option value="">Select a class</option>
              {data.levels.flatMap((l) => l.arms).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </Field>
          <Field label="Subject">
            <Select value={assign.subjectId} onChange={(e) => setAssign({ ...assign, subjectId: e.target.value })} disabled={!level}>
              <option value="">Select a subject</option>
              {level?.levelSubjects.map((ls) => <option key={ls.subject.id} value={ls.subject.id}>{ls.subject.name}</option>)}
            </Select>
          </Field>
          <Field label="Teacher">
            <Select value={assign.teacherId} onChange={(e) => setAssign({ ...assign, teacherId: e.target.value })}>
              <option value="">Select a teacher</option>
              {data.staff.filter((m) => m.isActive).map((m) => <option key={m.id} value={m.id}>{m.user.fullName}</option>)}
            </Select>
          </Field>
        </div>
      </Dialog>
      <ImportDialog
        open={importing}
        onClose={() => setImporting(false)}
        title="Import staff from Excel"
        description="One row per person, with their roles. Anyone already on the staff keeps their account and gains the new roles. New staff sign in with their phone number and set a password using “Forgot password”."
        templateHref="/files/staff/template.xlsx"
        uploadPath="/files/staff/import/"
        submitLabel="Import staff"
        summary={(r) => `${r.created} added, ${r.updated} already on the staff updated.`}
        onDone={() => void mutate()}
      />
    </>
  );
}
