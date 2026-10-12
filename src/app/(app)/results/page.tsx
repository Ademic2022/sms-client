"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconAward, IconChevronRight } from "@/components/icons";
import { Badge, Card, Empty, ErrorNote, Loading, PageHeader, RowLink, Select, StatusBadge, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { TermsDocument } from "@/lib/queries";
import { useSession } from "@/lib/session";

const StatusesDocument = graphql(`
  query ClassResultStatuses($termId: ID!) {
    classResultStatuses(termId: $termId) { armId armLabel status publishAt missingCells }
  }
`);

const MyArmsDocument = graphql(`
  query MyResultArms {
    myClasses { classArms { id label } }
  }
`);

export default function ResultsPage() {
  const { term, can } = useSession();
  const router = useRouter();
  const isPrincipal = can("results.approve", "results.publish");
  const terms = useGql(TermsDocument, {});
  const [termId, setTermId] = useState<string>("");
  const selected = termId || term?.id || "";
  const statuses = useGql(StatusesDocument, isPrincipal && selected ? { termId: selected } : null);
  const mine = useGql(MyArmsDocument, isPrincipal ? null : {});
  const rows = statuses.data?.classResultStatuses ?? [];
  const counts = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});

  const termPicker = (
    <Select value={selected} onChange={(e) => setTermId(e.target.value)} aria-label="Term" className="w-auto">
      {terms.data?.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
    </Select>
  );

  return (
    <>
      <PageHeader title="Results" subtitle="Check for missing scores, approve and lock each class, then publish to parents." actions={termPicker} />
      {isPrincipal ? (
        statuses.isLoading ? (
          <Loading label="Computing results for every class" />
        ) : statuses.error ? (
          <ErrorNote error={statuses.error} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[["draft", "In progress"], ["approved", "Approved"], ["published", "Published"]].map(([k, label]) => (
                <div key={k} className="rounded-xl border border-line bg-surface px-5 py-4 shadow-sm">
                  <div className="text-[13px] text-muted">{label}</div>
                  <div className="mt-1 font-display text-2xl font-medium tabular-nums text-ink">{counts[k] ?? 0}<span className="ml-1 text-sm font-normal text-muted">of {rows.length}</span></div>
                </div>
              ))}
            </div>
            <Card flush>
              <Table>
                <thead>
                  <tr><TH>Class</TH><TH>Missing scores</TH><TH>Status</TH><TH>Release</TH><TH /></tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.armId} className="cursor-pointer transition hover:bg-subtle/60" onClick={() => router.push(`/results/${r.armId}?term=${selected}`)}>
                      <TD className="font-medium">{r.armLabel}</TD>
                      <TD>{r.missingCells ? <Badge tone="warn">{r.missingCells} missing</Badge> : <Badge tone="good">Complete</Badge>}</TD>
                      <TD><StatusBadge status={r.status} /></TD>
                      <TD className="text-muted">{r.publishAt ? new Date(r.publishAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "–"}</TD>
                      <TD align="right"><IconChevronRight size={16} className="inline text-muted" /></TD>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </>
        )
      ) : mine.data?.myClasses.classArms.length ? (
        <Card title="My class" flush>
          {mine.data.myClasses.classArms.map((a) => (
            <RowLink key={a.id} href={`/results/${a.id}?term=${selected}`} title={a.label} meta="Broadsheet, comments, behaviour and skills" />
          ))}
        </Card>
      ) : (
        !mine.isLoading && (
          <Empty title="No class assigned" icon={<IconAward size={18} />}>Class results are managed by each class&apos;s class teacher and the principal.</Empty>
        )
      )}
    </>
  );
}
