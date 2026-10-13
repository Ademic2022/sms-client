import Link from "next/link";

import { Footer, Header } from "@/components/landing/Landing";
import type { Block, LegalDoc } from "@/content/legal";
import { LEGAL } from "@/lib/site";

const OTHERS: [LegalDoc["slug"], string][] = [
  ["privacy", "Privacy notice"],
  ["dpa", "Data processing agreement"],
  ["terms", "Terms of service"],
];

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("list" in block) {
    return (
      <ul className="list-disc space-y-2 pl-5 marker:text-[var(--lp-muted)]">
        {block.list.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  const { head, rows } = block.table;
  const hasHead = head.some(Boolean);
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--lp-rule)]">
      <table className="w-full min-w-[520px] border-collapse text-left text-[14px]">
        {hasHead && (
          <thead className="bg-[var(--lp-card)]">
            <tr>{head.map((h) => <th key={h} scope="col" className="border-b border-[var(--lp-rule)] px-4 py-2.5 font-semibold text-[var(--lp-ink)]">{h}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-b border-[var(--lp-rule)] align-top last:border-b-0">
              {row.map((cell, i) => (
                <td key={i} className={`px-4 py-2.5 ${i === 0 ? "font-medium text-[var(--lp-ink)]" : ""} ${!hasHead && i === 0 ? "w-40" : ""}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A legal document in the marketing site's style, with a summary and a table of contents. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="lp min-h-screen">
      <div className="print:hidden"><Header /></div>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 lg:pt-16">
        <nav aria-label="Legal documents" className="mb-8 flex flex-wrap gap-2 print:hidden">
          {OTHERS.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/legal/${slug}`}
              aria-current={slug === doc.slug ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${slug === doc.slug ? "border-[var(--lp-green)] bg-[var(--lp-green)] text-[#fffcf5]" : "border-[var(--lp-rule)] text-[var(--lp-muted)] hover:text-[var(--lp-green)]"}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <h1 className="font-display text-[40px] font-medium leading-[1.08] tracking-[-0.015em] text-[var(--lp-green)] sm:text-[52px]">{doc.title}</h1>
        <p className="mt-3 text-[15px] text-[var(--lp-muted)]">
          Effective {LEGAL.effective}{doc.version && <> · Version {doc.version}</>}
        </p>

        <section aria-label="In short" className="mt-8 rounded-2xl border border-[var(--lp-rule)] bg-[var(--lp-card)] p-6 sm:p-8">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-clay)]">In short</h2>
          <ul className="mt-4 space-y-3 text-[16px] leading-relaxed text-[var(--lp-ink)]">
            {doc.summary.map((s) => (
              <li key={s} className="flex gap-3">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-[var(--lp-saffron)]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Contents" className="print:hidden lg:sticky lg:top-24 lg:self-start">
            <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-ink)]">Contents</div>
            <ol className="mt-3 space-y-2 text-[14px] text-[var(--lp-muted)]">
              {doc.sections.map((s) => (
                <li key={s.id}><a href={`#${s.id}`} className="transition hover:text-[var(--lp-green)]">{s.heading.replace(/^\d+\.\s*/, "")}</a></li>
              ))}
            </ol>
          </nav>
          <article className="min-w-0 max-w-3xl space-y-10 text-[16px] leading-[1.7] text-[var(--lp-ink)]">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
                <h2 className="font-display text-[24px] font-medium leading-tight text-[var(--lp-green)]">{s.heading}</h2>
                {s.blocks.map((b, i) => <BlockView key={i} block={b} />)}
              </section>
            ))}
            <p className="border-t border-[var(--lp-rule)] pt-6 text-[14px] text-[var(--lp-muted)]">
              Questions about this document? Email <a href={`mailto:${LEGAL.email}`} className="font-medium text-[var(--lp-green)] hover:underline">{LEGAL.email}</a>.
            </p>
          </article>
        </div>
      </main>
      <div className="print:hidden"><Footer /></div>
    </div>
  );
}
