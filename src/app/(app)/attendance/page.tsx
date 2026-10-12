"use client";

import { IconCalendarCheck } from "@/components/icons";
import { Card, Empty, Loading, PageHeader, RowLink } from "@/components/ui";
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
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  return (
    <>
      <PageHeader eyebrow={today} title="Attendance" subtitle="Choose a class to take today's register." />
      {isLoading ? (
        <Loading />
      ) : arms.length ? (
        <Card flush>
          {arms.map((a) => (
            <RowLink key={a.id} href={`/attendance/${a.id}`} title={a.label} meta={`${a.studentCount} students`} right={<span className="text-[13px] font-medium text-brand-ink">Take register</span>} />
          ))}
        </Card>
      ) : (
        <Empty title="No class assigned" icon={<IconCalendarCheck size={18} />}>
          Registers are taken by each class&apos;s class teacher. Ask the school admin to assign you to a class.
        </Empty>
      )}
    </>
  );
}
