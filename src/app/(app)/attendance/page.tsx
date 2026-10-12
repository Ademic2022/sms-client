"use client";

import Link from "next/link";

import { Card, Empty, Loading, PageHeader } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { useSession } from "@/lib/session";

const AttendanceClassesDocument = graphql(`
  query AttendanceClasses($all: Boolean!) {
    myClasses { classArms { id label studentCount } }
    arms @include(if: $all) { id label studentCount }
  }
`);

export default function AttendancePage() {
  const { can } = useSession();
  const all = can("attendance.manage");
  const { data, isLoading } = useGql(AttendanceClassesDocument, { all });
  const arms = all ? data?.arms ?? [] : data?.myClasses.classArms ?? [];
  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark today's register in under a minute." />
      {isLoading ? (
        <Loading />
      ) : arms.length ? (
        <Card>
          <ul className="divide-y divide-line">
            {arms.map((a) => (
              <li key={a.id}>
                <Link href={`/attendance/${a.id}`} className="flex min-h-12 items-center justify-between text-sm">
                  <span className="font-medium">{a.label}</span>
                  <span className="text-muted">{a.studentCount} students →</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Empty>You are not the class teacher of any class.</Empty>
      )}
    </>
  );
}
