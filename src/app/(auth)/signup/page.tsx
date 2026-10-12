"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { AuthAlert, AuthButton, AuthField, AuthInput, AuthShell, PasswordInput } from "@/components/auth/AuthShell";
import { IconCheck } from "@/components/icons";
import { Checkbox, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";
import { SITE } from "@/lib/site";

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
  { key: "nursery", label: "Nursery", text: "Creche, Nursery 1–2" },
  { key: "primary", label: "Primary", text: "Primary 1–6" },
  { key: "secondary", label: "Secondary", text: "JSS 1 – SSS 3" },
];

const ASIDE = {
  heading: "Set up your school's portal in minutes.",
  text: `Start a ${SITE.trialDays}-day free trial. No card required, and nothing to install.`,
  points: [
    "Classes, subjects and grading created from templates you can change",
    "Import your students from Excel the same day",
    "Your own web address, logo and colours",
    "Run a full term's results and fees before you pay",
  ],
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\b(the|schools?|college|academy|international|group of)\b/g, "").replace(/[^a-z0-9]+/g, "").slice(0, 30);
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h2 className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold text-ink">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand-ink">{step}</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", slug: "", first: "", last: "", phone: "", email: "", password: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [sections, setSections] = useState<string[]>(["primary"]);
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ url: string; host: string } | null>(null);

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
      const schoolHost = `${signUpSchool.slug}.${host}`;
      setDone({ url: `${window.location.protocol}//${schoolHost}/login`, host: schoolHost });
    } catch (err) {
      setError((err as Error).message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Your school is ready" subtitle="We have set up classes, subjects, grading and report cards from templates. You can change all of them." aside={ASIDE}>
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><IconCheck size={20} strokeWidth={2.2} /></span>
            <div className="min-w-0">
              <div className="text-xs text-muted">Your portal address</div>
              <div className="truncate font-medium text-ink">{done.host}</div>
            </div>
          </div>
          <ol className="space-y-2 text-sm text-muted">
            <li>1. Sign in with your phone number and password.</li>
            <li>2. Set this session&apos;s terms under Settings, then import your students.</li>
            <li>3. Add your teachers and bursar, and set this term&apos;s fees.</li>
          </ol>
          <AuthButton onClick={() => window.location.assign(done.url)}>Go to my school</AuthButton>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      wide
      aside={ASIDE}
      title="Create your school's portal"
      subtitle={`${SITE.trialDays}-day free trial. No card required.`}
      footer={<p>Already set up? Sign in from your school&apos;s own web address, for example <span className="font-medium text-ink">yourschool.{host || "akada.ng"}</span>.</p>}
    >
      <form onSubmit={submit} className="space-y-6">
        {error && <AuthAlert>{error}</AuthAlert>}

        <Section step={1} title="Your school">
          <AuthField label="School name">
            <AuthInput value={form.name} onChange={set("name")} required placeholder="Greenfield Schools" autoComplete="organization" />
          </AuthField>
          <AuthField label="Web address" hint="Lowercase letters and numbers. You can add your own domain later.">
            <div className="flex overflow-hidden rounded-lg border border-line bg-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
              <input
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); set("slug")({ target: { value: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") } }); }}
                required
                pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]"
                aria-label="Web address"
                className="h-12 min-w-0 flex-1 bg-transparent px-3.5 text-[15px] text-ink outline-none"
                placeholder="greenfield"
              />
              <span className="flex items-center border-l border-line bg-subtle px-3.5 text-sm text-muted">.{host || "akada.ng"}</span>
            </div>
          </AuthField>
          <div>
            <div className="mb-1.5 text-sm font-medium text-ink">Sections you run</div>
            <div className="grid gap-2 sm:grid-cols-3">
              {SECTIONS.map((s) => {
                const on = sections.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSections(on ? sections.filter((x) => x !== s.key) : [...sections, s.key])}
                    className={cx("relative rounded-lg border px-3.5 py-3 text-left transition", on ? "border-brand bg-brand/5 ring-[3px] ring-brand/10" : "border-line hover:bg-subtle")}
                  >
                    {on && <span className="absolute right-2.5 top-2.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-white"><IconCheck size={11} strokeWidth={2.6} /></span>}
                    <div className="text-sm font-medium text-ink">{s.label}</div>
                    <div className="text-xs text-muted">{s.text}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        <Section step={2} title="Your account">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="First name"><AuthInput value={form.first} onChange={set("first")} required autoComplete="given-name" /></AuthField>
            <AuthField label="Surname"><AuthInput value={form.last} onChange={set("last")} required autoComplete="family-name" /></AuthField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="Phone number" hint="You sign in with this.">
              <AuthInput value={form.phone} onChange={set("phone")} required inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" />
            </AuthField>
            <AuthField label="Email" hint="Optional.">
              <AuthInput type="email" value={form.email} onChange={set("email")} autoComplete="email" />
            </AuthField>
          </div>
          <AuthField label="Password" hint="At least 8 characters.">
            <PasswordInput value={form.password} onChange={set("password")} minLength={8} required autoComplete="new-password" />
          </AuthField>
        </Section>

        <Section step={3} title="Data protection">
          <div className="rounded-lg border border-line bg-subtle/50 p-4">
            <Checkbox
              checked={accept}
              onChange={setAccept}
              label="I accept the data processing agreement on behalf of the school"
              description="Under the Nigeria Data Protection Act 2023, your school is the data controller for its students, and we process data on your behalf."
            />
          </div>
        </Section>

        <AuthButton type="submit" busy={busy} disabled={!sections.length || !accept}>{busy ? "Creating your school…" : "Create my school"}</AuthButton>
        <p className="text-center text-xs text-muted">
          By continuing you agree to the terms of service. <Link href="/" className="font-medium text-ink hover:underline">Back to the homepage</Link>
        </p>
      </form>
    </AuthShell>
  );
}
