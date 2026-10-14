"use client";

import { useState } from "react";

import { NoticesCard } from "@/components/NoticesCard";
import { AttendanceCard, TermResults } from "@/components/portal/TermRecords";
import { ErrorNote, Loading, PageHeader, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { TermsDocument } from "@/lib/queries";

const MyStudentDocument = graphql(`
  query MyStudent { myStudent { id fullName firstName admissionNumber currentArm { label } } }
`);

/** The student portal: the signed-in student's own results, report cards, attendance and notices. */
export default function StudentPage() {
  const me = useGql(MyStudentDocument, {});
  const terms = useGql(TermsDocument, {});
  const [chosenTerm, setTermId] = useState("");
  const termId = chosenTerm || (terms.data?.terms.find((t) => t.isCurrent)?.id ?? terms.data?.terms.at(-1)?.id ?? "");

  if (me.isLoading) return <Loading />;
  if (me.error) return <ErrorNote error={me.error} />;
  const student = me.data?.myStudent;
  if (!student) return <ErrorNote error="Your account is not linked to a student record. Ask the school office." />;

  return (
    <>
      <PageHeader
        title={`Hello, ${student.firstName}`}
        subtitle={<><span>{student.currentArm?.label}</span><span aria-hidden>·</span><span className="tabular-nums">{student.admissionNumber}</span></>}
        actions={
          <Select value={termId} onChange={(e) => setTermId(e.target.value)} className="w-auto" aria-label="Term">
            {terms.data?.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>
        }
      />
      {termId && <TermResults studentId={student.id} termId={termId} />}
      {termId && <AttendanceCard studentId={student.id} termId={termId} />}
      <NoticesCard emptyText="Announcements from the school will appear here." />
    </>
  );
}
