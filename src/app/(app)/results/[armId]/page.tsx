"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Textarea, cx, statusTone } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { ordinal } from "@/lib/money";
import { useSession } from "@/lib/session";

const BroadsheetDocument = graphql(`
  query Broadsheet($armId: ID!, $termId: ID!) {
    broadsheet(armId: $armId, termId: $termId) {
      armLabel status classSize classAverage isThirdTerm showPosition
      subjects { id name }
      missing { subject students }
      students {
        student { id fullName admissionNumber }
        total average position cumulativeAverage cumulativePosition missingSubjects
        subjects { subjectId total grade }
      }
    }
  }
`);

const ReportInputsDocument = graphql(`
  query ClassReportInputs($armId: ID!, $termId: ID!) {
    classReportInputs(armId: $armId, termId: $termId) {
      traits { id name kind }
      ratings { studentId traitId rating }
      comments { studentId classTeacherComment principalComment suggestedClassTeacherComment suggestedPrincipalComment }
    }
  }
`);

const SaveCommentsDocument = graphql(`
  mutation SaveReportComments($armId: ID!, $termId: ID!, $comments: [CommentInput!]!) {
    saveReportComments(armId: $armId, termId: $termId, comments: $comments)
  }
`);

const SaveRatingsDocument = graphql(`
  mutation SaveTraitRatings($armId: ID!, $termId: ID!, $ratings: [RatingInput!]!) {
    saveTraitRatings(armId: $armId, termId: $termId, ratings: $ratings)
  }
`);

const ApproveDocument = graphql(`mutation ApproveResults($armId: ID!, $termId: ID!) { approveResults(armId: $armId, termId: $termId) }`);
const UnlockDocument = graphql(`mutation UnlockResults($armId: ID!, $termId: ID!, $reason: String!) { unlockResults(armId: $armId, termId: $termId, reason: $reason) }`);
const PublishDocument = graphql(`
  mutation PublishResults($armId: ID!, $termId: ID!, $publishAt: DateTime, $notify: Boolean!) {
    publishResults(armId: $armId, termId: $termId, publishAt: $publishAt, notifyParents: $notify)
  }
`);
const GenerateDocument = graphql(`mutation GenerateReportCards($armId: ID!, $termId: ID!) { generateReportCards(armId: $armId, termId: $termId) }`);

type Tab = "broadsheet" | "comments" | "ratings";

function Comments({ armId, termId, students, canPrincipal, locked }: { armId: string; termId: string; students: { id: string; fullName: string; average: string | null }[]; canPrincipal: boolean; locked: boolean }) {
  const { data, mutate } = useGql(ReportInputsDocument, { armId, termId });
  const [draft, setDraft] = useDerivedState(
    data,
    (d) => Object.fromEntries(d.classReportInputs.comments.map((c) => [c.studentId, { ct: c.classTeacherComment, p: c.principalComment }])),
    {} as Record<string, { ct: string; p: string }>,
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!data) return <Loading />;
  const byId = Object.fromEntries(data.classReportInputs.comments.map((c) => [c.studentId, c]));

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      await gql(SaveCommentsDocument, {
        armId, termId,
        comments: Object.entries(draft).map(([studentId, d]) => ({ studentId, classTeacherComment: d.ct, ...(canPrincipal ? { principalComment: d.p } : {}) })),
      });
      setMsg("Comments saved.");
      void mutate();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function fillSuggestions() {
    setDraft((d) => Object.fromEntries(students.map((s) => {
      const current = d[s.id] ?? { ct: "", p: "" };
      return [s.id, { ct: current.ct || byId[s.id]?.suggestedClassTeacherComment || "", p: current.p || (canPrincipal ? byId[s.id]?.suggestedPrincipalComment || "" : current.p) }];
    })));
  }

  return (
    <div className="space-y-3">
      {locked && !canPrincipal && <Notice tone="warning">Results are locked. Only the principal can change comments now.</Notice>}
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Button variant="secondary" onClick={fillSuggestions}>Fill empty comments with suggestions</Button>
      <ul className="space-y-3">
        {students.map((s) => (
          <li key={s.id} className="rounded-xl border border-line bg-surface p-3">
            <div className="mb-2 flex justify-between text-sm"><span className="font-medium">{s.fullName}</span><span className="text-muted">Average {s.average ?? "–"}</span></div>
            <Textarea rows={2} placeholder={byId[s.id]?.suggestedClassTeacherComment} value={draft[s.id]?.ct ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { ...(d[s.id] ?? { p: "" }), ct: e.target.value } }))} aria-label={`Class teacher comment for ${s.fullName}`} />
            {canPrincipal && (
              <Textarea rows={1} className="mt-2" placeholder={`Principal: ${byId[s.id]?.suggestedPrincipalComment ?? ""}`} value={draft[s.id]?.p ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { ...(d[s.id] ?? { ct: "" }), p: e.target.value } }))} aria-label={`Principal comment for ${s.fullName}`} />
            )}
          </li>
        ))}
      </ul>
      <Button busy={busy} onClick={save} disabled={locked && !canPrincipal}>Save comments</Button>
    </div>
  );
}

