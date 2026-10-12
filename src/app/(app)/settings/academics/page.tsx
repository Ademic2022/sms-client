"use client";

import { Fragment, useState } from "react";

import { IconChevronRight, IconClose, IconPlus } from "@/components/icons";
import { GradingScaleDialog, LevelDialog, LevelSubjectsDialog, SECTIONS, type LevelForm, type ScaleForm } from "@/components/setup/AcademicDialogs";
import { SettingsNav } from "@/components/SettingsNav";
import { Badge, Button, Card, Dialog, ErrorNote, Field, IconButton, Input, Loading, Notice, PageHeader, Select, Table, TD, TH, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useSession } from "@/lib/session";

const AcademicSetupDocument = graphql(`
  query AcademicSetup {
    sessions { id name startDate endDate isCurrent }
    terms { id number label startDate endDate daysOpened nextTermBegins isCurrent session { id } }
    levels {
      id name section order hasSubjectSelection reportTemplate
      gradingScale { id name }
      nextLevel { id name }
      arms { id name label studentCount classTeacher { id user { fullName } } }
      components { id name maxScore }
      levelSubjects { category subject { id name } }
    }
    staff { id user { fullName } }
    gradingScales { id name bands { grade minScore maxScore remark } }
    subjects { id name }
  }
`);

const SaveSessionDocument = graphql(`mutation SaveSession($name: String!, $startDate: Date!, $endDate: Date!) { saveSession(name: $name, startDate: $startDate, endDate: $endDate) { id } }`);
const SaveTermDocument = graphql(`
  mutation SaveTerm($id: ID, $sessionId: ID!, $number: Int!, $startDate: Date!, $endDate: Date!, $daysOpened: Int!, $nextTermBegins: Date) {
    saveTerm(id: $id, sessionId: $sessionId, number: $number, startDate: $startDate, endDate: $endDate, daysOpened: $daysOpened, nextTermBegins: $nextTermBegins) { id }
  }
`);
const SetCurrentTermDocument = graphql(`mutation SetCurrentTerm($termId: ID!) { setCurrentTerm(termId: $termId) { id } }`);
const SaveArmDocument = graphql(`mutation SaveArm($id: ID, $levelId: ID!, $name: String!, $classTeacherId: ID) { saveArm(id: $id, levelId: $levelId, name: $name, classTeacherId: $classTeacherId) { id } }`);
const SetComponentsDocument = graphql(`
  mutation SetComponents($levelId: ID!, $components: [ComponentInput!]!) { setAssessmentComponents(levelId: $levelId, components: $components) { id } }
`);
const PromoteDocument = graphql(`
  mutation PromoteClass($armId: ID!, $from: ID!, $to: ID!) { promoteClass(armId: $armId, fromSessionId: $from, toSessionId: $to) { promoted repeated graduated } }
`);

function fmt(iso: string | null | undefined) {
  return iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "–";
}

type ComponentRow = { name: string; maxScore: string };

