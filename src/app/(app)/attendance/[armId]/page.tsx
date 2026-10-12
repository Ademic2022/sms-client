"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge, Button, ErrorNote, Field, Input, Loading, Notice, PageHeader, cx } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { useDerivedState } from "@/lib/hooks";
import { todayIso } from "@/lib/money";
import { sendOrQueue } from "@/lib/outbox";

const RegisterDocument = graphql(`
  query Register($armId: ID!, $date: Date!) {
    register(armId: $armId, date: $date) {
      date
      rows { status student { id fullName admissionNumber currentArm { label } } }
    }
  }
`);

const MarkAttendanceDocument = graphql(`
  mutation MarkAttendance($armId: ID!, $date: Date!, $entries: [AttendanceEntry!]!) {
    markAttendance(armId: $armId, date: $date, entries: $entries) {
      saved
      conflicts { studentId serverStatus }
    }
  }
`);

const STATUSES = [
  { key: "present", label: "Present", tone: "bg-green-600 text-white" },
  { key: "absent", label: "Absent", tone: "bg-red-600 text-white" },
  { key: "late", label: "Late", tone: "bg-amber-500 text-white" },
] as const;

export default function RegisterPage() {
  const { armId } = useParams<{ armId: string }>();
  const [date, setDate] = useState(todayIso());
  const { data, error, isLoading, mutate } = useGql(RegisterDocument, { armId, date });
  // Everyone starts as present; the teacher only taps the absent and late ones.
  const [marks, setMarks] = useDerivedState(data, (d) => Object.fromEntries(d.register.rows.map((r) => [r.student.id, r.status ?? "present"])), {} as Record<string, string>);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const alreadyMarked = data?.register.rows.some((r) => r.status);
  const label = data?.register.rows[0]?.student.currentArm?.label ?? "";

  async function save() {
    setBusy(true);
    setSaveError(null);
    const at = new Date().toISOString();
    try {
      const res = await sendOrQueue<{ markAttendance: { saved: number; conflicts: unknown[] } }>(
        `Attendance ${label} ${date}`,
        MarkAttendanceDocument.toString(),
        { armId, date, entries: Object.entries(marks).map(([studentId, status]) => ({ studentId, status, clientUpdatedAt: at })) },
      );
      if (res.queued) {
        setResult({ tone: "warning", text: "Saved on this phone. It will be sent when you are back online." });
      } else {
        const conflicts = res.data?.markAttendance.conflicts.length ?? 0;
        setResult({ tone: "success", text: conflicts ? `Saved. ${conflicts} mark(s) were changed more recently elsewhere and were kept.` : "Register saved." });
        void mutate();
      }
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const counts = Object.values(marks).reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});

  return (
    <>
      <PageHeader title={`Register${label ? ` · ${label}` : ""}`} subtitle={alreadyMarked ? "Already marked. Changes will update it." : "Tap a student to mark them absent."} />
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Date">
          <Input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="flex gap-2 pb-2 text-sm">
          <Badge tone="good">{counts.present ?? 0} present</Badge>
          <Badge tone="bad">{counts.absent ?? 0} absent</Badge>
          <Badge tone="warn">{counts.late ?? 0} late</Badge>
        </div>
      </div>
      <ErrorNote error={error ?? saveError} />
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
      {isLoading ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {data?.register.rows.map(({ student }) => {
            const status = marks[student.id] ?? "present";
            return (
              <li key={student.id} className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  className="min-h-11 flex-1 text-left"
                  onClick={() => setMarks((m) => ({ ...m, [student.id]: status === "present" ? "absent" : "present" }))}
                >
                  <div className="font-medium">{student.fullName}</div>
                  <div className="text-xs text-muted">{student.admissionNumber}</div>
                </button>
                <div className="flex gap-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s.key}
                      aria-pressed={status === s.key}
                      onClick={() => setMarks((m) => ({ ...m, [student.id]: s.key }))}
                      className={cx("min-h-11 min-w-11 rounded-lg px-2 text-xs font-semibold", status === s.key ? s.tone : "bg-subtle text-muted")}
                    >
                      {s.label.charAt(0)}
                      <span className="sr-only">{s.label}</span>
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-background/95 p-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button className="w-full sm:w-auto" busy={busy} onClick={save} disabled={!data?.register.rows.length}>Save register</Button>
      </div>
    </>
  );
}
