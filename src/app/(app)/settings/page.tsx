"use client";

import { useState } from "react";

import { ImageUpload } from "@/components/ImageUpload";
import { PayoutAccountCard } from "@/components/PayoutAccountCard";
import { SettingsNav } from "@/components/SettingsNav";
import { Button, Card, Checkbox, ErrorNote, Field, FormActions, FormSection, Input, Loading, Notice, PageHeader, Select, StatusBadge, Textarea } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { localPhone, toKobo } from "@/lib/money";
import { useSession } from "@/lib/session";

const SettingsDocument = graphql(`
  query SchoolSettings {
    school { name motto address phone email primaryColor secondaryColor }
    schoolSettings {
      showClassPosition admissionNumberFormat admissionNumberPrefix resultDebtThresholdKobo transactionChargeBearer
      smsSenderId smsSenderStatus smsLowBalanceUnits notifyParentOnAbsence reportTemplate principalTitle
      feeRemindersEnabled feeReminderEveryDays feeReminderMinBalanceKobo feeReminderTemplate
    }
    supportGrants { id reason expiresAt grantedBy }
    schoolBranding { logoUrl signatureUrl stampUrl }
  }
`);

const UpdateDocument = graphql(`
  mutation UpdateSchoolSettings($name: String, $motto: String, $address: String, $phone: String, $email: String, $primaryColor: String, $settingsJson: JSON) {
    updateSchoolSettings(name: $name, motto: $motto, address: $address, phone: $phone, email: $email, primaryColor: $primaryColor, settingsJson: $settingsJson) {
      showClassPosition
    }
  }
`);

const ReminderStatusDocument = graphql(`
  query FeeReminderStatus { feeReminderStatus { enabled nextDueOn lastSentAt recipients units walletBalance sample } }
`);

const GrantDocument = graphql(`mutation GrantSupport($reason: String!, $hours: Int!) { grantSupportAccess(reason: $reason, hours: $hours) { id } }`);
const RevokeDocument = graphql(`mutation RevokeSupport($id: ID!) { revokeSupportAccess(grantId: $id) }`);

