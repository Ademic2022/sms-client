"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { Button, ErrorNote, Field, Input } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";
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
      const { login } = await gql(LoginDocument, { identifier, password });
      await refresh();
      const next = params.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      const home = !school && login.isPlatformAdmin ? "/console" : login.permissions.includes("portal.parent") && login.permissions.length === 1 ? "/parent" : "/dashboard";
      router.replace(safeNext ?? home);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-6 text-center">
        {school?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={school.logoUrl} alt="" className="mx-auto mb-3 h-16 w-16 object-contain" />
        )}
        <h1 className="text-xl font-bold text-ink">{school?.name ?? "Platform login"}</h1>
        {school?.motto && <p className="text-sm italic text-muted">{school.motto}</p>}
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <ErrorNote error={error} />
        <Field label="Phone number or email">
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" inputMode="email" required placeholder="0803 123 4567" />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </Field>
        <Button type="submit" className="w-full" busy={busy}>Log in</Button>
        <div className="text-center text-sm">
          <Link href="/forgot-password" className="text-brand">Forgot password or first time here?</Link>
        </div>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
