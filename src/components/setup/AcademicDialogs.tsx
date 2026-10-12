"use client";

import { useState } from "react";

import { IconClose, IconPlus } from "@/components/icons";
import { Button, Checkbox, Dialog, ErrorNote, Field, IconButton, Input, Select, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";

/* ------------------------------------------------------------------ Levels */

const SaveLevelDocument = graphql(`
  mutation SaveLevel(
    $id: ID
    $name: String!
    $section: String!
    $gradingScaleId: ID
    $nextLevelId: ID
    $hasSubjectSelection: Boolean!
    $reportTemplate: String!
  ) {
    saveLevel(
      id: $id
      name: $name
      section: $section
      gradingScaleId: $gradingScaleId
      nextLevelId: $nextLevelId
      hasSubjectSelection: $hasSubjectSelection
      reportTemplate: $reportTemplate
    ) {
      id
    }
  }
`);

export const SECTIONS: [string, string][] = [
  ["creche", "Creche"],
  ["nursery", "Nursery"],
  ["primary", "Primary"],
  ["jss", "Junior secondary"],
  ["sss", "Senior secondary"],
];

export interface LevelForm {
  id?: string;
  name: string;
  section: string;
  gradingScaleId: string;
  nextLevelId: string;
  hasSubjectSelection: boolean;
  reportTemplate: string;
}

export function LevelDialog({
  open,
  onClose,
  initial,
  levels,
  scales,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: LevelForm;
  levels: { id: string; name: string }[];
  scales: { id: string; name: string }[];
  onSaved: (message: string) => void;
}) {
  const [form, setForm] = useState(initial);
  const [seen, setSeen] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (initial !== seen) {
    // A different level was opened: start from its values.
    setSeen(initial);
    setForm(initial);
    setError(null);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await gql(SaveLevelDocument, {
        id: form.id ?? null, name: form.name, section: form.section, gradingScaleId: form.gradingScaleId || null,
        nextLevelId: form.nextLevelId || null, hasSubjectSelection: form.hasSubjectSelection, reportTemplate: form.reportTemplate,
      });
      onSaved(form.id ? `${form.name} updated.` : `${form.name} added with one arm. Choose its subjects next.`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={form.id ? `Edit ${initial.name}` : "Add a level"}
      description="A year group, such as Primary 4 or SSS 2. Arms like A and B are added inside the level."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button busy={busy} disabled={!form.name.trim()} onClick={save}>{form.id ? "Save level" : "Add level"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <ErrorNote error={error} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="JSS 1" /></Field>
          <Field label="Section">
            <Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value, hasSubjectSelection: e.target.value === "sss" ? true : form.hasSubjectSelection })}>
              {SECTIONS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Grading scale">
            <Select value={form.gradingScaleId} onChange={(e) => setForm({ ...form, gradingScaleId: e.target.value })}>
              <option value="">None</option>
              {scales.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="At the end of the session">
            <Select value={form.nextLevelId} onChange={(e) => setForm({ ...form, nextLevelId: e.target.value })}>
              <option value="">Students graduate</option>
              {levels.filter((l) => l.id !== form.id).map((l) => <option key={l.id} value={l.id}>Promote to {l.name}</option>)}
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Report card template">
              <Select value={form.reportTemplate} onChange={(e) => setForm({ ...form, reportTemplate: e.target.value })}>
                <option value="">School default</option>
                <option value="classic">Classic, with highest and lowest scores</option>
                <option value="compact">Compact</option>
              </Select>
            </Field>
          </div>
        </div>
        <Checkbox
          label="Students choose their own electives"
          description="For senior secondary: each student takes the compulsory subjects plus the electives and trade subject chosen on their profile."
          checked={form.hasSubjectSelection}
          onChange={(v) => setForm({ ...form, hasSubjectSelection: v })}
        />
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------- Subjects per level */

const SaveSubjectDocument = graphql(`mutation SaveSubject($name: String!) { saveSubject(name: $name) { id name } }`);
const SetLevelSubjectsDocument = graphql(`
  mutation SetLevelSubjects($levelId: ID!, $subjects: [LevelSubjectInput!]!) { setLevelSubjects(levelId: $levelId, subjects: $subjects) { id } }
`);

export const CATEGORIES: [string, string][] = [
  ["core", "Compulsory"],
  ["science", "Science elective"],
  ["humanities", "Humanities elective"],
  ["business", "Business elective"],
  ["trade", "Trade subject"],
  ["elective", "Other elective"],
];

type Offered = Record<string, string>; // subject id -> category

export function LevelSubjectsDialog({
  open,
  onClose,
  level,
  allSubjects,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  level: { id: string; name: string; hasSubjectSelection: boolean; levelSubjects: { category: string; subject: { id: string; name: string } }[] } | null;
  allSubjects: { id: string; name: string }[];
  onSaved: (message: string) => void;
}) {
  const initial: Offered = Object.fromEntries((level?.levelSubjects ?? []).map((ls) => [ls.subject.id, ls.category]));
  const [offered, setOffered] = useState<Offered>(initial);
  const [extra, setExtra] = useState<{ id: string; name: string }[]>([]);
  const [seen, setSeen] = useState(level);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (level !== seen) {
    setSeen(level);
    setOffered(initial);
    setExtra([]);
    setError(null);
  }
  if (!level) return null;

  const subjects = [...allSubjects, ...extra.filter((e) => !allSubjects.some((s) => s.id === e.id))].sort((a, b) => a.name.localeCompare(b.name));
  // Offered subjects first, in their existing order; then the rest alphabetically.
  const order = level.levelSubjects.map((ls) => ls.subject.id);
  const sorted = [
    ...order.map((id) => subjects.find((s) => s.id === id)).filter(Boolean) as { id: string; name: string }[],
    ...subjects.filter((s) => !order.includes(s.id)),
  ];
  const count = Object.keys(offered).length;

  async function addSubject() {
    const name = newName.trim();
    if (!name) return;
    setError(null);
    try {
      const { saveSubject } = await gql(SaveSubjectDocument, { name });
      setExtra((e) => [...e, saveSubject]);
      setOffered((o) => ({ ...o, [saveSubject.id]: "core" }));
      setNewName("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const list = sorted.filter((s) => offered[s.id]).map((s) => ({ subjectId: s.id, category: level!.hasSubjectSelection ? offered[s.id] : "core" }));
      await gql(SetLevelSubjectsDocument, { levelId: level!.id, subjects: list });
      onSaved(`${level!.name} now offers ${list.length} subject${list.length === 1 ? "" : "s"}.`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Subjects for ${level.name}`}
      description={level.hasSubjectSelection
        ? "Tick the subjects offered. Compulsory subjects are taken by everyone; students choose from the electives on their profile."
        : "Tick the subjects every student in this level takes."}
      footer={
        <>
          <span className="mr-auto self-center text-sm text-muted">{count} selected</span>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button busy={busy} onClick={save}>Save subjects</Button>
        </>
      }
    >
      <div className="space-y-3">
        <ErrorNote error={error} />
        <div className="max-h-[50vh] divide-y divide-line overflow-y-auto rounded-lg border border-line">
          {sorted.map((s) => {
            const on = Boolean(offered[s.id]);
            return (
              <div key={s.id} className={cx("flex items-center justify-between gap-3 px-3 py-2", on && "bg-subtle/50")}>
                <Checkbox
                  label={s.name}
                  checked={on}
                  onChange={(v) => setOffered((o) => {
                    const next = { ...o };
                    if (v) next[s.id] = "core";
                    else delete next[s.id];
                    return next;
                  })}
                />
                {on && level.hasSubjectSelection && (
                  <select
                    aria-label={`Category for ${s.name}`}
                    value={offered[s.id]}
                    onChange={(e) => setOffered((o) => ({ ...o, [s.id]: e.target.value }))}
                    className="h-8 rounded-md border border-line-strong bg-surface px-2 text-xs text-ink"
                  >
                    {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void addSubject()} placeholder="Add a subject not listed, e.g. Yoruba" aria-label="New subject" />
          <Button variant="secondary" icon={<IconPlus size={15} />} onClick={addSubject} disabled={!newName.trim()}>Add</Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ---------------------------------------------------------- Grading scales */

const SaveScaleDocument = graphql(`
  mutation SaveGradingScale($id: ID, $name: String!, $bands: [BandInput!]!) { saveGradingScale(id: $id, name: $name, bands: $bands) { id } }
`);

export interface ScaleForm {
  id?: string;
  name: string;
  bands: { grade: string; minScore: string; remark: string }[];
}

/**
 * Teachers think of grades by their lowest score ("B from 60"). We store each band's
 * upper limit too, worked out as the next band's lowest score minus 0.01, so there are
 * never gaps for scores like 69.5.
 */
function toBands(rows: ScaleForm["bands"]) {
  const sorted = [...rows].map((r) => ({ ...r, min: Number(r.minScore) })).sort((a, b) => b.min - a.min);
  return sorted.map((r, i) => ({
    grade: r.grade.trim(),
    remark: r.remark.trim(),
    minScore: r.min.toFixed(2),
    maxScore: i === 0 ? "100.00" : (sorted[i - 1].min - 0.01).toFixed(2),
  }));
}

export function GradingScaleDialog({ open, onClose, initial, onSaved }: { open: boolean; onClose: () => void; initial: ScaleForm; onSaved: (message: string) => void }) {
  const [form, setForm] = useState(initial);
  const [seen, setSeen] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (initial !== seen) {
    setSeen(initial);
    setForm(initial);
    setError(null);
  }

  const mins = form.bands.map((b) => Number(b.minScore));
  const problem =
    !form.name.trim() ? "Give the scale a name." :
    form.bands.some((b) => !b.grade.trim()) ? "Every row needs a grade." :
    form.bands.some((b) => b.minScore.trim() === "" || Number.isNaN(Number(b.minScore)) || Number(b.minScore) < 0 || Number(b.minScore) > 100) ? "Lowest scores must be between 0 and 100." :
    !mins.includes(0) ? "One grade must start from 0, so every score gets a grade." :
    new Set(mins).size !== mins.length ? "Two grades start from the same score." : null;
  const preview = problem ? [] : toBands(form.bands);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await gql(SaveScaleDocument, { id: form.id ?? null, name: form.name.trim(), bands: toBands(form.bands) });
      onSaved(`${form.name.trim()} saved. Assign it to levels from each level's settings.`);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const set = (i: number, patch: Partial<ScaleForm["bands"][number]>) => setForm({ ...form, bands: form.bands.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={form.id ? `Edit ${initial.name}` : "New grading scale"}
      description="Enter each grade and the lowest total that earns it. The highest score for each grade is worked out for you."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button busy={busy} disabled={Boolean(problem)} onClick={save}>Save scale</Button>
        </>
      }
    >
      <div className="space-y-3">
        <ErrorNote error={error} />
        <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Primary A–F" /></Field>
        <div className="grid grid-cols-[72px_96px_1fr_32px] gap-2 text-xs font-medium text-muted">
          <span>Grade</span><span>Lowest score</span><span>Remark</span><span />
        </div>
        {form.bands.map((b, i) => (
          <div key={i} className="grid grid-cols-[72px_96px_1fr_32px] items-center gap-2">
            <Input value={b.grade} onChange={(e) => set(i, { grade: e.target.value })} aria-label="Grade" className="text-center font-semibold" />
            <Input value={b.minScore} inputMode="decimal" onChange={(e) => set(i, { minScore: e.target.value })} aria-label="Lowest score" className="text-right tabular-nums" />
            <Input value={b.remark} onChange={(e) => set(i, { remark: e.target.value })} aria-label="Remark" placeholder="Excellent" />
            <IconButton label="Remove grade" disabled={form.bands.length <= 2} onClick={() => setForm({ ...form, bands: form.bands.filter((_, j) => j !== i) })}>
              <IconClose size={15} />
            </IconButton>
          </div>
        ))}
        <Button size="sm" variant="ghost" icon={<IconPlus size={15} />} onClick={() => setForm({ ...form, bands: [...form.bands, { grade: "", minScore: "", remark: "" }] })}>Add grade</Button>
        <div className={cx("rounded-lg border px-3 py-2 text-xs", problem ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" : "border-line bg-subtle/50 text-muted")}>
          {problem ?? (
            <>Prints as: {preview.map((b) => `${b.grade} ${Math.floor(Number(b.minScore))}–${Math.floor(Number(b.maxScore))}`).join(" · ")}</>
          )}
        </div>
      </div>
    </Dialog>
  );
}
