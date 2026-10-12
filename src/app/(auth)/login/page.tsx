"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { AuthAlert, AuthButton, AuthField, AuthInput, AuthShell, PasswordInput } from "@/components/auth/AuthShell";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";
import { localPhone } from "@/lib/money";
import { useSession } from "@/lib/session";

const LoginDocument = graphql(`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      permissions
      isPlatformAdmin
    }
  }
`);

function LoginForm() {
  const { school, refresh } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { login } = await gql(LoginDocument, { identifier: identifier.trim(), password });
      await refresh();
      const next = params.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      const parentOnly = login.permissions.length === 1 && login.permissions[0] === "portal.parent";
      const home = !school && login.isPlatformAdmin ? "/console" : parentOnly ? "/parent" : "/dashboard";
      router.replace(safeNext ?? home);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const contact = [localPhone(school?.phone), school?.email].filter(Boolean).join(" or ");

  return (
    <AuthShell
      title="Sign in"
      subtitle={school ? `Welcome to the ${school.name} portal.` : "Sign in to the platform console."}
      footer={
        school ? (
          <>
            <p className="font-medium text-ink">Parents signing in for the first time</p>
            <p className="mt-1 leading-relaxed">
              Your account is created by the school using your phone number. Choose{" "}
              <Link href="/forgot-password" className="font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)]">Set or reset password</Link> to receive a code by SMS.
              {contact && <> For anything else, contact the school office on {contact}.</>}
            </p>
          </>
        ) : (
          <p>
            Running a school? <Link href="/signup" className="font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)]">Create your school&apos;s portal</Link>.
          </p>
        )
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate={false}>
        {error && <AuthAlert>{error}</AuthAlert>}
        <AuthField label="Phone number or email">
          <AuthInput
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus
            placeholder="0803 123 4567"
          />
        </AuthField>
        <AuthField
          label="Password"
          action={<Link href="/forgot-password" className="text-sm font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)]">Forgot password?</Link>}
        >
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </AuthField>
        <AuthButton type="submit" busy={busy}>{busy ? "Signing in…" : "Sign in"}</AuthButton>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
