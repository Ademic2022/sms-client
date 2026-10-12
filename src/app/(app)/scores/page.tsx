"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconPencilGrid } from "@/components/icons";
import { Button, Card, Empty, Field, Loading, PageHeader, RowLink, Select } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { useSession } from "@/lib/session";

const ScoreTargetsDocument = graphql(`
  query ScoreTargets {
    myClasses { subjectAssignments { id arm { id label } subject { id name } } }
  }
`);

const AllClassesDocument = graphql(`
  query AllClassesAndSubjects {
    levels { id name arms { id label } levelSubjects { subject { id name } } }
  }
`);

function AnyClassPicker() {
  const router = useRouter();
  const { data } = useGql(AllClassesDocument, {});
  const [armId, setArmId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const level = data?.levels.find((l) => l.arms.some((a) => a.id === armId));
  return (
    <Card title="Any class and subject" description="As an administrator you can open any score sheet.">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Class">
          <Select value={armId} onChange={(e) => { setArmId(e.target.value); setSubjectId(""); }}>
            <option value="">Select a class</option>
            {data?.levels.flatMap((l) => l.arms).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </Select>
        </Field>
        <Field label="Subject">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!level}>
            <option value="">Select a subject</option>
            {level?.levelSubjects.map((ls) => <option key={ls.subject.id} value={ls.subject.id}>{ls.subject.name}</option>)}
          </Select>
        </Field>
        <Button disabled={!armId || !subjectId} onClick={() => router.push(`/scores/${armId}/${subjectId}`)}>Open score sheet</Button>
      </div>
    </Card>
  );
}

export default function ScoresPage() {
  const { can, term } = useSession();
  const { data, isLoading } = useGql(ScoreTargetsDocument, {});
  const assignments = data?.myClasses.subjectAssignments ?? [];
  return (
    <>
      <PageHeader eyebrow={term?.label} title="Score entry" subtitle="Scores save as you type and keep saving when the network drops." />
      {isLoading ? (
        <Loading />
      ) : assignments.length ? (
        <Card title="My subjects" description={`${assignments.length} class${assignments.length === 1 ? "" : "es"} this session`} flush>
          {assignments.map((a) => (
            <RowLink key={a.id} href={`/scores/${a.arm.id}/${a.subject.id}`} title={a.subject.name} meta={a.arm.label} right={<span className="text-[13px] font-medium text-brand-ink">Open sheet</span>} />
          ))}
        </Card>
      ) : (
        !can("scores.manage") && (
          <Empty title="No subjects assigned" icon={<IconPencilGrid size={18} />}>
            You have not been assigned to teach any subject this session. Ask the school admin to assign your classes.
          </Empty>
        )
      )}
      {can("scores.manage") && <AnyClassPicker />}
    </>
  );
}
