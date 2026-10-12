"use client";

import { useState } from "react";

import { Badge, Button, Card, ErrorNote, Field, Input, Loading, Notice, PageHeader, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { useSession } from "@/lib/session";

const AcademicSetupDocument = graphql(`
  query AcademicSetup {
    sessions { id name startDate endDate isCurrent }
    terms { id number label startDate endDate daysOpened nextTermBegins isCurrent session { id } }
    levels {
      id name section hasSubjectSelection
      gradingScale { id name }
      nextLevel { name }
      arms { id name label studentCount classTeacher { id user { fullName } } }
      components { id name maxScore }
      levelSubjects { category subject { id name } }
    }
    staff { id user { fullName } }
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

export default function AcademicSetupPage() {
  const { refresh } = useSession();
  const { data, error, isLoading, mutate } = useGql(AcademicSetupDocument, {});
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [session, setSession] = useState({ name: "", startDate: "", endDate: "" });
  const [term, setTerm] = useState({ sessionId: "", number: "1", startDate: "", endDate: "", daysOpened: "0", nextTermBegins: "" });
  const [components, setComponents] = useState<Record<string, string>>({});
  const [newArm, setNewArm] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState({ armId: "", from: "", to: "" });

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

  return (
    <>
      <PageHeader title="Academic setup" />
      <ErrorNote error={err} />
      {msg && <Notice tone="success">{msg}</Notice>}

      <Card title="Sessions and terms">
        <ul className="mb-4 space-y-3 text-sm">
          {data.sessions.map((s) => (
            <li key={s.id}>
              <div className="font-semibold">{s.name} {s.isCurrent && <Badge tone="brand">current</Badge>}</div>
              <ul className="mt-1 space-y-1">
                {data.terms.filter((t) => t.session.id === s.id).map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-subtle px-3 py-1.5">
                    <span>{t.label}: {t.startDate} to {t.endDate} · {t.daysOpened} school days</span>
                    {t.isCurrent ? <Badge tone="good">current term</Badge> : (
                      <Button variant="ghost" onClick={() => run(() => gql(SetCurrentTermDocument, { termId: t.id }), `${t.label} is now the current term.`)}>Make current</Button>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-4 sm:items-end">
          <Field label="New session"><Input placeholder="2026/2027" value={session.name} onChange={(e) => setSession({ ...session, name: e.target.value })} /></Field>
          <Field label="Starts"><Input type="date" value={session.startDate} onChange={(e) => setSession({ ...session, startDate: e.target.value })} /></Field>
          <Field label="Ends"><Input type="date" value={session.endDate} onChange={(e) => setSession({ ...session, endDate: e.target.value })} /></Field>
          <Button variant="secondary" onClick={() => run(() => gql(SaveSessionDocument, session), "Session created.")}>Add session</Button>
        </div>
        <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-7 lg:items-end">
          <Field label="Session">
            <Select value={term.sessionId} onChange={(e) => setTerm({ ...term, sessionId: e.target.value })}>
              <option value="">Choose…</option>
              {data.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Term">
            <Select value={term.number} onChange={(e) => setTerm({ ...term, number: e.target.value })}>
              <option value="1">First</option><option value="2">Second</option><option value="3">Third</option>
            </Select>
          </Field>
          <Field label="Starts"><Input type="date" value={term.startDate} onChange={(e) => setTerm({ ...term, startDate: e.target.value })} /></Field>
          <Field label="Ends"><Input type="date" value={term.endDate} onChange={(e) => setTerm({ ...term, endDate: e.target.value })} /></Field>
          <Field label="School days"><Input inputMode="numeric" value={term.daysOpened} onChange={(e) => setTerm({ ...term, daysOpened: e.target.value })} /></Field>
          <Field label="Next term begins"><Input type="date" value={term.nextTermBegins} onChange={(e) => setTerm({ ...term, nextTermBegins: e.target.value })} /></Field>
          <Button variant="secondary" disabled={!term.sessionId} onClick={() => {
            const existing = data.terms.find((t) => t.session.id === term.sessionId && t.number === Number(term.number));
            void run(() => gql(SaveTermDocument, {
              id: existing?.id ?? null, sessionId: term.sessionId, number: Number(term.number), startDate: term.startDate, endDate: term.endDate,
              daysOpened: Number(term.daysOpened) || 0, nextTermBegins: term.nextTermBegins || null,
            }), existing ? "Term updated." : "Term created.");
          }}>Save term</Button>
        </div>
      </Card>

      <Card title="Classes, assessment and subjects">
        <div className="space-y-4">
          {data.levels.map((level) => {
            const draft = components[level.id] ?? level.components.map((c) => `${c.name} ${Number(c.maxScore)}`).join(", ");
            return (
              <details key={level.id} className="rounded-lg border border-line p-3">
                <summary className="cursor-pointer">
                  <span className="font-semibold">{level.name}</span>{" "}
                  <span className="text-sm text-muted">· {level.arms.map((a) => a.label).join(", ")} · {level.gradingScale?.name} · next: {level.nextLevel?.name ?? "graduates"}</span>
                </summary>
                <div className="mt-3 space-y-3 text-sm">
                  <div>
                    <div className="mb-1 font-medium">Arms and class teachers</div>
                    {level.arms.map((arm) => (
                      <div key={arm.id} className="flex flex-wrap items-center gap-2 py-1">
                        <span className="w-24">{arm.label} ({arm.studentCount})</span>
                        <Select className="w-auto min-w-48" value={arm.classTeacher?.id ?? ""} onChange={(e) =>
                          run(() => gql(SaveArmDocument, { id: arm.id, levelId: level.id, name: arm.name, classTeacherId: e.target.value || null }), `Class teacher for ${arm.label} updated.`)}>
                          <option value="">No class teacher</option>
                          {data.staff.map((m) => <option key={m.id} value={m.id}>{m.user.fullName}</option>)}
                        </Select>
                      </div>
                    ))}
                    <div className="mt-1 flex gap-2">
                      <Input className="w-32" placeholder="Arm, e.g. B" value={newArm[level.id] ?? ""} onChange={(e) => setNewArm({ ...newArm, [level.id]: e.target.value })} />
                      <Button variant="secondary" disabled={!newArm[level.id]} onClick={() => run(() => gql(SaveArmDocument, { levelId: level.id, name: newArm[level.id] }), "Arm added.")}>Add arm</Button>
                    </div>
                  </div>
                  <div>
                    <Field label="Assessment components (name and maximum, totalling 100)" hint="For example: CA1 20, CA2 20, Exam 60">
                      <div className="flex gap-2">
                        <Input value={draft} onChange={(e) => setComponents({ ...components, [level.id]: e.target.value })} />
                        <Button variant="secondary" onClick={() => {
                          const parsed = draft.split(",").map((part) => part.trim()).filter(Boolean).map((part) => {
                            const m = part.match(/^(.*\S)\s+(\d+(?:\.\d+)?)$/);
                            return m ? { name: m[1], maxScore: m[2] } : null;
                          });
                          if (parsed.some((p) => p === null)) return setErr("Write each component as a name followed by its maximum, e.g. CA1 20.");
                          void run(() => gql(SetComponentsDocument, { levelId: level.id, components: parsed as { name: string; maxScore: string }[] }), `Assessment for ${level.name} saved.`);
                        }}>Save</Button>
                      </div>
                    </Field>
                  </div>
                  <div>
                    <div className="mb-1 font-medium">Subjects{level.hasSubjectSelection && " (students choose electives individually)"}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {level.levelSubjects.map((ls) => <Badge key={ls.subject.id} tone={ls.category === "core" ? "brand" : "neutral"}>{ls.subject.name}{ls.category !== "core" && ` · ${ls.category}`}</Badge>)}
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </Card>

      <Card title="End-of-session promotion">
        <p className="mb-3 text-sm text-muted">Moves every active student in a class to the next level. Students in the final level graduate. Change individual students afterwards from their profile.</p>
        <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <Field label="Class">
            <Select value={promo.armId} onChange={(e) => setPromo({ ...promo, armId: e.target.value })}>
              <option value="">Choose…</option>
              {data.levels.flatMap((l) => l.arms).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </Select>
          </Field>
          <Field label="From session">
            <Select value={promo.from} onChange={(e) => setPromo({ ...promo, from: e.target.value })}>
              <option value="">Choose…</option>{data.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Into session">
            <Select value={promo.to} onChange={(e) => setPromo({ ...promo, to: e.target.value })}>
              <option value="">Choose…</option>{data.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Button disabled={!promo.armId || !promo.from || !promo.to} onClick={() => {
            if (!window.confirm("Promote this whole class now?")) return;
            void run(async () => {
              const { promoteClass: r } = await gql(PromoteDocument, { armId: promo.armId, from: promo.from, to: promo.to });
              setMsg(`Promoted ${r.promoted}, repeated ${r.repeated}, graduated ${r.graduated}.`);
            }, "Promotion complete.");
          }}>Promote</Button>
        </div>
      </Card>
    </>
  );
}
