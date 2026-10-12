"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { IconDownload, IconUpload } from "@/components/icons";
import { Badge, Button, ButtonLink, Card, ErrorNote, Loading, Notice, PageHeader, Spinner, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { uploadFile, useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { sendOrQueue } from "@/lib/outbox";
import { useSession } from "@/lib/session";

const ScoreSheetDocument = graphql(`
  query ScoreSheet($armId: ID!, $subjectId: ID!, $termId: ID!) {
    scoreSheet(armId: $armId, subjectId: $subjectId, termId: $termId) {
      armLabel
      locked
      status
      subject { id name }
      components { id name maxScore }
      students { id fullName admissionNumber }
      scores { studentId componentId value }
    }
  }
`);

const SaveScoresDocument = graphql(`
  mutation SaveScores($armId: ID!, $subjectId: ID!, $termId: ID!, $entries: [ScoreEntry!]!) {
    saveScores(armId: $armId, subjectId: $subjectId, termId: $termId, entries: $entries) {
      saved
      conflicts { studentId componentId serverValue }
    }
  }
`);

type Key = `${string}:${string}`;
const key = (studentId: string, componentId: string): Key => `${studentId}:${componentId}`;

function trimZeros(value: string | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(Number(value));
}

export default function ScoreEntryPage() {
  const { armId, subjectId } = useParams<{ armId: string; subjectId: string }>();
  const { term, can } = useSession();
  const vars = term ? { armId, subjectId, termId: term.id } : null;
  const { data, error, isLoading, mutate } = useGql(ScoreSheetDocument, vars);
  const sheet = data?.scoreSheet;

  const [dirty, setDirty] = useState<Record<Key, number>>({}); // cell -> time edited on this device
  // Load server values, keeping any cell the teacher is still editing.
  const [values, setValues] = useDerivedState(
    sheet,
    (s, current) => {
      const next: Record<Key, string> = {};
      for (const sc of s.scores) next[key(sc.studentId, sc.componentId)] = trimZeros(sc.value);
      for (const k of Object.keys(dirty) as Key[]) next[k] = current[k] ?? "";
      return next;
    },
    {} as Record<Key, string>,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "queued">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflictNote, setConflictNote] = useState<string | null>(null);
  const [uploadNote, setUploadNote] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const maxFor = useMemo(() => Object.fromEntries((sheet?.components ?? []).map((c) => [c.id, Number(c.maxScore)])), [sheet]);

  const invalid = (componentId: string, raw: string) => {
    if (raw === "") return false;
    const n = Number(raw);
    return Number.isNaN(n) || n < 0 || n > maxFor[componentId] || !/^\d+(\.\d{1,2})?$/.test(raw);
  };

  const save = useCallback(async () => {
    if (!term) return;
    const cells = Object.entries(dirty) as [Key, number][];
    const entries = cells
      .map(([k, at]) => {
        const [studentId, componentId] = k.split(":");
        return { studentId, componentId, value: values[k] === "" ? null : values[k], clientUpdatedAt: new Date(at).toISOString() };
      })
      .filter((e) => e.value === null || !invalid(e.componentId, e.value));
    if (!entries.length) return;
    setStatus("saving");
    setSaveError(null);
    try {
      const result = await sendOrQueue<{ saveScores: { conflicts: { studentId: string }[] } }>(
        `Scores: ${sheet?.subject.name} ${sheet?.armLabel}`,
        SaveScoresDocument.toString(),
        { armId, subjectId, termId: term.id, entries },
      );
      setDirty((d) => {
        const next = { ...d };
        for (const e of entries) delete next[key(e.studentId, e.componentId)];
        return next;
      });
      if (result.queued) {
        setStatus("queued");
      } else {
        setStatus("saved");
        const conflicts = result.data?.saveScores.conflicts ?? [];
        setConflictNote(conflicts.length ? `${conflicts.length} score(s) were changed more recently on another device and were kept.` : null);
        void mutate();
      }
    } catch (err) {
      setStatus("idle");
      setSaveError((err as Error).message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, values, term, armId, subjectId, sheet, mutate]);

  // Autosave shortly after the teacher stops typing.
  useEffect(() => {
    if (!Object.keys(dirty).length) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [dirty, save]);

  function change(studentId: string, componentId: string, raw: string) {
    const k = key(studentId, componentId);
    setValues((v) => ({ ...v, [k]: raw.trim() }));
    setDirty((d) => ({ ...d, [k]: Date.now() }));
    setStatus("idle");
  }

  async function upload(file: File) {
    if (!term) return;
    setUploadNote(null);
    try {
      const { ok, body } = await uploadFile(`/files/scores/${armId}/${subjectId}/${term.id}/upload/`, file);
      if (ok) {
        setUploadNote({ tone: "success", text: `${body.saved} score(s) saved from the file.` });
        void mutate();
      } else {
        const lines = (body.errors ?? []).map((e: { row: number | null; messages: string[] }) => `${e.row ? `Row ${e.row}: ` : ""}${e.messages.join(" ")}`);
        setUploadNote({ tone: "warning", text: body.error ?? lines.join(" · ") });
      }
    } catch (err) {
      setUploadNote({ tone: "warning", text: (err as Error).message });
    }
  }

  if (!term) return <Notice tone="warning" title="No current term">Ask the school admin to set the current term before entering scores.</Notice>;
  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  if (!sheet) return null;

  const editable = !sheet.locked || can("results.approve");
  const totalFor = (studentId: string) => {
    let total = 0;
    let any = false;
    for (const c of sheet.components) {
      const raw = values[key(studentId, c.id)];
      if (raw && !invalid(c.id, raw)) {
        total += Number(raw);
        any = true;
      }
    }
    return any ? Math.round(total * 100) / 100 : null;
  };
  const filled = sheet.students.filter((s) => sheet.components.every((c) => values[key(s.id, c.id)])).length;

  const pct = sheet.students.length ? Math.round((filled / sheet.students.length) * 100) : 0;
  const dirtyCount = Object.keys(dirty).length;

  return (
    <>
      <PageHeader
        back={{ href: "/scores", label: "Score entry" }}
        eyebrow={term.label}
        title={`${sheet.subject.name}, ${sheet.armLabel}`}
        subtitle={<>{filled} of {sheet.students.length} students complete</>}
        actions={
          <>
            <ButtonLink href={`/files/scores/${armId}/${subjectId}/${term.id}/template.xlsx`} variant="secondary" icon={<IconDownload size={16} />}>Download sheet</ButtonLink>
            {editable && (
              <>
                <Button variant="secondary" icon={<IconUpload size={16} />} onClick={() => fileInput.current?.click()}>Upload sheet</Button>
                <input ref={fileInput} type="file" accept=".xlsx" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </>
            )}
          </>
        }
      />
      {sheet.locked && (
        <Notice tone="warning" title={sheet.status === "published" ? "Results are published" : "Results are approved and locked"}>
          {can("results.approve") ? "You can still correct scores. Every change is recorded in the audit log." : "Ask the principal to unlock this class to make changes."}
        </Notice>
      )}
      {uploadNote && <Notice tone={uploadNote.tone}>{uploadNote.text}</Notice>}
      {conflictNote && <Notice tone="warning">{conflictNote}</Notice>}
      <ErrorNote error={saveError} />

      <Card
        flush
        title={
          <span className="flex items-center gap-3">
            Scores
            <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-subtle sm:block"><span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></span>
          </span>
        }
        actions={
          <span className="inline-flex items-center gap-2 text-[13px] text-muted" aria-live="polite">
            {status === "saving" ? (
              <><Spinner small /> Saving</>
            ) : status === "queued" ? (
              <Badge tone="warn" dot>Saved on this device · will sync</Badge>
            ) : dirtyCount > 0 ? (
              <Badge tone="neutral" dot>Unsaved changes</Badge>
            ) : status === "saved" ? (
              <Badge tone="good" dot>All changes saved</Badge>
            ) : null}
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle/60 text-xs font-medium text-muted">
                <th className="sticky left-0 z-10 bg-subtle px-5 py-2.5 text-left font-medium">Student</th>
                {sheet.components.map((c) => (
                  <th key={c.id} className="px-2 py-2.5 text-center font-medium">
                    {c.name} <span className="font-normal text-muted/80">/{Number(c.maxScore)}</span>
                  </th>
                ))}
                <th className="px-5 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sheet.students.map((s, row) => {
                const total = totalFor(s.id);
                return (
                  <tr key={s.id} className="border-b border-line last:border-b-0">
                    <td className="sticky left-0 z-10 max-w-[12rem] bg-surface px-5 py-2">
                      <div className="truncate font-medium text-ink">{s.fullName}</div>
                      <div className="text-xs tabular-nums text-muted">{s.admissionNumber}</div>
                    </td>
                    {sheet.components.map((c, col) => {
                      const k = key(s.id, c.id);
                      const raw = values[k] ?? "";
                      const bad = invalid(c.id, raw);
                      return (
                        <td key={c.id} className="px-1.5 py-1.5 text-center">
                          <input
                            aria-label={`${s.fullName} ${c.name}`}
                            aria-invalid={bad || undefined}
                            inputMode="decimal"
                            value={raw}
                            disabled={!editable}
                            data-cell={`${row}-${col}`}
                            onChange={(e) => change(s.id, c.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                document.querySelector<HTMLInputElement>(`[data-cell="${row + 1}-${col}"]`)?.focus();
                              }
                            }}
                            className={cx(
                              "h-10 w-16 rounded-md border text-center text-[15px] tabular-nums shadow-sm outline-none transition focus:ring-[3px] disabled:bg-subtle disabled:text-muted",
                              bad
                                ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-200 dark:bg-red-950/40 dark:text-red-200"
                                : dirty[k]
                                  ? "border-amber-400 bg-amber-50/50 text-ink focus:border-brand focus:ring-brand/15 dark:bg-amber-950/20"
                                  : "border-line-strong bg-surface text-ink focus:border-brand focus:ring-brand/15",
                            )}
                          />
                        </td>
                      );
                    })}
                    <td className="px-5 text-right font-semibold tabular-nums text-ink">{total ?? <span className="text-muted">–</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-muted">Press Enter to move down a column. Cells outlined in red are above the maximum and are not saved.</p>
    </>
  );
}