export default function SettingsPage() {
  const { can, refresh } = useSession();
  const canSchool = can("school.manage");
  const { data, error, isLoading, mutate } = useGql(SettingsDocument, canSchool ? {} : null);
  const [school, setSchool] = useDerivedState(
    data?.school,
    ({ name, motto, address, phone, email, primaryColor }) => ({ name, motto, address, phone: localPhone(phone).replace(/\u00a0/g, " "), email, primaryColor }),
    { name: "", motto: "", address: "", phone: "", email: "", primaryColor: "#1d4ed8" },
  );
  const [s, setS] = useDerivedState(
    data?.schoolSettings,
    (ss) => ({
      showClassPosition: ss.showClassPosition, admissionNumberFormat: ss.admissionNumberFormat, admissionNumberPrefix: ss.admissionNumberPrefix,
      debt: ss.resultDebtThresholdKobo === null || ss.resultDebtThresholdKobo === undefined ? "" : String(ss.resultDebtThresholdKobo / 100),
      bearer: ss.transactionChargeBearer, sender: ss.smsSenderId, notifyAbsence: ss.notifyParentOnAbsence, lowUnits: String(ss.smsLowBalanceUnits), reportTemplate: ss.reportTemplate, principalTitle: ss.principalTitle,
      remindersOn: ss.feeRemindersEnabled, remindEvery: String(ss.feeReminderEveryDays), remindMin: ss.feeReminderMinBalanceKobo ? String(ss.feeReminderMinBalanceKobo / 100) : "",
      remindText: ss.feeReminderTemplate,
    }),
    {
      showClassPosition: true, admissionNumberFormat: "", admissionNumberPrefix: "", debt: "", bearer: "school", sender: "", notifyAbsence: false, lowUnits: "100", reportTemplate: "classic", principalTitle: "Principal",
      remindersOn: false, remindEvery: "14", remindMin: "", remindText: "",
    },
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [supportReason, setSupportReason] = useState("");
  const reminders = useGql(ReminderStatusDocument, canSchool ? {} : null);

  if (!canSchool) {
    return (
      <>
        <PageHeader title="Settings" />
        <SettingsNav />
        <Notice>Choose a section above.</Notice>
      </>
    );
  }
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
    const remindMinKobo = s.remindMin.trim() === "" ? 0 : toKobo(s.remindMin);
    if (remindMinKobo === null) {
      setErr("Enter a valid minimum balance for fee reminders.");
      setBusy(false);
      return;
    }
    const current = data?.schoolSettings;
    const settingsJson: Record<string, unknown> = {
      show_class_position: s.showClassPosition, admission_number_format: s.admissionNumberFormat, admission_number_prefix: s.admissionNumberPrefix,
      result_debt_threshold_kobo: debtKobo, transaction_charge_bearer: s.bearer, notify_parent_on_absence: s.notifyAbsence, sms_low_balance_units: Math.max(0, Math.round(Number(s.lowUnits) || 0)),
      report_template: s.reportTemplate, principal_title: s.principalTitle,
      fee_reminders_enabled: s.remindersOn, fee_reminder_every_days: Number(s.remindEvery), fee_reminder_min_balance_kobo: remindMinKobo,
      fee_reminder_template: s.remindText,
    };
    if (s.sender !== current?.smsSenderId) settingsJson.sms_sender_id = s.sender;
    try {
      await gql(UpdateDocument, { ...school, settingsJson });
      setMsg("Settings saved.");
      await Promise.all([mutate(), refresh(), reminders.mutate()]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof school) => (e: { target: { value: string } }) => setSchool({ ...school, [k]: e.target.value });

  const grants = data?.supportGrants ?? [];
  const senderStatus = data?.schoolSettings.smsSenderStatus ?? "none";

  return (
    <>
      <PageHeader title="Settings" subtitle="How your school appears, and how results, fees and messages behave." />
      <SettingsNav />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card>
        <FormSection title="School profile" description="Shown on report cards, receipts, the sign-in page and SMS messages.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="School name"><Input value={school.name} onChange={set("name")} /></Field>
            <Field label="Motto" optional><Input value={school.motto} onChange={set("motto")} /></Field>
            <Field label="Phone"><Input value={school.phone} onChange={set("phone")} inputMode="tel" /></Field>
            <Field label="Email"><Input type="email" value={school.email} onChange={set("email")} /></Field>
            <div className="sm:col-span-2"><Field label="Address"><Textarea rows={2} value={school.address} onChange={set("address")} /></Field></div>
            <Field label="Brand colour" hint="Used for buttons, the sign-in page and report card headings.">
              <div className="flex items-center gap-3">
                <input type="color" value={school.primaryColor} onChange={set("primaryColor")} className="h-10 w-14 cursor-pointer rounded-lg border border-line-strong bg-surface p-1" aria-label="Brand colour" />
                <Input value={school.primaryColor} onChange={set("primaryColor")} className="w-32 font-mono uppercase" maxLength={7} />
              </div>
            </Field>
          </div>
        </FormSection>
        <FormSection title="Logo, signature and stamp" description="Printed on every report card and receipt. Images save as soon as you upload them.">
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageUpload label="School logo" hint="Square works best. Also shown in the sidebar and on the sign-in page." url={data?.schoolBranding.logoUrl}
              endpoint="/files/school/logo/" onChange={() => { void mutate(); void refresh(); }} emptyText="No logo" />
            <ImageUpload label="Principal's signature" hint="Sign on plain paper and photograph it, or upload a scan. The paper is removed automatically." url={data?.schoolBranding.signatureUrl}
              endpoint="/files/school/signature/" onChange={() => void mutate()} shape="wide" emptyText="No signature" />
            <ImageUpload label="School stamp" hint="A clear photo or scan of the stamp on plain paper. The paper is removed automatically." url={data?.schoolBranding.stampUrl}
              endpoint="/files/school/stamp/" onChange={() => void mutate()} shape="circle" emptyText="No stamp" />
          </div>
        </FormSection>
        <FormSection title="Results and report cards" description="Applies to every class unless a level has its own template.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Report card template">
                <Select value={s.reportTemplate} onChange={(e) => setS({ ...s, reportTemplate: e.target.value })}>
                  <option value="classic">Classic, with highest and lowest scores</option>
                  <option value="compact">Compact</option>
                </Select>
              </Field>
              <Field label="Title of the head of school"><Input value={s.principalTitle} onChange={(e) => setS({ ...s, principalTitle: e.target.value })} placeholder="Principal, Head Teacher, Proprietress" /></Field>
            </div>
            <Checkbox label="Show class position" description="Position in class and in each subject, on report cards and in the parent portal." checked={s.showClassPosition} onChange={(v) => setS({ ...s, showClassPosition: v })} />
          </div>
        </FormSection>
        <FormSection title="Fees" description="Who pays the online payment charge, and when results are held for unpaid fees.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Online payment charge paid by">
              <Select value={s.bearer} onChange={(e) => setS({ ...s, bearer: e.target.value })}>
                <option value="school">The school</option>
                <option value="parent">The parent, as a convenience fee</option>
              </Select>
            </Field>
            <Field label="Hold results when a student owes more than" optional hint="Leave empty to never hold results.">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
                <Input inputMode="decimal" value={s.debt} onChange={(e) => setS({ ...s, debt: e.target.value })} className="pl-7 tabular-nums" placeholder="50,000" />
              </div>
            </Field>
          </div>
        </FormSection>
        <FormSection title="Students" description="Admission numbers are generated in this format for new students.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Admission number format" hint={<>Use {"{prefix}"}, {"{year}"}, {"{yy}"} and {"{seq:04d}"}.</>}>
              <Input value={s.admissionNumberFormat} onChange={(e) => setS({ ...s, admissionNumberFormat: e.target.value })} className="font-mono" />
            </Field>
            <Field label="Prefix" optional><Input value={s.admissionNumberPrefix} onChange={(e) => setS({ ...s, admissionNumberPrefix: e.target.value })} placeholder="GHS" /></Field>
          </div>
        </FormSection>
        <FormSection title="SMS" description="Your own sender name must be approved by the mobile networks. Until then, messages go out under the shared platform name.">
          <div className="space-y-4">
            <Field label="Sender name" hint="Up to 11 letters or numbers.">
              <div className="flex flex-wrap items-center gap-3">
                <Input maxLength={11} value={s.sender} onChange={(e) => setS({ ...s, sender: e.target.value })} className="w-48" />
                {senderStatus !== "none" && <StatusBadge status={senderStatus === "approved" ? "active" : senderStatus === "rejected" ? "failed" : "pending"} />}
              </div>
            </Field>
            <Checkbox label="Text parents when a child is marked absent" description="Uses one SMS unit per parent per absence." checked={s.notifyAbsence} onChange={(v) => setS({ ...s, notifyAbsence: v })} />
            <Field label="Warn me when SMS units fall below" hint="Owners and admins get a banner and an email. 0 turns the warning off.">
              <Input inputMode="numeric" value={s.lowUnits} onChange={(e) => setS({ ...s, lowUnits: e.target.value.replace(/\D/g, "") })} className="w-32 tabular-nums" />
            </Field>
          </div>
        </FormSection>
        <FormSection title="Automatic fee reminders" description="An SMS to parents who still owe, sent at 10am on a schedule while a term is running. Parents with several children get one message.">
          <div className="space-y-4">
            <Checkbox label="Send fee reminders automatically" description="Never on Sundays, never outside term, and never while the portal is read-only." checked={s.remindersOn} onChange={(v) => setS({ ...s, remindersOn: v })} />
            {s.remindersOn && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="How often">
                    <Select value={s.remindEvery} onChange={(e) => setS({ ...s, remindEvery: e.target.value })}>
                      <option value="7">Every week</option>
                      <option value="14">Every two weeks</option>
                      <option value="21">Every three weeks</option>
                      <option value="30">Every month</option>
                    </Select>
                  </Field>
                  <Field label="Only when the balance is more than" optional hint="Leave empty to remind everyone who owes anything.">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
                      <Input inputMode="decimal" value={s.remindMin} onChange={(e) => setS({ ...s, remindMin: e.target.value })} className="pl-7 tabular-nums" placeholder="5,000" />
                    </div>
                  </Field>
                </div>
                <Field label="Message" hint={<>Use {"{student_name}"}, {"{balance}"}, {"{school_name}"} and {"{portal}"}. {"{balance}"} is required.</>}>
                  <Textarea rows={3} value={s.remindText} onChange={(e) => setS({ ...s, remindText: e.target.value })} />
                </Field>
              </>
            )}
            {reminders.data && <ReminderSummary status={reminders.data.feeReminderStatus} />}
          </div>
        </FormSection>
      </Card>
      <FormActions><Button busy={busy} onClick={save}>Save settings</Button></FormActions>

      <PayoutAccountCard />

      <Card title="Support access" description="Let the platform support team into your account for 24 hours. Everything they do is recorded in your audit log.">
        <div className="space-y-3">
          {grants.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-subtle/50 px-4 py-3 text-sm">
              <div>
                <div className="font-medium text-ink">{g.reason}</div>
                <div className="text-[13px] text-muted">Granted by {g.grantedBy} · until {new Date(g.expiresAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={async () => { await gql(RevokeDocument, { id: g.id }); await mutate(); }}>Revoke access</Button>
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="What do you need help with?" value={supportReason} onChange={(e) => setSupportReason(e.target.value)} />
            <Button variant="secondary" disabled={!supportReason.trim()} onClick={async () => {
              try { await gql(GrantDocument, { reason: supportReason, hours: 24 }); setSupportReason(""); await mutate(); } catch (e) { setErr((e as Error).message); }
            }}>Allow access</Button>
          </div>
        </div>
      </Card>
    </>
  );
}

function ReminderSummary({ status }: { status: { enabled: boolean; nextDueOn?: string | null; lastSentAt?: string | null; recipients: number; units: number; walletBalance: number; sample?: string | null } }) {
  const day = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "long" });
  const short = status.enabled && status.units > status.walletBalance;
  return (
    <div className="space-y-2 rounded-lg border border-line bg-subtle/50 px-4 py-3 text-[13px] text-muted">
      <div>
        {status.enabled
          ? status.nextDueOn ? <>Next reminder <span className="font-medium text-ink">{day(status.nextDueOn)}</span>, to </> : <>No reminder scheduled: no term is running. Right now it would go to </>
          : <>Turned off. If it were on, it would go to </>}
        <span className="font-medium text-ink">{status.recipients} parent{status.recipients === 1 ? "" : "s"}</span> and use about {status.units} SMS unit{status.units === 1 ? "" : "s"}.
        {status.lastSentAt && <> Last sent {day(status.lastSentAt)}.</>}
      </div>
      {short && <div className="font-medium text-amber-800 dark:text-amber-200">Your wallet has {status.walletBalance} units, not enough for the next reminder. Buy units under Billing.</div>}
      {status.sample && <div className="rounded-md border border-line bg-surface px-3 py-2 text-ink">{status.sample}</div>}
      <div className="text-xs">Saved settings only. Save to update this preview.</div>
    </div>
  );
}
