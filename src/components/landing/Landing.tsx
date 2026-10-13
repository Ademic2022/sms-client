import Link from "next/link";
import type { ReactNode } from "react";

import { SITE } from "@/lib/site";

import { FAQS } from "./faqs";
import { FeesMock, PhoneMock, ReceiptMock, ReportCardMock, ScoreGridMock } from "./Mockups";

// "/#..." rather than "#...", so the links also work from the legal pages.
const NAV = [
  ["Product", "/#product"],
  ["How it works", "/#how"],
  ["Parents", "/#parents"],
  ["Pricing", "/#pricing"],
  ["FAQ", "/#faq"],
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill={light ? "#fffcf5" : "var(--lp-green)"} />
        <path d="M16 7 6 12l10 5 8-4v6h2v-7z" fill={light ? "var(--lp-green)" : "var(--lp-saffron)"} />
        <path d="M10 16v4.5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5V16l-6 3z" fill={light ? "var(--lp-green)" : "#fffcf5"} opacity=".9" />
      </svg>
      <span className={`font-display text-[22px] font-semibold tracking-tight ${light ? "text-[#fffcf5]" : "text-[var(--lp-green)]"}`}>{SITE.name}</span>
    </span>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div className={`mb-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] ${light ? "text-[var(--lp-saffron)]" : "text-[var(--lp-clay)]"}`}>
      <span className={`h-px w-6 ${light ? "bg-[var(--lp-saffron)]" : "bg-[var(--lp-clay)]"}`} />
      {children}
    </div>
  );
}

