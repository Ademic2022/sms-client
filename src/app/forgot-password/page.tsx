"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ErrorNote, Field, Input, Notice } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";

const RequestResetDocument = graphql(`
  mutation RequestReset($identifier: String!) {
    requestPasswordReset(identifier: $identifier)
  }
`);

const ResetDocument = graphql(`
  mutation ResetPassword($identifier: String!, $code: String!, $newPassword: String!) {
    resetPassword(identifier: $identifier, code: $code, newPassword: $newPassword)
  }
`);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"ask" | "reset">("ask");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await gql(RequestResetDocument, { identifier });
      setStep("reset");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await gql(ResetDocument, { identifier, code, newPassword: password });
      router.replace("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="mb-4 text-center text-xl font-bold text-ink">Set a new password</h1>
      {step === "ask" ? (
        <form onSubmit={requestCode} className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-sm text-muted">Enter the phone number or email the school has for you. We will send a 6-digit code.</p>
          <ErrorNote error={error} />
          <Field label="Phone number or email">
            <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required inputMode="email" />
          </Field>
          <Button type="submit" className="w-full" busy={busy}>Send code</Button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
          <Notice>If an account exists for {identifier}, a code is on its way. It expires in 10 minutes.</Notice>
          <ErrorNote error={error} />
          <Field label="6-digit code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
          </Field>
          <Field label="New password" hint="At least 8 characters.">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </Field>
          <Button type="submit" className="w-full" busy={busy}>Save password</Button>
          <button type="button" className="w-full text-sm text-brand" onClick={() => setStep("ask")}>Send another code</button>
        </form>
      )}
      <Link href="/login" className="mt-4 text-center text-sm text-brand">Back to log in</Link>
    </main>
  );
}
