"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";

import { ActionDialog, Button, Card, Dialog, ErrorNote, Field, FormActions, Input, Loading, Notice, PageHeader, StatusBadge, Tabs, Textarea, cx } from "@/components/ui";
import { IconCheck, IconExternal, IconFile, IconLock, IconSend, IconUnlock } from "@/components/icons";
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
  const readOnly = locked && !canPrincipal;

  async function save() {
    setBusy(true);
    setErr(null);
    setMsg(null);
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
    <div className="space-y-4">
      {readOnly && <Notice tone="warning" title="Results are locked">Only the principal can change comments now.</Notice>}
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card
        flush
        title="Report card comments"
        description="Suggestions are based on each student's average. Edit them freely."
        actions={!readOnly && <Button size="sm" variant="secondary" onClick={fillSuggestions}>Fill empty with suggestions</Button>}
      >
        {students.map((s) => (
          <div key={s.id} className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[200px_1fr]">
            <div>
              <div className="text-sm font-medium text-ink">{s.fullName}</div>
              <div className="text-[13px] text-muted">Average {s.average ?? "–"}</div>
            </div>
            <div className="space-y-2">
              <Textarea rows={2} disabled={readOnly} placeholder={byId[s.id]?.suggestedClassTeacherComment} value={draft[s.id]?.ct ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { ...(d[s.id] ?? { p: "" }), ct: e.target.value } }))} aria-label={`Class teacher comment for ${s.fullName}`} />
              {canPrincipal && (
                <Textarea rows={1} placeholder={`Principal: ${byId[s.id]?.suggestedPrincipalComment ?? ""}`} value={draft[s.id]?.p ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [s.id]: { ...(d[s.id] ?? { ct: "" }), p: e.target.value } }))} aria-label={`Principal comment for ${s.fullName}`} />
              )}
            </div>
          </div>
        ))}
      </Card>
      <FormActions><Button busy={busy} onClick={save} disabled={readOnly}>Save comments</Button></FormActions>
    </div>
  );
}

