"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";

import { AuthAlert, AuthButton, AuthField, AuthInput, AuthShell } from "@/components/auth/AuthShell";
import { ResendButton } from "@/components/auth/ResendButton";
import { IconCheck } from "@/components/icons";
import { Loading } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";
import { ResendConfirmationDocument } from "@/lib/queries";

const ConfirmEmailDocument = graphql(`
  mutation ConfirmEmail($token: String!) { confirmEmail(token: $token) { email schoolName schoolUrl } }
`);

type Result = { email: string; schoolName?: string | null; schoolUrl?: string | null };

function ConfirmEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(token ? null : "This link is incomplete. Open it straight from the email, or ask for a new one below.");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return; // once, even when React runs effects twice in development
    started.current = true;
    gql(ConfirmEmailDocument, { token })
      .then(({ confirmEmail }) => setResult(confirmEmail))
      .catch((e: Error) => setError(e.message));
  }, [token]);

  if (result) {
    return (
      <AuthShell title="Email confirmed" subtitle={result.schoolName ? `Your ${result.schoolName} account is ready.` : "Your account is ready."}>
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><IconCheck size={20} strokeWidth={2.2} /></span>
            <div className="min-w-0">
              <div className="text-xs text-muted">Confirmed</div>
              <div className="truncate font-medium text-ink">{result.email}</div>
            </div>
          </div>
          {result.schoolUrl ? (
            <AuthButton onClick={() => window.location.assign(result.schoolUrl!)}>Sign in to {result.schoolName ?? "your school"}</AuthButton>
          ) : (
            <p className="text-sm text-muted">You can now sign in from your school&apos;s web address with your phone number and password.</p>
          )}
        </div>
      </AuthShell>
    );
  }
  if (error) return <Resend message={error} />;
  return <AuthShell title="Confirming your email"><Loading label="Confirming" /></AuthShell>;
}

function Resend({ message }: { message: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await gql(ResendConfirmationDocument, { identifier: email.trim() }).catch(() => null);
    setSent(true);
    setBusy(false);
  }

  return (
    <AuthShell title="This link did not work" subtitle="Links last 3 days, and stop working if the email address on the account changes."
      footer={<Link href="/" className="font-medium text-ink hover:underline">Back to the homepage</Link>}>
      {sent ? (
        <div className="space-y-4">
          <AuthAlert tone="info">If that address belongs to an account waiting for confirmation, a new link is on its way. Check your spam folder too.</AuthAlert>
          <p className="text-sm text-muted">
            Still nothing?{" "}
            <ResendButton waitFirst onSend={() => gql(ResendConfirmationDocument, { identifier: email.trim() })} />
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <AuthAlert>{message}</AuthAlert>
          <AuthField label="Your email address">
            <AuthInput type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </AuthField>
          <AuthButton type="submit" busy={busy}>Send a new link</AuthButton>
        </form>
      )}
    </AuthShell>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConfirmEmail />
    </Suspense>
  );
}