function Ratings({ armId, termId, students }: { armId: string; termId: string; students: { id: string; fullName: string }[] }) {
  const { data } = useGql(ReportInputsDocument, { armId, termId });
  const [ratings, setRatings] = useDerivedState(
    data,
    (d) => Object.fromEntries(d.classReportInputs.ratings.map((r) => [`${r.studentId}:${r.traitId}`, r.rating])),
    {} as Record<string, number>,
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!data) return <Loading />;
  const traits = data.classReportInputs.traits;

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      await gql(SaveRatingsDocument, {
        armId, termId,
        ratings: Object.entries(ratings).map(([k, rating]) => {
          const [studentId, traitId] = k.split(":");
          return { studentId, traitId, rating };
        }),
      });
      setMsg("Ratings saved.");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">5 Excellent · 4 Very good · 3 Good · 2 Fair · 1 Poor</p>
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="text-sm">
          <thead className="bg-subtle text-xs text-muted">
            <tr>
              <th className="sticky left-0 bg-subtle px-3 py-2 text-left">Student</th>
              {traits.map((t) => <th key={t.id} className="px-1 py-2 font-medium">{t.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="sticky left-0 max-w-[9rem] truncate bg-surface px-3 py-1 font-medium">{s.fullName}</td>
                {traits.map((t) => (
                  <td key={t.id} className="px-1 py-1">
                    <select className="h-10 rounded-md border border-line bg-surface px-1" aria-label={`${t.name} for ${s.fullName}`}
                      value={ratings[`${s.id}:${t.id}`] ?? ""}
                      onChange={(e) => setRatings((r) => ({ ...r, [`${s.id}:${t.id}`]: Number(e.target.value) }))}>
                      <option value="" />
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button busy={busy} onClick={save}>Save ratings</Button>
    </div>
  );
}

function ClassResults() {
  const { armId } = useParams<{ armId: string }>();
  const params = useSearchParams();
  const { term, can } = useSession();
  const termId = params.get("term") || term?.id || "";
  const { data, error, isLoading, mutate } = useGql(BroadsheetDocument, termId ? { armId, termId } : null);
  const [tab, setTab] = useState<Tab>("broadsheet");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [publishAt, setPublishAt] = useState("");
  const [unlockReason, setUnlockReason] = useState("");

  if (!termId) return <Notice tone="warning">No current term is set.</Notice>;
  if (isLoading) return <Loading label="Computing results…" />;
  if (error) return <ErrorNote error={error} />;
  const b = data?.broadsheet;
  if (!b) return null;

  async function act(name: string, run: () => Promise<unknown>, done: string) {
    setBusy(name);
    setActionErr(null);
    setActionMsg(null);
    try {
      await run();
      setActionMsg(done);
      await mutate();
    } catch (e) {
      setActionErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const locked = b.status !== "draft";
  const students = b.students.map((r) => ({ id: r.student.id, fullName: r.student.fullName, average: r.average }));

  return (
    <>
      <PageHeader
        title={`${b.armLabel} results`}
        subtitle={<>{b.classSize} students · class average {b.classAverage ?? "–"} · <Badge tone={statusTone[b.status]}>{b.status}</Badge></>}
      />
      {b.missing.length > 0 && (
        <Notice tone="warning">
          Missing scores: {b.missing.map((m) => `${m.subject} (${m.students})`).join(", ")}
        </Notice>
      )}
      <ErrorNote error={actionErr} />
      {actionMsg && <Notice tone="success">{actionMsg}</Notice>}

      {(can("results.approve") || can("results.publish")) && (
        <Card title="Approve and publish">
          <div className="flex flex-wrap items-end gap-3">
            {can("results.approve") && b.status === "draft" && (
              <Button busy={busy === "approve"} onClick={() => act("approve", () => gql(ApproveDocument, { armId, termId }), "Results approved and locked. Teachers can no longer change scores.")}>
                Approve and lock
              </Button>
            )}
            {can("results.approve") && locked && (
              <>
                <Field label="Reason to unlock"><Input value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} placeholder="e.g. Maths CA2 corrected" /></Field>
                <Button variant="secondary" disabled={!unlockReason.trim()} busy={busy === "unlock"}
                  onClick={() => act("unlock", () => gql(UnlockDocument, { armId, termId, reason: unlockReason }), "Results unlocked.")}>Unlock</Button>
              </>
            )}
            {can("results.publish") && b.status === "approved" && (
              <>
                <Field label="Release to parents at (optional)"><Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></Field>
                <Button busy={busy === "publish"}
                  onClick={() => act("publish", () => gql(PublishDocument, { armId, termId, publishAt: publishAt ? new Date(publishAt).toISOString() : null, notify: true }), "Published. Parents will get an SMS when results are released.")}>
                  Publish to parents
                </Button>
              </>
            )}
            {can("results.publish") && (
              <Button variant="secondary" busy={busy === "pdf"}
                onClick={() => act("pdf", () => gql(GenerateDocument, { armId, termId }), "Report cards are being generated for the whole class.")}>
                Generate report cards
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="flex gap-1 border-b border-line">
        {(["broadsheet", "comments", "ratings"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("min-h-11 px-4 text-sm font-medium capitalize", tab === t ? "border-b-2 border-brand text-brand" : "text-muted")}>
            {t === "ratings" ? "Behaviour & skills" : t}
          </button>
        ))}
      </div>

      {tab === "broadsheet" && (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="text-sm">
            <thead className="bg-subtle text-xs text-muted">
              <tr>
                <th className="sticky left-0 bg-subtle px-3 py-2 text-left">Student</th>
                {b.subjects.map((s) => <th key={s.id} className="px-2 py-2 font-medium" title={s.name}>{s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name}</th>)}
                <th className="px-2">Total</th><th className="px-2">Avg</th>
                {b.showPosition && <th className="px-2">Pos.</th>}
                {b.isThirdTerm && <><th className="px-2">Session avg</th>{b.showPosition && <th className="px-2">Session pos.</th>}</>}
                <th className="px-2">Card</th>
              </tr>
            </thead>
            <tbody>
              {b.students.map((r) => {
                const bySubject = Object.fromEntries(r.subjects.map((s) => [s.subjectId, s]));
                return (
                  <tr key={r.student.id} className="border-t border-line">
                    <td className="sticky left-0 max-w-[10rem] bg-surface px-3 py-1.5">
                      <div className="truncate font-medium">{r.student.fullName}</div>
                    </td>
                    {b.subjects.map((s) => {
                      const cell = bySubject[s.id];
                      return (
                        <td key={s.id} className={cx("px-2 text-center tabular-nums", !cell && "bg-subtle", cell && !cell.total && "bg-amber-50 dark:bg-amber-950")}>
                          {cell ? cell.total ? <>{Number(cell.total)}<span className="ml-0.5 text-xs text-muted">{cell.grade}</span></> : "?" : ""}
                        </td>
                      );
                    })}
                    <td className="px-2 text-center font-semibold tabular-nums">{Number(r.total)}</td>
                    <td className="px-2 text-center tabular-nums">{r.average ?? "–"}</td>
                    {b.showPosition && <td className="px-2 text-center">{ordinal(r.position)}</td>}
                    {b.isThirdTerm && <><td className="px-2 text-center tabular-nums">{r.cumulativeAverage ?? "–"}</td>{b.showPosition && <td className="px-2 text-center">{ordinal(r.cumulativePosition)}</td>}</>}
                    <td className="px-2 text-center"><a className="text-brand" target="_blank" rel="noreferrer" href={`/files/report-card/${r.student.id}/${termId}/`}>View</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {tab === "comments" && <Comments armId={armId} termId={termId} students={students} canPrincipal={can("results.approve")} locked={locked} />}
      {tab === "ratings" && <Ratings armId={armId} termId={termId} students={students} />}
    </>
  );
}

export default function ClassResultsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ClassResults />
    </Suspense>
  );
}
