"use client";

import { IconDownload } from "@/components/icons";
import { Badge, ButtonLink, Card, Loading, Notice, Stat, Table, TD, TH } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { ordinal } from "@/lib/money";

/** One student's term, as a parent or the student sees it in the portal: results and attendance. */

const ChildResultDocument = graphql(`
  query ChildResult($studentId: ID!, $termId: ID!) {
    childResult(studentId: $studentId, termId: $termId) {
      visible reason classSize classAverage reportCardUrl
      result {
        total average position cumulativeAverage cumulativePosition
        student { fullName currentArm { label } }
        subjects { subjectId subjectName total grade remark position cumulativeAverage cumulativeGrade }
      }
    }
  }
`);

const AttendanceHistoryDocument = graphql(`
  query ChildAttendance($studentId: ID!, $termId: ID!) {
    attendanceHistory(studentId: $studentId, termId: $termId) { id date status }
  }
`);

const REASONS: Record<string, string> = {
  not_published: "Results for this term have not been published yet.",
  not_yet_released: "Results will be available soon. The school has set a release date.",
  fees_outstanding: "Results are held until outstanding fees are paid. Please pay or contact the bursar.",
  not_enrolled: "Your child was not in a class this term.",
};

export function TermResults({ studentId, termId }: { studentId: string; termId: string }) {
  const result = useGql(ChildResultDocument, { studentId, termId });
  const r = result.data?.childResult;
  if (result.isLoading) return <Loading />;
  if (!r) return null;
  if (!r.visible) {
    return (
      <Notice tone={r.reason === "fees_outstanding" ? "warning" : "info"} title={r.reason === "fees_outstanding" ? "Results on hold" : "Results not available yet"}>
        {REASONS[r.reason] ?? "Results are not available."}
      </Notice>
    );
  }
  if (!r.result) return null;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Average" value={r.result.average ?? "–"} hint={`Class average ${r.classAverage ?? "–"}`} />
        <Stat label="Position" value={r.result.position ? ordinal(r.result.position) : "–"} hint={r.result.position ? `Out of ${r.classSize} students` : "Not shown by the school"} />
        <Stat label="Subjects" value={r.result.subjects.length} hint={`Total score ${Number(r.result.total)}`} />
      </div>
      <Card
        flush
        title="Subject results"
        actions={r.reportCardUrl && <ButtonLink href={r.reportCardUrl} size="sm" icon={<IconDownload size={15} />}>Report card</ButtonLink>}
      >
        <Table>
          <thead><tr><TH>Subject</TH><TH align="right">Score</TH><TH align="center">Grade</TH><TH>Remark</TH></tr></thead>
          <tbody>
            {r.result.subjects.map((s) => (
              <tr key={s.subjectId}>
                <TD className="font-medium">{s.subjectName}</TD>
                <TD align="right" className="tabular-nums">{s.total ? Number(s.total) : "–"}</TD>
                <TD align="center">{s.cumulativeGrade || s.grade ? <Badge tone="brand">{s.cumulativeGrade || s.grade}</Badge> : <span className="text-muted">–</span>}</TD>
                <TD className="text-muted">{s.remark}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}

const MISSED: Record<string, { label: string; tone: "bad" | "warn" | "neutral" }> = {
  absent: { label: "Absent", tone: "bad" },
  late: { label: "Late", tone: "warn" },
  excused: { label: "Excused", tone: "neutral" },
};

/** The term's register for one child: totals, then each day they were absent, late or excused. */
export function AttendanceCard({ studentId, termId }: { studentId: string; termId: string }) {
  const { data, isLoading } = useGql(AttendanceHistoryDocument, { studentId, termId });
  const days = data?.attendanceHistory ?? [];
  const count = (status: string) => days.filter((d) => d.status === status).length;
  const present = count("present") + count("late");
  const missed = days.filter((d) => d.status !== "present").reverse(); // newest first
  return (
    <Card title="Attendance" description={days.length ? `${days.length} school day${days.length === 1 ? "" : "s"} recorded this term` : undefined}>
      {isLoading ? (
        <Loading />
      ) : !days.length ? (
        <p className="text-sm text-muted">No attendance has been recorded for this term yet.</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Present" value={`${Math.round((present / days.length) * 100)}%`} hint={`${present} of ${days.length} days`} />
            <Stat label="Absent" value={count("absent")} />
            <Stat label="Late" value={count("late")} />
            <Stat label="Excused" value={count("excused")} />
          </div>
          {missed.length === 0 ? (
            <p className="text-sm text-muted">Present every day recorded this term.</p>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {missed.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="text-ink">{new Date(`${d.date}T12:00:00`).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "long" })}</span>
                  <Badge tone={MISSED[d.status]?.tone ?? "neutral"}>{MISSED[d.status]?.label ?? d.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
