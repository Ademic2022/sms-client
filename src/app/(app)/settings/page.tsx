"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { naira, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const SettingsDocument = graphql(`
  query SchoolSettings {
    school { name motto address phone email primaryColor secondaryColor }
    schoolSettings {
      showClassPosition admissionNumberFormat admissionNumberPrefix resultDebtThresholdKobo transactionChargeBearer
      smsSenderId smsSenderStatus notifyParentOnAbsence reportTemplate principalTitle
    }
    supportGrants { id reason expiresAt grantedBy }
  }
`);

const UpdateDocument = graphql(`
  mutation UpdateSchoolSettings($name: String, $motto: String, $address: String, $phone: String, $email: String, $primaryColor: String, $settingsJson: JSON) {
    updateSchoolSettings(name: $name, motto: $motto, address: $address, phone: $phone, email: $email, primaryColor: $primaryColor, settingsJson: $settingsJson) {
      showClassPosition
    }
  }
`);

const GrantDocument = graphql(`mutation GrantSupport($reason: String!, $hours: Int!) { grantSupportAccess(reason: $reason, hours: $hours) { id } }`);
const RevokeDocument = graphql(`mutation RevokeSupport($id: ID!) { revokeSupportAccess(grantId: $id) }`);

export default function SettingsPage() {
  const { can, refresh } = useSession();
  const canSchool = can("school.manage");
  const { data, error, isLoading, mutate } = useGql(SettingsDocument, canSchool ? {} : null);
  const [school, setSchool] = useDerivedState(
    data?.school,
    ({ name, motto, address, phone, email, primaryColor }) => ({ name, motto, address, phone, email, primaryColor }),
    { name: "", motto: "", address: "", phone: "", email: "", primaryColor: "#1d4ed8" },
  );
  const [s, setS] = useDerivedState(
    data?.schoolSettings,
    (ss) => ({
      showClassPosition: ss.showClassPosition, admissionNumberFormat: ss.admissionNumberFormat, admissionNumberPrefix: ss.admissionNumberPrefix,
      debt: ss.resultDebtThresholdKobo === null || ss.resultDebtThresholdKobo === undefined ? "" : String(ss.resultDebtThresholdKobo / 100),
      bearer: ss.transactionChargeBearer, sender: ss.smsSenderId, notifyAbsence: ss.notifyParentOnAbsence, reportTemplate: ss.reportTemplate, principalTitle: ss.principalTitle,
    }),
    { showClassPosition: true, admissionNumberFormat: "", admissionNumberPrefix: "", debt: "", bearer: "school", sender: "", notifyAbsence: false, reportTemplate: "classic", principalTitle: "Principal" },
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [supportReason, setSupportReason] = useState("");

  const links = (
    <div className="grid gap-3 sm:grid-cols-2">
      {can("academics.manage") && <Link href="/settings/academics" className="rounded-xl border border-line bg-surface p-4 hover:bg-subtle"><div className="font-semibold">Academic setup</div><div className="text-sm text-muted">Sessions and terms, classes, subjects, assessment, grading, promotion</div></Link>}
      {can("staff.manage") && <Link href="/settings/staff" className="rounded-xl border border-line bg-surface p-4 hover:bg-subtle"><div className="font-semibold">Staff and roles</div><div className="text-sm text-muted">Add teachers, the bursar and admins; assign classes and subjects</div></Link>}
    </div>
  );

  if (!canSchool) return <><PageHeader title="Settings" />{links}</>;
  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;

  async function save() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    const debtKobo = s.debt.trim() === "" ? null : toKobo(s.debt);
    if (s.debt.trim() !== "" && debtKobo === null) {
      setErr("Enter a valid amount for the result hold.");
      setBusy(false);
      return;
    }
    const current = data?.schoolSettings;
    const settingsJson: Record<string, unknown> = {
      show_class_position: s.showClassPosition, admission_number_format: s.admissionNumberFormat, admission_number_prefix: s.admissionNumberPrefix,
      result_debt_threshold_kobo: debtKobo, transaction_charge_bearer: s.bearer, notify_parent_on_absence: s.notifyAbsence,
      report_template: s.reportTemplate, principal_title: s.principalTitle,
    };
    if (s.sender !== current?.smsSenderId) settingsJson.sms_sender_id = s.sender;
    try {
      await gql(UpdateDocument, { ...school, settingsJson });
      setMsg("Settings saved.");
      await Promise.all([mutate(), refresh()]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof school) => (e: { target: { value: string } }) => setSchool({ ...school, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Settings" />
      {links}
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card title="School profile">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><Input value={school.name} onChange={set("name")} /></Field>
          <Field label="Motto"><Input value={school.motto} onChange={set("motto")} /></Field>
          <Field label="Phone"><Input value={school.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><Input value={school.email} onChange={set("email")} /></Field>
          <Field label="Brand colour"><Input type="color" value={school.primaryColor} onChange={set("primaryColor")} className="h-11 p-1" /></Field>
        </div>
        <div className="mt-3"><Field label="Address"><Textarea rows={2} value={school.address} onChange={set("address")} /></Field></div>
      </Card>
      <Card title="Results and report cards">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={s.showClassPosition} onChange={(e) => setS({ ...s, showClassPosition: e.target.checked })} /> Show class position on reports</label>
          <Field label="Report card template">
            <Select value={s.reportTemplate} onChange={(e) => setS({ ...s, reportTemplate: e.target.value })}>
              <option value="classic">Classic (with highest and lowest)</option>
              <option value="compact">Compact</option>
            </Select>
          </Field>
          <Field label="Head's title on reports"><Input value={s.principalTitle} onChange={(e) => setS({ ...s, principalTitle: e.target.value })} /></Field>
          <Field label="Hold results when a student owes more than (₦)" hint={`Leave blank to never hold results.${s.debt ? ` Currently ${naira(toKobo(s.debt) ?? 0)}.` : ""}`}>
            <Input inputMode="decimal" value={s.debt} onChange={(e) => setS({ ...s, debt: e.target.value })} />
          </Field>
        </div>
      </Card>
      <Card title="Students, payments and SMS">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Admission number format" hint="Use {prefix}, {year}, {yy} and {seq:04d}, e.g. {prefix}/{year}/{seq:04d}">
            <Input value={s.admissionNumberFormat} onChange={(e) => setS({ ...s, admissionNumberFormat: e.target.value })} />
          </Field>
          <Field label="Admission number prefix"><Input value={s.admissionNumberPrefix} onChange={(e) => setS({ ...s, admissionNumberPrefix: e.target.value })} /></Field>
          <Field label="Online payment charge paid by">
            <Select value={s.bearer} onChange={(e) => setS({ ...s, bearer: e.target.value })}>
              <option value="school">The school</option>
              <option value="parent">The parent (added as a convenience fee)</option>
            </Select>
          </Field>
          <Field label="SMS sender name" hint={`Up to 11 letters. Networks must approve it; until then messages use the shared name. Status: ${data?.schoolSettings.smsSenderStatus}`}>
            <Input maxLength={11} value={s.sender} onChange={(e) => setS({ ...s, sender: e.target.value })} />
          </Field>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={s.notifyAbsence} onChange={(e) => setS({ ...s, notifyAbsence: e.target.checked })} /> SMS parents when a child is marked absent</label>
        </div>
      </Card>
      <Button busy={busy} onClick={save}>Save settings</Button>

      <Card title="Support access">
        <p className="mb-2 text-sm text-muted">Let the platform support team into your account for a limited time. Everything they do is recorded in your audit log.</p>
        {data?.supportGrants.map((g) => (
          <div key={g.id} className="mb-2 flex items-center justify-between rounded-lg bg-subtle px-3 py-2 text-sm">
            <span>{g.reason} · until {new Date(g.expiresAt).toLocaleString("en-NG")}</span>
            <Button variant="ghost" onClick={async () => { await gql(RevokeDocument, { id: g.id }); await mutate(); }}>Revoke</Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input placeholder="What do you need help with?" value={supportReason} onChange={(e) => setSupportReason(e.target.value)} />
          <Button variant="secondary" disabled={!supportReason.trim()} onClick={async () => {
            try { await gql(GrantDocument, { reason: supportReason, hours: 24 }); setSupportReason(""); await mutate(); } catch (e) { setErr((e as Error).message); }
          }}>Allow for 24 hours</Button>
        </div>
      </Card>
    </>
  );
}
