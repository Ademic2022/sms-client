"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { Button, ErrorNote, Field, Input, Notice } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";

const SignUpDocument = graphql(`
  mutation SignUpSchool(
    $name: String!
    $slug: String!
    $adminFirstName: String!
    $adminLastName: String!
    $adminPhone: String!
    $adminEmail: String
    $password: String!
    $sections: [String!]!
    $accept: Boolean!
  ) {
    signUpSchool(
      name: $name
      slug: $slug
      adminFirstName: $adminFirstName
      adminLastName: $adminLastName
      adminPhone: $adminPhone
      adminEmail: $adminEmail
      password: $password
      sections: $sections
      acceptDataProcessingAgreement: $accept
    ) {
      slug
      schoolUrl
    }
  }
`);

const SECTIONS = [
  { key: "nursery", label: "Creche and nursery" },
  { key: "primary", label: "Primary 1–6" },
  { key: "secondary", label: "JSS 1 – SSS 3" },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/school(s)?|college|academy|international/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 30);
}

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", slug: "", first: "", last: "", phone: "", email: "", password: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [sections, setSections] = useState<string[]>(["primary"]);
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value, ...(key === "name" && !slugTouched ? { slug: slugify(value) } : {}) }));
  };
  const host = typeof window !== "undefined" ? window.location.host : "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { signUpSchool } = await gql(SignUpDocument, {
        name: form.name, slug: form.slug, adminFirstName: form.first, adminLastName: form.last, adminPhone: form.phone,
        adminEmail: form.email || null, password: form.password, sections, accept,
      });
      setDone(`${window.location.protocol}//${signUpSchool.slug}.${host}/login`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="text-2xl font-bold text-ink">Your school is ready</h1>
        <Notice tone="success">Classes, subjects, grading and report settings have been created from templates. You can change all of them.</Notice>
        <p className="text-sm text-muted">Your portal address is</p>
        <a href={done} className="break-all text-lg font-semibold text-brand">{done.replace(/\/login$/, "")}</a>
        <Button onClick={() => (window.location.href = done)}>Go to my school</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-2xl font-bold text-ink">Start your free trial</h1>
      <p className="mt-1 text-sm text-muted">Set up takes a few minutes. You can import your students from Excel right after.</p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <ErrorNote error={error} />
        <Field label="School name">
          <Input value={form.name} onChange={set("name")} required placeholder="Greenfield Schools" />
        </Field>
        <Field label="Web address" hint={`${form.slug || "yourschool"}.${host}`}>
          <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug")(e); }} required pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]" />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">Which sections do you run?</legend>
          {SECTIONS.map((s) => (
            <label key={s.key} className="flex min-h-11 items-center gap-3 rounded-lg border border-line px-3">
              <input type="checkbox" checked={sections.includes(s.key)} onChange={(e) => setSections(e.target.checked ? [...sections, s.key] : sections.filter((x) => x !== s.key))} />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your first name"><Input value={form.first} onChange={set("first")} required /></Field>
          <Field label="Your surname"><Input value={form.last} onChange={set("last")} required /></Field>
        </div>
        <Field label="Your phone number" hint="You will log in with this.">
          <Input value={form.phone} onChange={set("phone")} required inputMode="tel" placeholder="0803 123 4567" />
        </Field>
        <Field label="Email (optional)"><Input type="email" value={form.email} onChange={set("email")} /></Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input type="password" value={form.password} onChange={set("password")} minLength={8} required autoComplete="new-password" />
        </Field>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" className="mt-1" checked={accept} onChange={(e) => setAccept(e.target.checked)} required />
          <span>
            I accept the data processing agreement. The school is the data controller for its students under the Nigeria Data
            Protection Act 2023, and the platform processes data on the school&apos;s behalf.
          </span>
        </label>
        <Button type="submit" className="w-full" busy={busy} disabled={!sections.length}>Create my school</Button>
      </form>
      <p className="mt-4 text-center text-sm"><Link href="/" className="text-brand">Back</Link></p>
    </main>
  );
}
