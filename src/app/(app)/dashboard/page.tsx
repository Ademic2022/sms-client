"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { IconAward, IconCalendarCheck, IconMessage, IconPencilGrid, IconUsers, IconWallet } from "@/components/icons";
import { BillingAlertNotice } from "@/components/BillingAlert";
import { LowUnitsNotice } from "@/components/LowUnitsNotice";
import { ButtonLink, Card, ErrorNote, Loading, Notice, PageHeader, Stat } from "@/components/ui";
import { NoticesCard } from "@/components/NoticesCard";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { naira } from "@/lib/money";
import { homeFor, isPortalOnly, useSession } from "@/lib/session";

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

function percent(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function FeeTiles({ f }: { f: { expectedKobo: number; collectedKobo: number; collectedOnlineKobo: number; outstandingKobo: number; debtorCount: number } }) {
  const rate = percent(f.collectedKobo, f.expectedKobo);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <Stat label="Billed this term" value={naira(f.expectedKobo)} hint="All compulsory and added items" />
      <Stat
        label="Collected"
        value={naira(f.collectedKobo)}
        hint={
          <div className="space-y-1.5">
            <Progress value={rate} />
            <div>{rate}% of billed · {naira(f.collectedOnlineKobo)} online</div>
          </div>
        }
      />
      <Stat label="Outstanding" value={naira(f.outstandingKobo)} hint={<Link className="font-medium text-brand-ink hover:underline" href="/fees">{f.debtorCount} students owing</Link>} />
      <Stat label="Paid online" value={`${percent(f.collectedOnlineKobo, f.collectedKobo)}%`} hint="Share of collections made through the portal" />
    </div>
  );
}

function OwnerPanel() {
  const { data, error, isLoading } = useGql(OwnerDashboardDocument, {});
  if (isLoading) return <Loading />;
  if (error) return <ErrorNote error={error} />;
  const d = data?.ownerDashboard;
  if (!d) return null;
  const max = Math.max(1, ...d.studentsByLevel.map((l) => l.students));
  return (
    <div className="space-y-5">
      <FeeTiles f={d.fees} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Enrolment by level" description={`${d.activeStudents} active students`}>
          <ul className="space-y-2.5">
            {d.studentsByLevel.map((l) => (
              <li key={l.level} className="grid grid-cols-[96px_1fr_40px] items-center gap-3 text-sm">
                <span className="truncate text-muted">{l.level}</span>
                <span className="h-2 overflow-hidden rounded-full bg-subtle">
                  <span className="block h-full rounded-full bg-brand/80" style={{ width: `${(l.students / max) * 100}%` }} />
                </span>
                <span className="text-right font-medium tabular-nums text-ink">{l.students}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Results this term" description={`${d.classesPublished} of ${d.classesTotal} classes published`}>
          <Progress value={percent(d.classesPublished, d.classesTotal)} />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Check missing scores per class, approve and lock, then publish to parents on the date you choose.
          </p>
          <ButtonLink href="/results" variant="secondary" size="sm" className="mt-4">Review results</ButtonLink>
        </Card>
      </div>
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
  const byArm: [string, string, typeof subjects][] = [];
  for (const s of subjects) {
    const group = byArm.find(([id]) => id === s.arm.id);
    if (group) group[2].push(s);
    else byArm.push([s.arm.id, s.arm.label, [s]]);
  }
  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      {arms.length > 0 && (
        <Card title="My class" description="Daily register, broadsheet, comments and ratings" flush>
          {arms.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 last:border-b-0">
              <div>
                <div className="text-sm font-medium text-ink">{a.label}</div>
                <div className="text-[13px] text-muted">{a.studentCount} students</div>
              </div>
              <div className="flex gap-2">
                {can("attendance.mark", "attendance.manage") && <ButtonLink href={`/attendance/${a.id}`} size="sm" icon={<IconCalendarCheck size={15} />}>Register</ButtonLink>}
                <ButtonLink href={`/results/${a.id}`} size="sm" variant="secondary" icon={<IconAward size={15} />}>Broadsheet</ButtonLink>
              </div>
            </div>
          ))}
        </Card>
      )}
      {subjects.length > 0 && (
        <Card title="My subjects" description={`${subjects.length} subject${subjects.length === 1 ? "" : "s"} across ${byArm.length} class${byArm.length === 1 ? "" : "es"}`} flush>
          {byArm.map(([armId, label, items]) => (
            <div key={armId} className="border-b border-line px-5 py-4 last:border-b-0">
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">{label}</span>
                <span className="text-xs text-muted">{items.length} subject{items.length === 1 ? "" : "s"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <Link key={s.id} href={`/scores/${s.arm.id}/${s.subject.id}`}
                    className="rounded-md border border-line-strong bg-surface px-2.5 py-1 text-[13px] text-ink shadow-sm transition hover:border-brand hover:text-brand-ink">
                    {s.subject.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function BursarPanel({ termId }: { termId: string }) {
  const { data, isLoading } = useGql(BursarSummaryDocument, { termId });
  if (isLoading) return <Loading />;
  return data ? <FeeTiles f={data.termFeeSummary} /> : null;
}

function QuickActions() {
  const { can } = useSession();
  const actions = [
    can("payments.record") && { href: "/fees/payments", label: "Record a payment", icon: IconWallet },
    can("students.manage") && { href: "/students/new", label: "Add a student", icon: IconUsers },
    can("scores.enter", "scores.manage") && { href: "/scores", label: "Enter scores", icon: IconPencilGrid },
    can("messaging.send") && { href: "/messages", label: "Send an announcement", icon: IconMessage },
  ].filter(Boolean) as { href: string; label: string; icon: typeof IconWallet }[];
  // A single shortcut duplicates the panel below it; only show the row when there is a choice.
  if (actions.length < 2) return null;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm font-medium text-ink shadow-sm transition hover:border-line-strong hover:shadow-md">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-brand/10 text-brand-ink"><Icon size={16} /></span>
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { me, school, term, can } = useSession();
  const router = useRouter();
  const portalHome = me && isPortalOnly(me.permissions) ? homeFor(me.permissions) : null;
  const platformOnly = !school && me?.isPlatformAdmin;

  useEffect(() => {
    if (portalHome) router.replace(portalHome);
    else if (platformOnly) router.replace("/console");
  }, [portalHome, platformOnly, router]);

  if (!me || portalHome || platformOnly) return <Loading />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <PageHeader eyebrow={today} title={`${greeting}, ${me.user.firstName || me.user.fullName}`} subtitle={term ? term.label : "No current term is set"} />
      {!term && can("academics.manage") && (
        <Notice tone="warning" title="Set up the current term">
          Create this session and its terms, then mark the current term. <Link className="font-semibold underline underline-offset-2" href="/settings/academics">Open academic setup</Link>
        </Notice>
      )}
      <BillingAlertNotice alert={me.billingAlert} kinds={["due", "trial_ending"]} />
      <LowUnitsNotice />
      <QuickActions />
      {can("dashboard.owner") ? <OwnerPanel /> : can("fees.view") && term ? <BursarPanel termId={term.id} /> : null}
      <TeacherPanel />
      <NoticesCard emptyText="Announcements sent from Messages appear here." />
    </>
  );
}
