"use client";

import { useState } from "react";

import { ActionDialog, Badge, Button, Card, Empty, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";

const SessionsDocument = graphql(`
  query PromotionSessions { sessions { id name startDate isCurrent } schoolSettings { promotionPassMark } }
`);
const PreviewDocument = graphql(`
  query PromotionPreview($from: ID!, $to: ID!, $passMark: Float) {
    promotionPreview(fromSessionId: $from, toSessionId: $to, passMark: $passMark) {
      arm { id label } movesTo
      rows { student { id fullName admissionNumber } average suggestion }
    }
  }
`);
const PromoteDocument = graphql(`
  mutation PromoteSchool($from: ID!, $to: ID!, $decisions: [PromotionDecision!]!, $passMark: Float) {
    promoteSchool(fromSessionId: $from, toSessionId: $to, decisions: $decisions, passMark: $passMark) { promoted repeated graduated }
  }
`);

type Decision = "promote" | "repeat" | "graduate";
const LABEL: Record<Decision, string> = { promote: "Promote", repeat: "Repeat", graduate: "Graduate" };

/** End of session: review every class's students with their year average, adjust, then promote the whole school. */
export default function PromotionPage() {
  const sessions = useGql(SessionsDocument, {});
  const list = sessions.data?.sessions ?? [];
  const current = list.find((s) => s.isCurrent) ?? list[0];
  const [chosen, setChosen] = useState<{ from?: string; to?: string; mark?: string }>({});
  const from = chosen.from ?? current?.id ?? "";
  const fromStart = list.find((s) => s.id === from)?.startDate ?? "";
  // The next session by start date is the obvious one to move into.
  const next = [...list].filter((s) => s.startDate > fromStart).sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const to = chosen.to ?? next?.id ?? "";
  const mark = chosen.mark ?? String(sessions.data?.schoolSettings.promotionPassMark ?? 40);
  const passMark = mark.trim() === "" || Number.isNaN(Number(mark)) ? null : Number(mark);
  const preview = useGql(PreviewDocument, from && to && from !== to ? { from, to, passMark } : null);
  const classes = preview.data?.promotionPreview ?? [];
  const [decisions, setDecisions] = useDerivedState(
    preview.data?.promotionPreview,
    (cls) => Object.fromEntries(cls.flatMap((c) => c.rows.map((r) => [r.student.id, r.suggestion as Decision]))),
    {} as Record<string, Decision>,
  );
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (sessions.isLoading) return <Loading />;
  if (sessions.error) return <ErrorNote error={sessions.error} />;

  const counts = Object.values(decisions).reduce((n, d) => ({ ...n, [d]: (n[d] ?? 0) + 1 }), {} as Record<string, number>);
  const total = Object.keys(decisions).length;
  const fromName = list.find((s) => s.id === from)?.name;
  const toName = list.find((s) => s.id === to)?.name;

  return (
    <>
      <PageHeader back={{ href: "/settings/academics", label: "Academic setup" }} title="End-of-session promotion"
        subtitle="Review every class, adjust who repeats, then move the whole school into the new session." />
      {done && <Notice tone="success" title="Promotion complete">{done}</Notice>}
      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="From session">
            <Select value={from} onChange={(e) => setChosen({ ...chosen, from: e.target.value, to: undefined })}>
              {list.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Into session">
            <Select value={to} onChange={(e) => setChosen({ ...chosen, to: e.target.value })}>
              <option value="">Select</option>
              {list.filter((s) => s.id !== from).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Pass mark (year average)" hint="Students below it are suggested to repeat.">
            <Input inputMode="decimal" value={mark} onChange={(e) => setChosen({ ...chosen, mark: e.target.value })} className="tabular-nums" />
          </Field>
        </div>
      </Card>

      {!to ? (
        <Notice tone="warning" title="Create the next session first">Add the new session and its terms under Academic setup, then come back here.</Notice>
      ) : preview.isLoading ? (
        <Loading />
      ) : preview.error ? (
        <ErrorNote error={preview.error} />
      ) : !classes.length ? (
        <Card><Empty title={`Everyone has moved into ${toName}`}>No student from {fromName} is waiting to be promoted.</Empty></Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge tone="good">{counts.promote ?? 0} promote</Badge>
              <Badge tone="warn">{counts.repeat ?? 0} repeat</Badge>
              <Badge tone="brand">{counts.graduate ?? 0} graduate</Badge>
            </div>
            <Button onClick={() => setConfirming(true)}>Promote all {total} students</Button>
          </div>
          {classes.map((c) => (
            <Card key={c.arm.id} flush title={`${c.arm.label} → ${c.movesTo ?? "graduates"}`} description={`${c.rows.length} student${c.rows.length === 1 ? "" : "s"}`}>
              <Table>
                <thead><tr><TH>Student</TH><TH align="right">Year average</TH><TH>Decision</TH></tr></thead>
                <tbody>
                  {c.rows.map((r) => {
                    const d = decisions[r.student.id] ?? (r.suggestion as Decision);
                    return (
                      <tr key={r.student.id} className={d === "repeat" ? "bg-amber-50/60 dark:bg-amber-950/20" : undefined}>
                        <TD><div className="font-medium">{r.student.fullName}</div><div className="text-xs text-muted">{r.student.admissionNumber}</div></TD>
                        <TD align="right" className="tabular-nums">{r.average != null ? Number(r.average).toFixed(1) : <span className="text-muted">No results</span>}</TD>
                        <TD>
                          <Select value={d} onChange={(e) => setDecisions({ ...decisions, [r.student.id]: e.target.value as Decision })} className="w-40" aria-label={`Decision for ${r.student.fullName}`}>
                            {(c.movesTo ? ["promote", "repeat", "graduate"] : ["graduate", "repeat"]).map((o) => <option key={o} value={o}>{LABEL[o as Decision]}</option>)}
                          </Select>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          ))}
        </>
      )}

      <ActionDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Move the school into ${toName}?`}
        description={`${counts.promote ?? 0} promoted, ${counts.repeat ?? 0} repeating and ${counts.graduate ?? 0} graduating. Graduates leave the active student list. This cannot be undone in one step.`}
        confirmLabel="Promote all"
        onConfirm={async () => {
          const { promoteSchool: r } = await gql(PromoteDocument, {
            from, to, passMark,
            decisions: Object.entries(decisions).map(([studentId, decision]) => ({ studentId, decision })),
          });
          setDone(`${r.promoted} promoted, ${r.repeated} repeating and ${r.graduated} graduated into ${toName}. Generate the new term's fee bills when you are ready.`);
          await Promise.all([preview.mutate(), sessions.mutate()]);
        }}
      />
    </>
  );
}
