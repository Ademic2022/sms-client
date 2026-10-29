"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, Card, ErrorNote, Field, FormSection, Notice, PageHeader, PasswordInput } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";
import { localPhone } from "@/lib/money";
import { homeFor, useSession } from "@/lib/session";

const ChangePasswordDocument = graphql(`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`);

const EMPTY = { current: "", next: "", again: "" };

export default function AccountPage() {
  const { me, school, refresh } = useSession();
  const router = useRouter();
  const firstTime = Boolean(me?.mustChangePassword);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setDone(false);
    if (form.next !== form.again) {
      setErr("The two new passwords are different.");
      return;
    }
    setBusy(true);
    try {
      await gql(ChangePasswordDocument, { currentPassword: form.current, newPassword: form.next });
      setForm(EMPTY);
      if (firstTime && me) {
        await refresh(); // the starting password is gone: carry on to the portal
        router.replace(homeFor(me.permissions));
        return;
      }
      setDone(true);
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Your account" subtitle={school ? `Signed in to ${school.name}` : undefined} />
      {firstTime && (
        <Notice tone="warning" title="Choose your own password">
          You signed in with a starting password from the school. Choose a new one that only you know before you continue.
        </Notice>
      )}
      <Card>
        <FormSection title="Your details" description="To change your name, phone number or email address, ask the school office.">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-muted">Name</dt><dd className="mt-0.5 font-medium text-ink">{me?.user.fullName}</dd></div>
            <div><dt className="text-muted">Phone</dt><dd className="mt-0.5 font-medium tabular-nums text-ink">{me?.user.phone ? localPhone(me.user.phone) : "–"}</dd></div>
            <div><dt className="text-muted">Email</dt><dd className="mt-0.5 break-all font-medium text-ink">{me?.user.email || "–"}</dd></div>
          </dl>
        </FormSection>
        <FormSection title="Change password" description="Use at least 8 characters that are not easy to guess. You'll get an email when it changes, if your account has one.">
          <form onSubmit={submit} className="max-w-md space-y-4">
            <ErrorNote error={err} />
            {done && <Notice tone="success">Password changed. Use it the next time you sign in.</Notice>}
            <Field label={firstTime ? "Starting password from the school" : "Current password"}>
              <PasswordInput autoComplete="current-password" value={form.current} onChange={set("current")} required />
            </Field>
            <Field label="New password">
              <PasswordInput autoComplete="new-password" minLength={8} value={form.next} onChange={set("next")} required />
            </Field>
            <Field label="New password again">
              <PasswordInput autoComplete="new-password" minLength={8} value={form.again} onChange={set("again")} required />
            </Field>
            <Button type="submit" busy={busy}>Change password</Button>
          </form>
        </FormSection>
      </Card>
    </>
  );
}
