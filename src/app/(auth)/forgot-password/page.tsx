"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthAlert, AuthButton, AuthField, AuthInput, AuthShell, PasswordInput } from "@/components/auth/AuthShell";
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

  async function requestCode(e?: FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await gql(RequestResetDocument, { identifier: identifier.trim() });
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
      await gql(ResetDocument, { identifier: identifier.trim(), code: code.trim(), newPassword: password });
      router.replace("/login");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const back = <Link href="/login" className="font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)]">← Back to sign in</Link>;

  if (step === "ask") {
    return (
      <AuthShell
        title="Set or reset your password"
        subtitle="Enter the phone number or email address the school has on record. We will send you a 6-digit code."
        footer={back}
      >
        <form onSubmit={requestCode} className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}
          <AuthField label="Phone number or email">
            <AuthInput value={identifier} onChange={(e) => setIdentifier(e.target.value)} inputMode="email" autoCapitalize="none" spellCheck={false} autoComplete="username" required autoFocus placeholder="0803 123 4567" />
          </AuthField>
          <AuthButton type="submit" busy={busy}>Send code</AuthButton>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Enter your code"
      subtitle={<>If an account exists for <span className="font-medium text-ink">{identifier}</span>, a code is on its way. It expires in 10 minutes.</>}
      footer={back}
    >
      <form onSubmit={reset} className="space-y-5">
        {error && <AuthAlert>{error}</AuthAlert>}
        <AuthField
          label="6-digit code"
          action={<button type="button" disabled={busy} onClick={() => void requestCode()} className="text-sm font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)] disabled:opacity-50">Resend code</button>}
        >
          <AuthInput
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            autoFocus
            placeholder="••••••"
            className="text-center font-mono text-xl tracking-[0.5em]"
          />
        </AuthField>
        <AuthField label="New password" hint="At least 8 characters. Avoid your name or phone number.">
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
        </AuthField>
        <AuthButton type="submit" busy={busy} disabled={code.length !== 6}>Save password and sign in</AuthButton>
      </form>
    </AuthShell>
  );
}
