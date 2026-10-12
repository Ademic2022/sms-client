"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge, Card, Empty, ErrorNote, Field, Loading, PageHeader, Select, statusTone } from "@/components/ui";
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
  const isPrincipal = can("results.approve", "results.publish");
  const terms = useGql(TermsDocument, {});
  const [termId, setTermId] = useState<string>("");
  const selected = termId || term?.id || "";
  const statuses = useGql(StatusesDocument, isPrincipal && selected ? { termId: selected } : null);
  const mine = useGql(MyArmsDocument, isPrincipal ? null : {});

  return (
    <>
      <PageHeader title="Results" subtitle="Check missing scores, approve and lock, then publish to parents." />
      <div className="max-w-xs">
        <Field label="Term">
          <Select value={selected} onChange={(e) => setTermId(e.target.value)}>
            {terms.data?.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>
        </Field>
      </div>
      {isPrincipal ? (
        statuses.isLoading ? (
          <Loading label="Computing results for every class…" />
        ) : statuses.error ? (
          <ErrorNote error={statuses.error} />
        ) : (
          <Card>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted">
                <tr><th className="py-2">Class</th><th>Missing scores</th><th>Status</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {statuses.data?.classResultStatuses.map((r) => (
                  <tr key={r.armId}>
                    <td className="py-2.5 font-medium">{r.armLabel}</td>
                    <td>{r.missingCells ? <Badge tone="warn">{r.missingCells}</Badge> : <Badge tone="good">None</Badge>}</td>
                    <td><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                    <td className="text-right"><Link className="text-brand" href={`/results/${r.armId}?term=${selected}`}>Open →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : mine.data?.myClasses.classArms.length ? (
        <Card title="My class">
          <ul className="divide-y divide-line">
            {mine.data.myClasses.classArms.map((a) => (
              <li key={a.id}>
                <Link className="flex min-h-12 items-center justify-between text-sm" href={`/results/${a.id}?term=${selected}`}>
                  <span className="font-medium">{a.label}</span><span className="text-brand">Broadsheet →</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        !mine.isLoading && <Empty>You are not a class teacher.</Empty>
      )}
    </>
  );
}
