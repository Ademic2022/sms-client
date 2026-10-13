import { Fragment, type ReactNode } from "react";

import { Footer, Header } from "@/components/landing/Landing";
import { GUIDE, GUIDE_UPDATED, SUPPORT, type GuideBlock } from "@/content/guide";
import { SITE } from "@/lib/site";

import { PrintButton } from "./PrintButton";

const ROLES: [string, string, string][] = [
  ["administrators", "Owners and admins", "Set up the school, staff, results and fees"],
  ["teachers", "Teachers", "Attendance, scores and report card comments"],
  ["parents", "Parents", "Results, report cards and paying fees"],
];

/** Plain text with **bold** for menu items and buttons. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-semibold text-[var(--lp-ink)]">{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

function BlockView({ block }: { block: GuideBlock }): ReactNode {
  if (typeof block === "string") return <p><Rich text={block} /></p>;
  if ("list" in block) {
    return <ul className="list-disc space-y-2 pl-5 marker:text-[var(--lp-muted)]">{block.list.map((item) => <li key={item}><Rich text={item} /></li>)}</ul>;
  }
  if ("steps" in block) {
    return (
      <ol className="space-y-2.5">
        {block.steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-[var(--lp-green)] text-[12px] font-semibold text-[#fffcf5]">{i + 1}</span>
            <span><Rich text={step} /></span>
          </li>
        ))}
      </ol>
    );
  }
  const { head, rows } = block.table;
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--lp-rule)] print:overflow-visible">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px] print:min-w-0">
        <thead className="bg-[var(--lp-card)]">
          <tr>{head.map((h) => <th key={h} scope="col" className="border-b border-[var(--lp-rule)] px-4 py-2.5 font-semibold text-[var(--lp-ink)]">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-[var(--lp-rule)] align-top last:border-b-0 print:break-inside-avoid">
              {row.map((cell, i) => <td key={i} className={`px-4 py-2.5 ${i === 0 ? "font-medium text-[var(--lp-ink)]" : ""}`}><Rich text={cell} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Support() {
  return (
    <section id="support" aria-label="Support" className="scroll-mt-24 rounded-2xl border border-[var(--lp-rule)] bg-[var(--lp-card)] p-6 sm:p-8 print:break-inside-avoid">
      <h2 className="font-display text-[24px] font-medium leading-tight text-[var(--lp-green)]">10. Support</h2>
      <p className="mt-3">
        For sign-in help, results, fees or a child&apos;s records, contact your school office first. Schools reach {SITE.name} support {SUPPORT.hours}, and we
        respond {SUPPORT.response}.
      </p>
      <ul className="mt-4 space-y-2">
        <li>Email: <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-[var(--lp-green)] hover:underline">{SITE.contactEmail}</a></li>
        {SITE.whatsapp && (
          <li>
            WhatsApp:{" "}
            <a href={`https://wa.me/${SITE.whatsapp}`} className="font-medium text-[var(--lp-green)] hover:underline">
              +{SITE.whatsapp.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4")}
            </a>
          </li>
        )}
      </ul>
    </section>
  );
}

/** The user guide in the marketing site's style, with role shortcuts, contents and a print-to-PDF button. */
export function GuideDocument() {
  return (
    <div className="lp min-h-screen">
      <div className="print:hidden"><Header /></div>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 lg:pt-16 print:max-w-none print:p-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[40px] font-medium leading-[1.08] tracking-[-0.015em] text-[var(--lp-green)] sm:text-[52px]">{SITE.name} user guide</h1>
            <p className="mt-3 text-[15px] text-[var(--lp-muted)]">How owners, admins, bursars, teachers and parents use {SITE.name}. Updated {GUIDE_UPDATED}.</p>
          </div>
          <PrintButton className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-rule)] px-4 py-2 text-[14px] font-medium text-[var(--lp-ink)] transition hover:border-[var(--lp-green)] hover:text-[var(--lp-green)] print:hidden" />
        </div>

        <nav aria-label="Guides by role" className="mt-8 grid gap-3 sm:grid-cols-3 print:hidden">
          {ROLES.map(([id, title, text]) => (
            <a key={id} href={`#${id}`} className="rounded-2xl border border-[var(--lp-rule)] bg-[var(--lp-card)] p-5 transition hover:border-[var(--lp-green)]">
              <div className="font-semibold text-[var(--lp-ink)]">{title}</div>
              <div className="mt-1 text-[14px] text-[var(--lp-muted)]">{text}</div>
            </a>
          ))}
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr] print:block">
          <nav aria-label="Contents" className="print:hidden lg:sticky lg:top-24 lg:self-start">
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-ink)]">Contents</div>
            <ol className="mt-3 space-y-2 text-[14px] text-[var(--lp-muted)]">
              {GUIDE.map((s) => <li key={s.id}><a href={`#${s.id}`} className="transition hover:text-[var(--lp-green)]">{s.heading.replace(/^\d+\.\s*/, "")}</a></li>)}
              <li><a href="#support" className="transition hover:text-[var(--lp-green)]">Support</a></li>
            </ol>
          </nav>
          <article className="min-w-0 max-w-3xl space-y-14 text-[16px] leading-[1.7] text-[var(--lp-ink)]">
            {GUIDE.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 space-y-6">
                <div>
                  <h2 className="font-display text-[28px] font-medium leading-tight text-[var(--lp-green)]">{s.heading}</h2>
                  {s.lead && <p className="mt-2 text-[17px] text-[var(--lp-muted)]">{s.lead}</p>}
                </div>
                {s.parts.map((part, i) => (
                  <div key={part.heading ?? i} className="space-y-3">
                    {part.heading && <h3 className="text-[17px] font-semibold text-[var(--lp-ink)] print:break-after-avoid">{part.heading}</h3>}
                    {part.blocks.map((b, j) => <BlockView key={j} block={b} />)}
                  </div>
                ))}
              </section>
            ))}
            <Support />
          </article>
        </div>
      </main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
