"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Card, Empty, ErrorNote, Loading, Notice, PageHeader, Stat } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { naira } from "@/lib/money";
import { useSession } from "@/lib/session";

const OwnerDashboardDocument = graphql(`
  query OwnerDashboard {
    ownerDashboard {
      termLabel
      activeStudents
      classesPublished
      classesTotal
      studentsByLevel { level students }
      fees { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }
    }
  }
`);

const MyClassesDocument = graphql(`
  query MyClasses {
    myClasses {
      classArms { id label studentCount }
      subjectAssignments { id arm { id label } subject { id name } }
    }
  }
`);

const BursarSummaryDocument = graphql(`
  query BursarSummary($termId: ID!) {
    termFeeSummary(termId: $termId) { expectedKobo collectedKobo collectedOnlineKobo outstandingKobo debtorCount }
  }
`);

const NoticesDocument = graphql(`
  query Notices {
    notices(limit: 5) { id title body createdAt }
  }
`);

function OwnerPanel() {
  const { data, error, isLoading } = useGql(OwnerDashboardDocument, {});
  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const d = data?.ownerDashboard;
  if (!d) return <Notice>Set the current term in Settings to see this term&apos;s figures.</Notice>;
  const rate = d.fees.expectedKobo ? Math.round((d.fees.collectedKobo / d.fees.expectedKobo) * 100) : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Expected this term" value={naira(d.fees.expectedKobo)} />
        <Stat label="Collected" value={naira(d.fees.collectedKobo)} hint={`${rate}% · ${naira(d.fees.collectedOnlineKobo)} online`} />
        <Stat label="Outstanding" value={naira(d.fees.outstandingKobo)} hint={<Link className="text-brand" href="/fees">{d.fees.debtorCount} debtors</Link>} />
        <Stat label="Students" value={d.activeStudents} hint={`Results published: ${d.classesPublished} of ${d.classesTotal} classes`} />
      </div>
      <Card title="Enrolment by level">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
          {d.studentsByLevel.map((l) => (
            <li key={l.level} className="flex justify-between border-b border-line py-1"><span>{l.level}</span><span className="tabular-nums">{l.students}</span></li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function TeacherPanel() {
  const { can } = useSession();
  const { data, isLoading } = useGql(MyClassesDocument, {});
  if (isLoading) return <Loading />;
  const arms = data?.myClasses.classArms ?? [];
  const subjects = data?.myClasses.subjectAssignments ?? [];
  if (!arms.length && !subjects.length) return null;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {arms.length > 0 && (
        <Card title="My class">
          <ul className="space-y-2">
            {arms.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{a.label} <span className="text-sm text-muted">· {a.studentCount} students</span></span>
                <span className="flex gap-3 text-sm">
                  {can("attendance.mark", "attendance.manage") && <Link className="text-brand" href={`/attendance/${a.id}`}>Register</Link>}
                  <Link className="text-brand" href={`/results/${a.id}`}>Broadsheet</Link>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {subjects.length > 0 && (
        <Card title="My subjects">
          <ul className="divide-y divide-line">
            {subjects.map((s) => (
              <li key={s.id}>
                <Link href={`/scores/${s.arm.id}/${s.subject.id}`} className="flex min-h-11 items-center justify-between text-sm">
                  <span>{s.subject.name} · {s.arm.label}</span>
                  <span className="text-brand">Enter scores →</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function BursarPanel({ termId }: { termId: string }) {
  const { data } = useGql(BursarSummaryDocument, { termId });
  const f = data?.termFeeSummary;
  if (!f) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat label="Expected" value={naira(f.expectedKobo)} />
      <Stat label="Collected" value={naira(f.collectedKobo)} />
      <Stat label="Outstanding" value={naira(f.outstandingKobo)} />
      <Stat label="Debtors" value={f.debtorCount} hint={<Link className="text-brand" href="/fees">View list</Link>} />
    </div>
  );
}

export default function DashboardPage() {
  const { me, school, term, can } = useSession();
  const router = useRouter();
  const notices = useGql(NoticesDocument, {});
  const parentOnly = me && me.permissions.length === 1 && me.permissions[0] === "portal.parent";

  const platformOnly = !school && me?.isPlatformAdmin;

  useEffect(() => {
    if (parentOnly) router.replace("/parent");
    else if (platformOnly) router.replace("/console");
  }, [parentOnly, platformOnly, router]);

  if (!me || parentOnly || platformOnly) return <Loading />;

  return (
    <>
      <PageHeader title={`Welcome, ${me.user.firstName || me.user.fullName}`} subtitle={term ? term.label : "No current term set"} />
      {!term && can("academics.manage") && (
        <Notice tone="warning">Create this session and its terms, then mark the current term. <Link className="font-semibold underline" href="/settings/academics">Go to academic setup</Link></Notice>
      )}
      {can("dashboard.owner") ? <OwnerPanel /> : can("fees.view") && term ? <BursarPanel termId={term.id} /> : null}
      <TeacherPanel />
      <Card title="Notices">
        {notices.data?.notices.length ? (
          <ul className="space-y-3">
            {notices.data.notices.map((n) => (
              <li key={n.id} className="text-sm">
                {n.title && <div className="font-semibold">{n.title}</div>}
                <p className="whitespace-pre-line text-muted">{n.body}</p>
                <div className="text-xs text-muted">{new Date(n.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No notices yet.</Empty>
        )}
      </Card>
    </>
  );
}