function AssessmentEditor({ levelName, initial, onSave }: { levelName: string; initial: ComponentRow[]; onSave: (rows: ComponentRow[]) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ComponentRow[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = rows.reduce((n, r) => n + (Number(r.maxScore) || 0), 0);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => { setRows(initial); setError(null); setOpen(true); }}>Edit assessment</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Assessment for ${levelName}`}
        description="The score columns teachers fill in. Maximums must add up to 100."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button busy={busy} disabled={total !== 100 || rows.some((r) => !r.name.trim())} onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await onSave(rows.map((r) => ({ name: r.name.trim(), maxScore: r.maxScore })));
                setOpen(false);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}>Save assessment</Button>
          </>
        }
      >
        <div className="space-y-3">
          <ErrorNote error={error} />
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_36px] items-center gap-2">
              <Input value={r.name} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="e.g. CA1" aria-label="Component name" />
              <Input inputMode="numeric" value={r.maxScore} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, maxScore: e.target.value } : x)))} className="text-right tabular-nums" aria-label="Maximum score" />
              <IconButton label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))} disabled={rows.length <= 1}><IconClose size={15} /></IconButton>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost" icon={<IconPlus size={15} />} onClick={() => setRows([...rows, { name: "", maxScore: "" }])}>Add column</Button>
            <span className={cx("text-sm font-medium tabular-nums", total === 100 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600")}>Total {total} / 100</span>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default function AcademicSetupPage() {
  const { refresh } = useSession();
  const { data, error, isLoading, mutate } = useGql(AcademicSetupDocument, {});
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "session" | "term" | "promote">(null);
  const [session, setSession] = useState({ name: "", startDate: "", endDate: "" });
  const [term, setTerm] = useState({ sessionId: "", number: "1", startDate: "", endDate: "", daysOpened: "", nextTermBegins: "" });
  const [newArm, setNewArm] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState({ armId: "", from: "", to: "" });
  const [busy, setBusy] = useState(false);
  const [dialogErr, setDialogErr] = useState<string | null>(null);
  const [levelForm, setLevelForm] = useState<LevelForm | null>(null);
  const [subjectsLevelId, setSubjectsLevelId] = useState<string | null>(null);
  const [scaleForm, setScaleForm] = useState<ScaleForm | null>(null);

  if (isLoading) return <Loading />;
  if (!data) return <ErrorNote error={error} />;

  async function run(fn: () => Promise<unknown>, done: string) {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(done);
      await Promise.all([mutate(), refresh()]);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function runDialog(fn: () => Promise<string>) {
    setBusy(true);
    setDialogErr(null);
    try {
      const done = await fn();
      setMsg(done);
      setDialog(null);
      await Promise.all([mutate(), refresh()]);
    } catch (e) {
      setDialogErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const setup = data;

  function editTerm(t?: (typeof setup.terms)[number]) {
    setDialogErr(null);
    setTerm(t
      ? { sessionId: t.session.id, number: String(t.number), startDate: t.startDate, endDate: t.endDate, daysOpened: String(t.daysOpened), nextTermBegins: t.nextTermBegins ?? "" }
      : { sessionId: setup.sessions[0]?.id ?? "", number: "1", startDate: "", endDate: "", daysOpened: "", nextTermBegins: "" });
    setDialog("term");
  }

  const allArms = data.levels.flatMap((l) => l.arms);

  return (
    <>
      <PageHeader title="Settings" subtitle="Sessions, classes, assessment and promotion." />
      <SettingsNav />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}

      <Card
        flush
        title="Sessions and terms"
        description="Exactly one term is current. Attendance, scores and bills are recorded against it."
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => { setDialogErr(null); setSession({ name: "", startDate: "", endDate: "" }); setDialog("session"); }}>New session</Button>
            <Button size="sm" icon={<IconPlus size={15} />} disabled={!data.sessions.length} onClick={() => editTerm()}>Add term</Button>
          </>
        }
      >
        {data.sessions.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted">No sessions yet. Create this session, then add its three terms.</p>
        ) : (
          <Table>
            <thead><tr><TH>Term</TH><TH>Dates</TH><TH align="right">School days</TH><TH>Next term begins</TH><TH /></tr></thead>
            <tbody>
              {data.sessions.map((s) => (
                <Fragment key={s.id}>
                  <tr className="bg-subtle/50">
                    <TD className="font-semibold" ><span className="flex items-center gap-2">{s.name} session {s.isCurrent && <Badge tone="brand">Current</Badge>}</span></TD>
                    <TD className="text-muted">{fmt(s.startDate)} to {fmt(s.endDate)}</TD>
                    <TD /><TD /><TD />
                  </tr>
                  {data.terms.filter((t) => t.session.id === s.id).map((t) => (
                    <tr key={t.id}>
                      <TD className="pl-8">{t.label.split(",")[0]}</TD>
                      <TD className="text-muted">{fmt(t.startDate)} to {fmt(t.endDate)}</TD>
                      <TD align="right" className="tabular-nums">{t.daysOpened || "–"}</TD>
                      <TD className="text-muted">{fmt(t.nextTermBegins)}</TD>
                      <TD align="right">
                        <div className="flex justify-end gap-2">
                          {t.isCurrent ? <Badge tone="good" dot>Current term</Badge> : (
                            <Button size="sm" variant="ghost" onClick={() => run(() => gql(SetCurrentTermDocument, { termId: t.id }), `${t.label} is now the current term.`)}>Make current</Button>
                          )}
                          <Button size="sm" variant="secondary" onClick={() => editTerm(t)}>Edit</Button>
                        </div>
                      </TD>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card flush title="Classes, assessment and subjects" description="Expand a level to assign class teachers, add arms, and set its subjects and assessment."
        actions={<Button size="sm" variant="secondary" icon={<IconPlus size={15} />} onClick={() => setLevelForm({
          name: "", section: "primary", gradingScaleId: data.gradingScales[0]?.id ?? "", nextLevelId: "", hasSubjectSelection: false, reportTemplate: "",
        })}>Add level</Button>}>
        {data.levels.map((level) => (
          <details key={level.id} className="group border-b border-line last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 hover:bg-subtle/50 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{level.name}</div>
                <div className="truncate text-[13px] text-muted">
                  {level.arms.length} arm{level.arms.length === 1 ? "" : "s"} · {level.components.map((c) => `${c.name} ${Number(c.maxScore)}`).join(", ")} · {level.gradingScale?.name} · then {level.nextLevel?.name ?? "graduates"}
                </div>
              </div>
              <IconChevronRight size={16} className="flex-none text-muted transition group-open:rotate-90" />
            </summary>
            <div className="space-y-5 border-t border-line bg-subtle/30 px-5 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[13px] text-muted">
                  {SECTIONS.find(([k]) => k === level.section)?.[1]} · grading {level.gradingScale?.name ?? "not set"} · report {level.reportTemplate || "school default"}
                </div>
                <Button size="sm" variant="secondary" onClick={() => setLevelForm({
                  id: level.id, name: level.name, section: level.section, gradingScaleId: level.gradingScale?.id ?? "",
                  nextLevelId: level.nextLevel?.id ?? "", hasSubjectSelection: level.hasSubjectSelection, reportTemplate: level.reportTemplate,
                })}>Edit level</Button>
              </div>
              <div className="border-t border-line pt-4">
                <div className="mb-2 text-[13px] font-medium text-ink">Arms and class teachers</div>
                <div className="space-y-2">
                  {level.arms.map((arm) => (
                    <div key={arm.id} className="grid items-center gap-3 sm:grid-cols-[160px_1fr]">
                      <span className="text-sm text-ink">{arm.label} <span className="text-muted">· {arm.studentCount} students</span></span>
                      <Select className="max-w-xs" value={arm.classTeacher?.id ?? ""} aria-label={`Class teacher for ${arm.label}`}
                        onChange={(e) => run(() => gql(SaveArmDocument, { id: arm.id, levelId: level.id, name: arm.name, classTeacherId: e.target.value || null }), `Class teacher for ${arm.label} updated.`)}>
                        <option value="">No class teacher</option>
                        {data.staff.map((m) => <option key={m.id} value={m.id}>{m.user.fullName}</option>)}
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex max-w-sm gap-2">
                  <Input placeholder="New arm, e.g. B or Gold" value={newArm[level.id] ?? ""} onChange={(e) => setNewArm({ ...newArm, [level.id]: e.target.value })} aria-label="New arm name" />
                  <Button variant="secondary" disabled={!newArm[level.id]?.trim()} onClick={() => run(async () => {
                    await gql(SaveArmDocument, { levelId: level.id, name: newArm[level.id].trim() });
                    setNewArm({ ...newArm, [level.id]: "" });
                  }, "Arm added.")}>Add arm</Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <div>
                  <div className="text-[13px] font-medium text-ink">Assessment</div>
                  <div className="text-[13px] text-muted">{level.components.map((c) => `${c.name} (${Number(c.maxScore)})`).join(" + ")}</div>
                </div>
                <AssessmentEditor
                  levelName={level.name}
                  initial={level.components.map((c) => ({ name: c.name, maxScore: String(Number(c.maxScore)) }))}
                  onSave={async (rows) => {
                    await gql(SetComponentsDocument, { levelId: level.id, components: rows });
                    setMsg(`Assessment for ${level.name} saved.`);
                    await mutate();
                  }}
                />
              </div>
              <div className="border-t border-line pt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[13px] font-medium text-ink">{level.levelSubjects.length} subjects{level.hasSubjectSelection && <span className="font-normal text-muted"> · students choose electives individually</span>}</div>
                  <Button size="sm" variant="secondary" onClick={() => setSubjectsLevelId(level.id)}>Edit subjects</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {level.levelSubjects.map((ls) => <Badge key={ls.subject.id}>{ls.subject.name}{ls.category !== "core" && <span className="text-muted/80"> · {ls.category}</span>}</Badge>)}
                </div>
              </div>
            </div>
          </details>
        ))}
      </Card>

      <Card flush title="Grading scales" description="Assign a scale to each level with Edit level. Changes apply to results the next time they are viewed."
        actions={<Button size="sm" variant="secondary" icon={<IconPlus size={15} />} onClick={() => setScaleForm({
          name: "", bands: [{ grade: "A", minScore: "70", remark: "Excellent" }, { grade: "B", minScore: "60", remark: "Very good" }, { grade: "C", minScore: "50", remark: "Good" }, { grade: "F", minScore: "0", remark: "Fail" }],
        })}>New scale</Button>}>
        {data.gradingScales.map((scale) => {
          const usedBy = data.levels.filter((l) => l.gradingScale?.id === scale.id).map((l) => l.name);
          return (
            <div key={scale.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 last:border-b-0">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{scale.name}</div>
                <div className="mt-0.5 text-[13px] text-muted">
                  {scale.bands.map((b) => `${b.grade} ${Math.floor(Number(b.minScore))}–${Math.floor(Number(b.maxScore))}`).join(" · ")}
                </div>
                <div className="mt-0.5 text-xs text-muted">{usedBy.length ? `Used by ${usedBy.join(", ")}` : "Not used by any level"}</div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setScaleForm({
                id: scale.id, name: scale.name,
                bands: scale.bands.map((b) => ({ grade: b.grade, minScore: String(Number(b.minScore)), remark: b.remark })),
              })}>Edit</Button>
            </div>
          );
        })}
      </Card>

      <Card title="End-of-session promotion" description="Moves every active student in a class to the next level. Students in the final level graduate."
        actions={<Button size="sm" variant="secondary" onClick={() => { setDialogErr(null); setDialog("promote"); }}>Promote a class</Button>}>
        <p className="text-sm leading-relaxed text-muted">Run this once the third term&apos;s results are published. Students who should repeat can be moved back afterwards from their profile.</p>
      </Card>

      {levelForm && (
        <LevelDialog open onClose={() => setLevelForm(null)} initial={levelForm} levels={data.levels} scales={data.gradingScales}
          onSaved={(m) => { setMsg(m); void mutate(); }} />
      )}
      <LevelSubjectsDialog open={subjectsLevelId !== null} onClose={() => setSubjectsLevelId(null)}
        level={data.levels.find((l) => l.id === subjectsLevelId) ?? null} allSubjects={data.subjects}
        onSaved={(m) => { setMsg(m); void mutate(); }} />
      {scaleForm && (
        <GradingScaleDialog open onClose={() => setScaleForm(null)} initial={scaleForm} onSaved={(m) => { setMsg(m); void mutate(); }} />
      )}

      <Dialog open={dialog === "session"} onClose={() => setDialog(null)} title="New session" description="A school year, usually September to July."
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button busy={busy} onClick={() => runDialog(async () => { await gql(SaveSessionDocument, session); return `${session.name} session created.`; })}>Create session</Button></>}>
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <Field label="Name"><Input placeholder="2026/2027" value={session.name} onChange={(e) => setSession({ ...session, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Starts"><Input type="date" value={session.startDate} onChange={(e) => setSession({ ...session, startDate: e.target.value })} /></Field>
            <Field label="Ends"><Input type="date" value={session.endDate} onChange={(e) => setSession({ ...session, endDate: e.target.value })} /></Field>
          </div>
        </div>
      </Dialog>

      <Dialog open={dialog === "term"} onClose={() => setDialog(null)} title="Term" description="School days are shown on report cards as days present out of days opened."
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button busy={busy} disabled={!term.sessionId} onClick={() => runDialog(async () => {
          const existing = data.terms.find((t) => t.session.id === term.sessionId && t.number === Number(term.number));
          await gql(SaveTermDocument, {
            id: existing?.id ?? null, sessionId: term.sessionId, number: Number(term.number), startDate: term.startDate, endDate: term.endDate,
            daysOpened: Number(term.daysOpened) || 0, nextTermBegins: term.nextTermBegins || null,
          });
          return existing ? "Term updated." : "Term created.";
        })}>Save term</Button></>}>
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Session">
              <Select value={term.sessionId} onChange={(e) => setTerm({ ...term, sessionId: e.target.value })}>
                {data.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Term">
              <Select value={term.number} onChange={(e) => setTerm({ ...term, number: e.target.value })}>
                <option value="1">First term</option><option value="2">Second term</option><option value="3">Third term</option>
              </Select>
            </Field>
            <Field label="Starts"><Input type="date" value={term.startDate} onChange={(e) => setTerm({ ...term, startDate: e.target.value })} /></Field>
            <Field label="Ends"><Input type="date" value={term.endDate} onChange={(e) => setTerm({ ...term, endDate: e.target.value })} /></Field>
            <Field label="School days"><Input inputMode="numeric" value={term.daysOpened} onChange={(e) => setTerm({ ...term, daysOpened: e.target.value })} placeholder="60" /></Field>
            <Field label="Next term begins" optional><Input type="date" value={term.nextTermBegins} onChange={(e) => setTerm({ ...term, nextTermBegins: e.target.value })} /></Field>
          </div>
        </div>
      </Dialog>

      <Dialog open={dialog === "promote"} onClose={() => setDialog(null)} title="Promote a class" description="Every active student moves to the same arm in the next level. Final-year students graduate."
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button busy={busy} disabled={!promo.armId || !promo.from || !promo.to}
          onClick={() => runDialog(async () => {
            const { promoteClass: r } = await gql(PromoteDocument, { armId: promo.armId, from: promo.from, to: promo.to });
            return `Promotion complete: ${r.promoted} promoted, ${r.repeated} repeating, ${r.graduated} graduated.`;
          })}>Promote class</Button></>}>
        <div className="space-y-4">
          <ErrorNote error={dialogErr} />
          <Field label="Class">
            <Select value={promo.armId} onChange={(e) => setPromo({ ...promo, armId: e.target.value })}>
              <option value="">Select a class</option>
              {allArms.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="From session">
              <Select value={promo.from} onChange={(e) => setPromo({ ...promo, from: e.target.value })}>
                <option value="">Select</option>{data.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
            <Field label="Into session">
              <Select value={promo.to} onChange={(e) => setPromo({ ...promo, to: e.target.value })}>
                <option value="">Select</option>{data.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Dialog>
    </>
  );
}
