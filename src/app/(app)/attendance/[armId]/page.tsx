"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Button, Card, ErrorNote, FormActions, Input, Loading, Notice, PageHeader, cx } from "@/components/ui";
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
  { key: "present", label: "Present", active: "bg-emerald-600 text-white shadow-sm" },
  { key: "absent", label: "Absent", active: "bg-red-600 text-white shadow-sm" },
  { key: "late", label: "Late", active: "bg-amber-500 text-white shadow-sm" },
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

  const rows = data?.register.rows ?? [];
  const alreadyMarked = rows.some((r) => r.status);
  const label = rows[0]?.student.currentArm?.label ?? "";
  const counts = Object.values(marks).reduce<Record<string, number>>((acc, s) => ({ ...acc, [s]: (acc[s] ?? 0) + 1 }), {});
  const longDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  async function save() {
    setBusy(true);
    setSaveError(null);
    setResult(null);
    const at = new Date().toISOString();
    try {
      const res = await sendOrQueue<{ markAttendance: { saved: number; conflicts: unknown[] } }>(
        `Attendance ${label} ${date}`,
        MarkAttendanceDocument.toString(),
        { armId, date, entries: Object.entries(marks).map(([studentId, status]) => ({ studentId, status, clientUpdatedAt: at })) },
      );
      if (res.queued) {
        setResult({ tone: "warning", text: "Saved on this device. It will be sent automatically when you are back online." });
      } else {
        const conflicts = res.data?.markAttendance.conflicts.length ?? 0;
        setResult({ tone: "success", text: conflicts ? `Register saved. ${conflicts} mark${conflicts === 1 ? " was" : "s were"} changed more recently on another device and kept.` : "Register saved." });
        void mutate();
      }
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        back={{ href: "/attendance", label: "Attendance" }}
        eyebrow={longDate}
        title={label ? `${label} register` : "Register"}
        subtitle={alreadyMarked ? "Already taken for this day. Saving will update it." : "Everyone starts as present. Mark only those absent or late."}
        actions={<Input type="date" value={date} max={todayIso()} onChange={(e) => { setDate(e.target.value); setResult(null); }} aria-label="Date" className="w-auto" />}
      />
      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <div key={s.key} className="rounded-xl border border-line bg-surface px-4 py-3 shadow-sm">
            <div className="text-[13px] text-muted">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-medium tabular-nums text-ink">{counts[s.key] ?? 0}</div>
          </div>
        ))}
      </div>
      <ErrorNote error={error ?? saveError} />
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
      {isLoading ? (
        <Loading />
      ) : (
        <Card
          flush
          title={`${rows.length} students`}
          actions={<Button size="sm" variant="secondary" onClick={() => setMarks(Object.fromEntries(rows.map((r) => [r.student.id, "present"])))}>Mark all present</Button>}
        >
          <ul>
            {rows.map(({ student }, i) => {
              const status = marks[student.id] ?? "present";
              return (
                <li key={student.id} className={cx("flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 last:border-b-0", status === "absent" && "bg-red-50/60 dark:bg-red-950/20")}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 flex-none text-right text-xs tabular-nums text-muted">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{student.fullName}</div>
                      <div className="text-xs tabular-nums text-muted">{student.admissionNumber}</div>
                    </div>
                  </div>
                  <div role="radiogroup" aria-label={`Attendance for ${student.fullName}`} className="flex flex-none rounded-lg border border-line bg-subtle p-0.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s.key}
                        role="radio"
                        aria-checked={status === s.key}
                        onClick={() => setMarks((m) => ({ ...m, [student.id]: s.key }))}
                        className={cx("h-9 min-w-10 rounded-md px-2.5 text-xs font-semibold transition sm:min-w-20", status === s.key ? s.active : "text-muted hover:text-ink")}
                      >
                        <span className="sm:hidden">{s.label.charAt(0)}</span>
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      <FormActions>
        <span className="mr-auto text-sm text-muted">{counts.absent ?? 0} absent · {counts.late ?? 0} late</span>
        <Button busy={busy} onClick={save} disabled={!rows.length}>Save register</Button>
      </FormActions>
    </>
  );
}