const RATING_LABELS: Record<number, string> = { 5: "Excellent", 4: "Very good", 3: "Good", 2: "Fair", 1: "Poor" };

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
    setMsg(null);
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
    <div className="space-y-4">
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}
      <Card flush title="Behaviour and skills" description={Object.entries(RATING_LABELS).reverse().map(([n, l]) => `${n} ${l}`).join(" · ")}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle/60 text-xs text-muted">
                <th className="sticky left-0 z-10 bg-subtle px-5 py-2.5 text-left font-medium">Student</th>
                {traits.map((t) => <th key={t.id} className="px-2 py-2.5 text-center font-medium">{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-b-0">
                  <td className="sticky left-0 z-10 max-w-[11rem] truncate bg-surface px-5 py-2 font-medium text-ink">{s.fullName}</td>
                  {traits.map((t) => (
                    <td key={t.id} className="px-1.5 py-1.5 text-center">
                      <select
                        className="h-9 w-14 appearance-none rounded-md border border-line-strong bg-surface text-center text-sm tabular-nums text-ink shadow-sm outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/15"
                        aria-label={`${t.name} for ${s.fullName}`}
                        value={ratings[`${s.id}:${t.id}`] ?? ""}
                        onChange={(e) => setRatings((r) => ({ ...r, [`${s.id}:${t.id}`]: Number(e.target.value) }))}
                      >
                        <option value="">–</option>
                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <FormActions><Button busy={busy} onClick={save}>Save ratings</Button></FormActions>
    </div>
  );
}

const STEPS = [
  { key: "draft", label: "Scores in progress", text: "Teachers enter scores and comments." },
  { key: "approved", label: "Approved and locked", text: "Scores can only change with your permission." },
  { key: "published", label: "Published", text: "Parents can see results and report cards." },
];

function Workflow({ status, missing, children }: { status: string; missing: number; children: ReactNode }) {
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <Card title="Approval" description={missing ? `${missing} missing score${missing === 1 ? "" : "s"} in this class` : "Every score has been entered"}>
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.key} className="flex gap-3">
              <span className={cx("mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full text-xs font-semibold",
                done ? "bg-brand text-white" : active ? "bg-brand/10 text-brand-ink ring-2 ring-brand" : "bg-subtle text-muted ring-1 ring-line")}>
                {done ? <IconCheck size={13} strokeWidth={2.4} /> : i + 1}
              </span>
              <div>
                <div className={cx("text-sm font-medium", active || done ? "text-ink" : "text-muted")}>{s.label}</div>
                <div className="text-[13px] text-muted">{s.text}</div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">{children}</div>
    </Card>
  );
}

type Tab = "broadsheet" | "comments" | "ratings";

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
  const [dialog, setDialog] = useState<null | "unlock" | "publish" | "approve">(null);
  const [publishAt, setPublishAt] = useState("");

  if (!termId) return <Notice tone="warning" title="No current term">Ask the school admin to set the current term.</Notice>;
  if (isLoading) return <Loading label="Computing results" />;
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
  const missingTotal = b.missing.reduce((n, m) => n + m.students, 0);

  return (
    <>
      <PageHeader
        back={{ href: "/results", label: "Results" }}
        title={`${b.armLabel} results`}
        subtitle={<><span>{b.classSize} students</span><span aria-hidden>·</span><span>Class average {b.classAverage ?? "–"}</span><StatusBadge status={b.status} /></>}
      />
      {b.missing.length > 0 && (
        <Notice tone="warning" title="Some scores are missing">
          {b.missing.map((m) => `${m.subject} (${m.students} student${m.students === 1 ? "" : "s"})`).join(", ")}
        </Notice>
      )}
      <ErrorNote error={actionErr} />
      {actionMsg && <Notice tone="success">{actionMsg}</Notice>}

      {(can("results.approve") || can("results.publish")) && (
        <Workflow status={b.status} missing={missingTotal}>
          {can("results.approve") && b.status === "draft" && (
            <Button icon={<IconLock size={15} />} busy={busy === "approve"} onClick={() => (missingTotal ? setDialog("approve") : act("approve", () => gql(ApproveDocument, { armId, termId }), "Results approved and locked."))}>
              Approve and lock
            </Button>
          )}
          {can("results.publish") && b.status === "approved" && (
            <Button icon={<IconSend size={15} />} onClick={() => setDialog("publish")}>Publish to parents</Button>
          )}
          {can("results.approve") && locked && (
            <Button variant="secondary" icon={<IconUnlock size={15} />} onClick={() => setDialog("unlock")}>Unlock</Button>
          )}
          {can("results.publish") && (
            <Button variant="secondary" icon={<IconFile size={15} />} busy={busy === "pdf"}
              onClick={() => act("pdf", () => gql(GenerateDocument, { armId, termId }), "Report cards are being generated for the whole class. They will be ready in a minute.")}>
              Generate report cards
            </Button>
          )}
        </Workflow>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: "broadsheet", label: "Broadsheet" },
          { key: "comments", label: "Comments" },
          { key: "ratings", label: "Behaviour and skills" },
        ]}
      />

      {tab === "broadsheet" && (
        <Card flush>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-subtle/60 text-xs text-muted">
                  <th className="sticky left-0 z-10 bg-subtle px-5 py-2.5 text-left font-medium">Student</th>
                  {b.subjects.map((s) => (
                    <th key={s.id} className="px-2 py-2.5 text-center font-medium" title={s.name}>
                      <span className="block max-w-[5.5rem] truncate">{s.name}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-right font-medium">Total</th>
                  <th className="px-3 py-2.5 text-right font-medium">Average</th>
                  {b.showPosition && <th className="px-3 py-2.5 text-right font-medium">Position</th>}
                  {b.isThirdTerm && <><th className="px-3 py-2.5 text-right font-medium">Session avg.</th>{b.showPosition && <th className="px-3 py-2.5 text-right font-medium">Session pos.</th>}</>}
                  <th className="px-5 py-2.5 text-right font-medium">Report</th>
                </tr>
              </thead>
              <tbody>
                {b.students.map((r) => {
                  const bySubject = Object.fromEntries(r.subjects.map((s) => [s.subjectId, s]));
                  return (
                    <tr key={r.student.id} className="border-b border-line last:border-b-0 hover:bg-subtle/40">
                      <td className="sticky left-0 z-10 max-w-[12rem] bg-surface px-5 py-2.5">
                        <div className="truncate font-medium text-ink">{r.student.fullName}</div>
                      </td>
                      {b.subjects.map((s) => {
                        const cell = bySubject[s.id];
                        return (
                          <td key={s.id} className={cx("px-2 text-center tabular-nums", !cell && "bg-subtle/60", cell && !cell.total && "bg-amber-50 dark:bg-amber-950/30")}>
                            {cell ? (cell.total ? <>{Number(cell.total)}<span className="ml-1 text-[11px] text-muted">{cell.grade}</span></> : <span className="text-amber-700 dark:text-amber-300" title="Missing scores">–</span>) : ""}
                          </td>
                        );
                      })}
                      <td className="px-3 text-right font-semibold tabular-nums text-ink">{Number(r.total)}</td>
                      <td className="px-3 text-right tabular-nums">{r.average ?? "–"}</td>
                      {b.showPosition && <td className="px-3 text-right tabular-nums">{ordinal(r.position)}</td>}
                      {b.isThirdTerm && <><td className="px-3 text-right tabular-nums">{r.cumulativeAverage ?? "–"}</td>{b.showPosition && <td className="px-3 text-right">{ordinal(r.cumulativePosition)}</td>}</>}
                      <td className="px-5 text-right">
                        <a className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-ink hover:underline" target="_blank" rel="noreferrer" href={`/files/report-card/${r.student.id}/${termId}/`}>
                          View <IconExternal size={13} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {tab === "comments" && <Comments armId={armId} termId={termId} students={students} canPrincipal={can("results.approve")} locked={locked} />}
      {tab === "ratings" && <Ratings armId={armId} termId={termId} students={students} />}

      <ActionDialog
        open={dialog === "approve"}
        onClose={() => setDialog(null)}
        title="Approve with missing scores?"
        description={`${missingTotal} score${missingTotal === 1 ? " is" : "s are"} still missing. Those subjects will show without a total on the report card. You can unlock later to correct them.`}
        confirmLabel="Approve anyway"
        onConfirm={() => act("approve", () => gql(ApproveDocument, { armId, termId }), "Results approved and locked.")}
      />
      <ActionDialog
        open={dialog === "unlock"}
        onClose={() => setDialog(null)}
        title={`Unlock ${b.armLabel}?`}
        description="Teachers will be able to change scores again. Results are withdrawn from parents until you publish again."
        confirmLabel="Unlock results"
        tone="danger"
        input={{ label: "Reason", placeholder: "e.g. Mathematics CA2 needs correcting", hint: "Recorded in the audit log." }}
        onConfirm={(reason) => act("unlock", () => gql(UnlockDocument, { armId, termId, reason }), "Results unlocked.")}
      />
      <Dialog
        open={dialog === "publish"}
        onClose={() => setDialog(null)}
        title={`Publish ${b.armLabel} results`}
        description="Parents receive an SMS and can view and download report cards. Parents above your fee threshold see a note to pay first."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              icon={<IconSend size={15} />}
              busy={busy === "publish"}
              onClick={async () => {
                await act("publish", () => gql(PublishDocument, { armId, termId, publishAt: publishAt ? new Date(publishAt).toISOString() : null, notify: true }),
                  publishAt ? "Scheduled. Parents will be notified at the release time." : "Published. Parents are being notified by SMS.");
                setDialog(null);
              }}
            >
              {publishAt ? "Schedule release" : "Publish now"}
            </Button>
          </>
        }
      >
        <Field label="Release date and time" optional hint="Leave empty to release immediately.">
          <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
        </Field>
      </Dialog>
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
