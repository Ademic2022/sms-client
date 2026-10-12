"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Card, Empty, Field, Loading, PageHeader, Select } from "@/components/ui";
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
    <Card title="Any class and subject">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Class">
          <Select value={armId} onChange={(e) => { setArmId(e.target.value); setSubjectId(""); }}>
            <option value="">Choose…</option>
            {data?.levels.flatMap((l) => l.arms).map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </Select>
        </Field>
        <Field label="Subject">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!level}>
            <option value="">Choose…</option>
            {level?.levelSubjects.map((ls) => <option key={ls.subject.id} value={ls.subject.id}>{ls.subject.name}</option>)}
          </Select>
        </Field>
        <Button disabled={!armId || !subjectId} onClick={() => router.push(`/scores/${armId}/${subjectId}`)}>Open</Button>
      </div>
    </Card>
  );
}

export default function ScoresPage() {
  const { can } = useSession();
  const { data, isLoading } = useGql(ScoreTargetsDocument, {});
  const assignments = data?.myClasses.subjectAssignments ?? [];
  return (
    <>
      <PageHeader title="Enter scores" subtitle="Scores save as you type, and keep saving when the network drops." />
      {isLoading ? (
        <Loading />
      ) : assignments.length ? (
        <Card title="My subjects">
          <ul className="divide-y divide-line">
            {assignments.map((a) => (
              <li key={a.id}>
                <Link href={`/scores/${a.arm.id}/${a.subject.id}`} className="flex min-h-12 items-center justify-between text-sm">
                  <span><span className="font-medium">{a.subject.name}</span> · {a.arm.label}</span>
                  <span className="text-brand">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        !can("scores.manage") && <Empty>You have not been assigned any subjects this session. Ask the school admin.</Empty>
      )}
      {can("scores.manage") && <AnyClassPicker />}
    </>
  );
}