function CTA({ href, children, variant = "solid" }: { href: string; children: ReactNode; variant?: "solid" | "outline" | "light" }) {
  const styles = {
    solid: "bg-[var(--lp-green)] text-[#fffcf5] hover:bg-[var(--lp-green-2)] shadow-[0_8px_20px_-8px_rgba(15,61,46,0.6)]",
    outline: "border border-[var(--lp-green)]/25 text-[var(--lp-green)] hover:border-[var(--lp-green)] hover:bg-[var(--lp-green)]/5",
    light: "bg-[var(--lp-saffron)] text-[var(--lp-green)] hover:bg-[#f2b45a]",
  };
  return (
    <Link href={href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition ${styles[variant]}`}>
      {children}
    </Link>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);

const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={`h-4 w-4 flex-none ${className}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m3 8.5 3.2 3L13 5" /></svg>
);

/* ------------------------------------------------------------------------- */

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--lp-rule)]/70 bg-[var(--lp-paper)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label={`${SITE.name} home`}><Logo /></Link>
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-[var(--lp-muted)] lg:flex">
          {NAV.map(([label, href]) => <a key={href} href={href} className="transition hover:text-[var(--lp-green)]">{label}</a>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="hidden px-3 text-[14px] font-semibold text-[var(--lp-green)] sm:inline">Log in</Link>
          <Link href="/signup" className="inline-flex min-h-10 items-center rounded-full bg-[var(--lp-green)] px-4 text-[14px] font-semibold text-[#fffcf5] transition hover:bg-[var(--lp-green-2)]">
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-ruled relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
        <div>
          <div className="lp-rise mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--lp-green)]/15 bg-[var(--lp-card)] py-1 pl-1 pr-3 text-[13px] text-[var(--lp-muted)]" style={{ animationDelay: "0.05s" }}>
            <span className="rounded-full bg-[var(--lp-green)] px-2 py-0.5 text-[11px] font-semibold text-[var(--lp-saffron)]">New</span>
            Subject templates for the revised national curriculum
          </div>
          <h1 className="lp-rise font-display text-[44px] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--lp-green)] sm:text-[60px] lg:text-[68px]" style={{ animationDelay: "0.12s" }}>
            Results day,<br />
            <span className="italic text-[var(--lp-clay)]">without</span> the<br />
            late nights.
          </h1>
          <p className="lp-rise mt-6 max-w-xl text-[18px] leading-relaxed text-[var(--lp-muted)]" style={{ animationDelay: "0.22s" }}>
            {SITE.name} computes your termly report cards and collects your school fees. Teachers enter scores on their phones, parents pay
            online, and you see who has paid without opening a single bank statement.
          </p>
          <div className="lp-rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.32s" }}>
            <CTA href="/signup">Start your free trial <Arrow /></CTA>
            <CTA href="#how" variant="outline">See how it works</CTA>
          </div>
          <ul className="lp-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-[var(--lp-muted)]" style={{ animationDelay: "0.42s" }}>
            {[`${SITE.trialDays}-day free trial`, "Live within a day", "No card required"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="text-[var(--lp-green-2)]" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto h-[560px] w-full max-w-[520px] sm:h-[600px]">
          <div className="absolute -right-16 top-6 h-80 w-80 rounded-full bg-[var(--lp-saffron)]/25 blur-3xl" aria-hidden />
          <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-[var(--lp-green)]/15 blur-3xl" aria-hidden />
          <div className="lp-rise absolute left-0 top-0 sm:left-2" style={{ animationDelay: "0.25s" }}>
            <div className="-rotate-[2.5deg]">
              <div className="lp-float"><ReportCardMock /></div>
            </div>
          </div>
          <div className="lp-rise absolute -bottom-2 -right-2 sm:-right-6" style={{ animationDelay: "0.55s" }}>
            <div className="rotate-[4deg]">
              <div className="lp-float" style={{ animationDelay: "1.5s" }}><PhoneMock /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Strip() {
  const levels = ["Creche", "Nursery", "Primary 1–6", "JSS 1–3", "SSS 1–3"];
  const facts = [
    ["Works on 3G", "Light pages, built for low-end Android phones"],
    ["Scores save offline", "Teachers keep working when the network drops"],
    ["Paystack payments", "Card, bank transfer and USSD"],
    ["SMS that arrives", "Transactional route reaches DND numbers"],
  ];
  return (
    <section className="border-y border-[var(--lp-rule)] bg-[var(--lp-card)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] font-medium text-[var(--lp-muted)]">One portal for every section you run</p>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <span key={l} className="rounded-full border border-[var(--lp-rule)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--lp-green)]">{l}</span>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-6 border-t border-dashed border-[var(--lp-rule)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(([t, d]) => (
            <div key={t}>
              <div className="font-display text-[19px] text-[var(--lp-green)]">{t}</div>
              <div className="mt-1 text-[14px] text-[var(--lp-muted)]">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TwoJobs() {
  return (
    <section id="product" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32">
      <div className="max-w-3xl">
        <Eyebrow>The two jobs that matter</Eyebrow>
        <h2 className="font-display text-[38px] font-medium leading-[1.08] tracking-[-0.015em] text-[var(--lp-green)] sm:text-[50px]">
          Report cards that compute themselves. Fees that reconcile themselves.
        </h2>
        <p className="mt-5 text-[18px] leading-relaxed text-[var(--lp-muted)]">
          Spreadsheets break at the two moments a school cannot afford it: result week and resumption week. {SITE.name} was built around both.
        </p>
      </div>

      <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1"><ScoreGridMock /></div>
        <div className="order-1 lg:order-2">
          <div className="font-display text-[15px] italic text-[var(--lp-clay)]">01 — Results</div>
          <h3 className="mt-2 font-display text-[30px] font-medium leading-tight text-[var(--lp-green)]">From score sheet to signed report card, without collation.</h3>
          <ul className="mt-6 space-y-3.5 text-[16px] text-[var(--lp-ink)]">
            {[
              "Subject teachers enter CA and exam scores in a grid on their phone, or upload the Excel sheet they already use.",
              "Totals, grades, subject and class positions, class averages, highest and lowest are computed instantly.",
              "The broadsheet shows which subjects still have missing scores, so you know exactly who to chase.",
              "The principal approves and locks results. Any later change needs permission and is logged.",
              "Generate a whole class of PDF report cards in one click, with your crest, signature and stamp. Third term shows the session's cumulative result.",
            ].map((t) => <li key={t} className="flex gap-3"><Check className="mt-1 text-[var(--lp-green-2)]" />{t}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-24 overflow-hidden rounded-[28px] bg-[var(--lp-green)] lg:mt-32">
        <div className="lp-grain grid items-center gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
          <div>
            <div className="font-display text-[15px] italic text-[var(--lp-saffron)]">02 — Fees</div>
            <h3 className="mt-2 font-display text-[30px] font-medium leading-tight text-[#fffcf5]">Know who has paid, the moment they pay.</h3>
            <ul className="mt-6 space-y-3.5 text-[16px] text-white/85">
              {[
                "Itemised bills per class and term: tuition, books, uniform, bus, lesson, PTA levy.",
                "Discounts, sibling discounts and scholarships applied automatically. Part payment is normal, and every balance is exact.",
                "Parents pay any amount by card, transfer or USSD. Money settles straight into your school's bank account.",
                "Cash, POS and bank tellers are recorded by the bursar. Parents get an SMS receipt instantly and a printable official receipt, with the amount in words.",
                "Every change to a bill or payment is written to an audit log, with the person and the time.",
              ].map((t) => <li key={t} className="flex gap-3"><Check className="mt-1 text-[var(--lp-saffron)]" />{t}</li>)}
            </ul>
          </div>
          <div className="relative lg:min-h-[500px]">
            <div className="lg:w-[86%]"><FeesMock /></div>
            <div className="relative mx-auto mt-6 w-fit rotate-[2.5deg] lg:absolute lg:right-0 lg:top-[190px] lg:mt-0">
              <ReceiptMock />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    ["Attendance in a minute", "Everyone starts present; tap the absent ones. Report cards show days present out of days opened."],
    ["Your grading, your way", "CA splits like 40/60 or 30/70, A–F for primary, WAEC A1–F9 for seniors. Set per level."],
    ["SSS subject choices", "Core subjects plus each student's electives and trade subject, so every report card fits the child."],
    ["Excel in, Excel out", "Import students and guardians from a template with clear errors per row. Export every list."],
    ["Bulk SMS with a wallet", "Announcements, fee reminders and result alerts. See units used and every number that failed."],
    ["Roles that fit your staff", "Owner, admin, class teacher, subject teacher, bursar, parent and student. One person can hold several."],
    ["Results on hold for debt", "Choose a threshold. Parents above it see a friendly note to pay before results open."],
    ["End-of-session promotion", "Promote, repeat or graduate whole classes, and keep every student's history."],
  ];
  return (
    <section className="border-t border-[var(--lp-rule)] bg-[var(--lp-card)]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Eyebrow>Everything else, handled</Eyebrow>
            <h2 className="font-display text-[36px] font-medium leading-[1.1] tracking-[-0.01em] text-[var(--lp-green)] sm:text-[44px]">Built for how Nigerian schools actually run.</h2>
          </div>
          <p className="max-w-sm text-[16px] text-[var(--lp-muted)]">Every school does things a little differently, so nearly everything is a setting, not a rule.</p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[var(--lp-rule)] bg-[var(--lp-rule)] sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([t, d], i) => (
            <div key={t} className="group bg-[var(--lp-card)] p-6 transition hover:bg-[var(--lp-paper)]">
              <div className="font-display text-[13px] text-[var(--lp-clay)]">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-3 text-[17px] font-semibold text-[var(--lp-green)]">{t}</div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--lp-muted)]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Sign up", "Pick your web address, choose nursery, primary and secondary, and we set up classes, subjects and grading from templates.", "10 minutes"],
    ["Bring your students", "Fill in our Excel template, or export from what you use now. Guardians are linked by phone number automatically.", "Same day"],
    ["Run your term", "Add staff, set fees, and invite parents. Teachers enter scores; you approve, publish and collect.", "From day one"],
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="font-display text-[38px] font-medium leading-[1.08] text-[var(--lp-green)] sm:text-[48px]">Working within one day.</h2>
        <p className="mt-4 text-[17px] text-[var(--lp-muted)]">No installation, no server room, no long onboarding. Start at the beginning of any term.</p>
      </div>
      <ol className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
        <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-[var(--lp-rule)] md:block" aria-hidden />
        {steps.map(([t, d, time], i) => (
          <li key={t} className="relative">
            <div className="relative grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--lp-green)] bg-[var(--lp-paper)] font-display text-[22px] text-[var(--lp-green)]">{i + 1}</div>
            <div className="mt-6 flex items-baseline justify-between gap-3">
              <h3 className="font-display text-[24px] text-[var(--lp-green)]">{t}</h3>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-clay)]">{time}</span>
            </div>
            <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--lp-muted)]">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Parents() {
  return (
    <section id="parents" className="scroll-mt-20 border-y border-[var(--lp-rule)] bg-[#efe6d4]">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto">
          <div className="absolute inset-0 -z-0 translate-x-6 translate-y-6 rounded-[36px] border-2 border-dashed border-[var(--lp-green)]/20" aria-hidden />
          <div className="relative w-[280px] rounded-[36px] border-[8px] border-[#16201b] bg-[#16201b] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.5)]">
            <div className="overflow-hidden rounded-[28px] bg-[var(--lp-paper)]">
              <div className="bg-[var(--lp-green)] px-5 pb-6 pt-8 text-[#fffcf5]">
                <div className="text-[12px] text-white/70">Good evening, Mrs Okafor</div>
                <div className="font-display text-[22px]">My children</div>
              </div>
              <div className="-mt-3 space-y-3 px-3 pb-5">
                {[["Chidinma Okafor", "JSS 2B", "₦0", "Paid", true], ["Emeka Okafor", "Primary 4", "₦42,500", "Owing", false]].map(([n, c, b, s, paid]) => (
                  <div key={n as string} className="rounded-2xl bg-[var(--lp-card)] p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div><div className="text-[14px] font-semibold">{n}</div><div className="text-[12px] text-[var(--lp-muted)]">{c}</div></div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${paid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{s}</span>
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div><div className="text-[11px] text-[var(--lp-muted)]">Balance</div><div className="font-display text-[20px]">{b}</div></div>
                      <span className="text-[12px] font-semibold text-[var(--lp-green)]">Results →</span>
                    </div>
                  </div>
                ))}
                <div className="rounded-full bg-[var(--lp-green)] py-3 text-center text-[14px] font-semibold text-[#fffcf5]">Pay ₦42,500</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Eyebrow>For parents</Eyebrow>
          <h2 className="font-display text-[38px] font-medium leading-[1.08] text-[var(--lp-green)] sm:text-[48px]">The parent portal fits in their pocket.</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--lp-muted)]">
            Most parents use Android phones and many never check email. So {SITE.name} works over SMS first, and the portal installs on the home
            screen like an app, with no app store needed.
          </p>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2">
            {[
              ["Log in with a phone number", "No email needed. Password resets come by SMS."],
              ["Every child, one login", "Siblings in different classes, even different schools on the platform."],
              ["Pay for several children at once", "One transaction, split correctly across each child's account."],
              ["Results the moment they're out", "An SMS when results are published, and a report card to download."],
            ].map(([t, d]) => (
              <div key={t} className="border-l-2 border-[var(--lp-saffron)] pl-4">
                <dt className="text-[16px] font-semibold text-[var(--lp-green)]">{t}</dt>
                <dd className="mt-1 text-[14.5px] text-[var(--lp-muted)]">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    ["Your data stays yours", "Every school's records are isolated from every other school's, checked by automated tests in every release."],
    ["Nigeria Data Protection Act 2023", "Your school is the data controller; we process on your behalf under a signed agreement. Guardian consent is recorded per child."],
    ["A full audit trail", "Who changed a score, reversed a payment or exported a list, and when. Support staff can only enter with your permission."],
    ["Your money, your account", "Online payments settle directly into your school's bank account. We never hold school funds."],
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
      <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <Eyebrow>Trust and security</Eyebrow>
          <h2 className="font-display text-[38px] font-medium leading-[1.08] text-[var(--lp-green)] sm:text-[46px]">Children&apos;s records deserve better than a shared spreadsheet.</h2>
          <p className="mt-5 text-[17px] text-[var(--lp-muted)]">Going digital is a question of trust. Here is what we do to earn it.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-[var(--lp-rule)] bg-[var(--lp-card)] p-6">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--lp-clay)]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z" /><path d="m9 12 2 2 4-4" />
              </svg>
              <div className="mt-4 text-[17px] font-semibold text-[var(--lp-green)]">{t}</div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--lp-muted)]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const price = SITE.pricePerStudentNaira.toLocaleString("en-NG");
  const included = [
    "Report cards, broadsheets and cumulative results",
    "Fees, online payments and receipts",
    "Attendance, student records and Excel import",
    "Parent and student portal",
    "Unlimited staff accounts",
    "Support on WhatsApp",
  ];
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-[var(--lp-rule)] bg-[var(--lp-card)]">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-display text-[38px] font-medium leading-[1.08] text-[var(--lp-green)] sm:text-[48px]">You pay termly. So do we.</h2>
          <p className="mt-4 text-[17px] text-[var(--lp-muted)]">
            Schools collect money by term and enrolment changes every term, so our price follows the same rhythm.
          </p>
        </div>
        <div className="mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-[28px] border border-[var(--lp-rule)] bg-[var(--lp-paper)] lg:grid-cols-[1.1fr_1fr]">
          <div className="p-8 sm:p-12">
            <div className="text-[14px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-clay)]">One plan, everything included</div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-[64px] font-medium leading-none text-[var(--lp-green)]">₦{price}</span>
            </div>
            <div className="mt-2 text-[16px] text-[var(--lp-muted)]">per active student, per term</div>
            <ul className="mt-8 grid gap-3 text-[15px] sm:grid-cols-2 lg:grid-cols-1">
              {included.map((t) => <li key={t} className="flex gap-3"><Check className="mt-0.5 text-[var(--lp-green-2)]" />{t}</li>)}
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-[var(--lp-green)] p-8 text-white sm:p-12">
            <div className="space-y-6">
              {[
                [`${SITE.trialDays} days free`, "Run a real term's work before you pay anything. No card needed."],
                ["Grace period, never data loss", "If a payment is late, your portal becomes read-only. Nothing is deleted."],
                [`SMS at ₦${SITE.smsUnitNaira} per unit`, "Bought into your school's own wallet, so you only pay for what you send."],
              ].map(([t, d]) => (
                <div key={t}>
                  <div className="font-display text-[22px] text-[var(--lp-saffron)]">{t}</div>
                  <div className="mt-1 text-[14.5px] text-white/75">{d}</div>
                </div>
              ))}
            </div>
            <CTA href="/signup" variant="light">Start your free trial <Arrow /></CTA>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = FAQS;
  return (
    <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32">
      <div className="text-center">
        <Eyebrow>Questions</Eyebrow>
        <h2 className="font-display text-[38px] font-medium leading-[1.08] text-[var(--lp-green)] sm:text-[46px]">What owners ask us first.</h2>
      </div>
      <div className="mt-12 divide-y divide-[var(--lp-rule)] border-y border-[var(--lp-rule)]">
        {faqs.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[17px] font-semibold text-[var(--lp-green)] [&::-webkit-details-marker]:hidden">
              {q}
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[var(--lp-rule)] text-[var(--lp-green)] transition group-open:rotate-45 group-open:bg-[var(--lp-green)] group-open:text-white">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M8 3v10M3 8h10" /></svg>
              </span>
            </summary>
            <p className="mt-3 max-w-3xl text-[15.5px] leading-relaxed text-[var(--lp-muted)]">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <div className="lp-grain relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[var(--lp-green)] px-6 py-16 text-center sm:px-12 sm:py-20">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--lp-saffron)]/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-[38px] font-medium leading-[1.06] text-[#fffcf5] sm:text-[54px]">
            Start this term. <span className="italic text-[var(--lp-saffron)]">Publish</span> by the end of it.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-white/75">
            Set up your school in minutes, import your students today, and run a full term&apos;s results and fees before you pay.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <CTA href="/signup" variant="light">Start your free trial <Arrow /></CTA>
            <a href={`mailto:${SITE.contactEmail}?subject=Demo%20request`} className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-[15px] font-semibold text-white transition hover:bg-white/10">
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Product", [["Results", "/#product"], ["Fees", "/#product"], ["Parents", "/#parents"], ["Pricing", "/#pricing"]]],
    ["Get started", [["Start free trial", "/signup"], ["Log in", "/login"], ["How it works", "/#how"], ["FAQ", "/#faq"]]],
    ["Company", [["Contact", `mailto:${SITE.contactEmail}`], ["Privacy notice", "/legal/privacy"], ["Data processing agreement", "/legal/dpa"], ["Terms", "/legal/terms"]]],
  ];
  return (
    <footer className="border-t border-[var(--lp-rule)] bg-[var(--lp-card)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--lp-muted)]">{SITE.tagline}. Report cards, fees and parent communication for private nursery, primary and secondary schools.</p>
          <p className="mt-4 text-[14px] text-[var(--lp-muted)]">
            <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-[var(--lp-green)] hover:underline">{SITE.contactEmail}</a>
            {SITE.whatsapp && <> · <a href={`https://wa.me/${SITE.whatsapp}`} className="font-medium text-[var(--lp-green)] hover:underline">WhatsApp</a></>}
          </p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-ink)]">{title}</div>
            <ul className="mt-4 space-y-2.5 text-[14px] text-[var(--lp-muted)]">
              {links.map(([l, h]) => <li key={l}><a href={h} className="transition hover:text-[var(--lp-green)]">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[var(--lp-rule)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-[13px] text-[var(--lp-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} {SITE.name}. Made in Nigeria, for Nigerian schools.</span>
          <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span>Payments secured by Paystack</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span>Data handled under the Nigeria Data Protection Act 2023</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="lp min-h-screen overflow-x-clip">
      <a href="#product" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <Header />
      <main>
        <Hero />
        <Strip />
        <TwoJobs />
        <Features />
        <HowItWorks />
        <Parents />
        <Trust />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
