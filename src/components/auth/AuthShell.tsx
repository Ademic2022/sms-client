"use client";

import Link from "next/link";
import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

import { localPhone } from "@/lib/money";
import { SITE } from "@/lib/site";
import { useSession, type School } from "@/lib/session";

const PLATFORM_GREEN = "#0f3d2e";

/** White or near-black text, whichever reads better on the school's colour. */
function textOn(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45 ? "#14181a" : "#ffffff";
}

function initials(name: string) {
  const words = name.replace(/\b(the|of|and|schools?|college|academy|international)\b/gi, " ").split(/\s+/).filter(Boolean);
  return (words.length ? words : name.split(/\s+/)).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

function Crest({ school, size = 56 }: { school: School | null; size?: number }) {
  if (school?.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={school.logoUrl} alt="" width={size} height={size} className="rounded-xl bg-white/95 object-contain p-1.5" style={{ width: size, height: size }} />;
  }
  if (school) {
    return (
      <span className="grid place-items-center rounded-xl bg-white/15 font-[family-name:var(--font-auth-display)] font-semibold ring-1 ring-inset ring-white/25" style={{ width: size, height: size, fontSize: size * 0.38 }}>
        {initials(school.name)}
      </span>
    );
  }
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#fffcf5" />
      <path d="M16 7 6 12l10 5 8-4v6h2v-7z" fill={PLATFORM_GREEN} />
      <path d="M10 16v4.5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5V16l-6 3z" fill={PLATFORM_GREEN} opacity=".85" />
    </svg>
  );
}

/** Split-screen frame for sign-in pages: the school's identity on one side, the form on the other. */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  const { school, loading } = useSession();
  const brand = school?.primaryColor || PLATFORM_GREEN;
  const ink = textOn(brand);
  const name = school?.name ?? `${SITE.name} platform`;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(420px,5fr)_7fr]" style={{ ["--brand" as string]: brand }}>
      {/* Identity panel */}
      <aside className="relative overflow-hidden" style={{ backgroundColor: brand, color: ink }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: `repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)` }}
        />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full border-[56px] border-current opacity-[0.06]" />
        <div className={`relative flex h-full flex-col px-6 py-6 sm:px-10 lg:min-h-screen lg:px-12 lg:py-12 ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}>
          <div className="flex items-center gap-4">
            <Crest school={school} size={48} />
            <div className="min-w-0">
              <div className="truncate font-[family-name:var(--font-auth-display)] text-lg font-semibold leading-tight sm:text-xl">{name}</div>
              {school?.motto && <div className="truncate text-sm italic opacity-75">{school.motto}</div>}
            </div>
          </div>

          <div className="mt-auto hidden lg:block">
            <div className="h-px w-12 bg-current opacity-40" />
            <p className="mt-6 max-w-sm font-[family-name:var(--font-auth-display)] text-[34px] font-medium leading-[1.15] tracking-[-0.01em]">
              {school ? "Results, fees and school notices in one secure portal." : "Platform administration for schools on " + SITE.name + "."}
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed opacity-75">
              {school
                ? "For staff, parents and students of " + school.name + ". Sign in with the phone number or email address the school has on record."
                : "Restricted to platform staff. School users should sign in from their school's own web address."}
            </p>
          </div>

          <div className="mt-auto hidden pt-10 text-[13px] opacity-70 lg:block">
            {school?.address && <div className="max-w-sm">{school.address}</div>}
            {(school?.phone || school?.email) && (
              <div className="mt-1">{[localPhone(school?.phone), school?.email].filter(Boolean).join(" · ")}</div>
            )}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col px-6 sm:px-10">
        <div className="flex flex-1 items-center justify-center py-10 lg:py-16">
          <div className="w-full max-w-[400px]">
            <h1 className="font-[family-name:var(--font-auth-display)] text-[32px] font-medium leading-tight tracking-[-0.01em] text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-line pt-6 text-sm text-muted">{footer}</div>}
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
            Encrypted connection. We never ask for your password by SMS or phone.
          </span>
          <span>
            Powered by <Link href={school ? "#" : "/"} className="font-medium text-ink hover:underline">{SITE.name}</Link>
          </span>
        </footer>
      </main>
    </div>
  );
}

export function AuthField({ label, action, hint, children }: { label: string; action?: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-ink">{label}</label>
        {action}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const inputClass =
  "block h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15 dark:focus:border-[color-mix(in_srgb,var(--brand),white_40%)]";

export function AuthInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${inputClass} pr-16`} />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute inset-y-0 right-0 px-3.5 text-xs font-semibold uppercase tracking-wide text-muted hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export function AuthButton({ busy, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-[15px] font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  );
}

export function AuthAlert({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-200"
      : "border-line bg-subtle text-ink";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-snug ${styles}`}>
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="8" cy="8" r="6.25" /><path d="M8 4.75v3.75M8 11h.01" strokeLinecap="round" />
      </svg>
      <div>{children}</div>
    </div>
  );
}
