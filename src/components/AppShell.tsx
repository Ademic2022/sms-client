"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";

import { graphql } from "@/gql";
import { gql, useGql } from "@/lib/api";
import { discard, flush, useOnline, useOutbox } from "@/lib/outbox";
import { MyConsentDocument } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { useSession, type School } from "@/lib/session";

import {
  IconAward,
  IconBuilding,
  IconCalendarCheck,
  IconChild,
  IconClose,
  IconHome,
  IconInfo,
  IconLogout,
  IconMenu,
  IconMessage,
  IconPencilGrid,
  IconRefresh,
  IconSettings,
  IconShield,
  IconUsers,
  IconWallet,
  IconWifiOff,
} from "./icons";
import { BillingAlertNotice } from "./BillingAlert";
import { IconButton, Loading, Notice, cx } from "./ui";

const LogoutDocument = graphql(`
  mutation Logout {
    logout
  }
`);

interface NavItem {
  href: string;
  label: string;
  perms: string[];
  icon: ComponentType<{ size?: number; className?: string }>;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "",
    items: [
      { href: "/dashboard", label: "Overview", perms: [], icon: IconHome },
      { href: "/parent", label: "My children", perms: ["portal.parent"], icon: IconChild },
      { href: "/parent/consent", label: "Privacy and consent", perms: ["portal.parent"], icon: IconShield },
    ],
  },
  {
    section: "Academics",
    items: [
      { href: "/students", label: "Students", perms: ["students.view"], icon: IconUsers },
      { href: "/attendance", label: "Attendance", perms: ["attendance.mark", "attendance.manage"], icon: IconCalendarCheck },
      { href: "/scores", label: "Score entry", perms: ["scores.enter", "scores.manage"], icon: IconPencilGrid },
      { href: "/results", label: "Results", perms: ["results.class", "results.approve", "results.publish"], icon: IconAward },
    ],
  },
  {
    section: "Finance",
    items: [{ href: "/fees", label: "Fees and payments", perms: ["fees.view"], icon: IconWallet }],
  },
  {
    section: "Communication",
    items: [{ href: "/messages", label: "Messages", perms: ["messaging.send"], icon: IconMessage }],
  },
  {
    section: "Administration",
    items: [
      { href: "/settings", label: "Settings", perms: ["school.manage", "academics.manage", "staff.manage"], icon: IconSettings },
      { href: "/audit", label: "Audit log", perms: ["audit.view"], icon: IconShield },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  owner: "School owner",
  admin: "Administrator",
  class_teacher: "Class teacher",
  subject_teacher: "Subject teacher",
  bursar: "Bursar",
  parent: "Parent",
  student: "Student",
};

function initials(text: string) {
  return text.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

function Crest({ school }: { school: School | null }) {
  if (school?.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={school.logoUrl} alt="" className="h-9 w-9 flex-none rounded-lg border border-line bg-white object-contain p-1" />;
  }
  const label = school ? initials(school.name.replace(/\b(schools?|college|academy|the)\b/gi, "")) || school.name[0] : "";
  return (
    <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-brand font-display text-[15px] font-semibold text-white">
      {school ? (
        label
      ) : (
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden>
          <path d="M16 7 6 12l10 5 8-4v6h2v-7z" fill="currentColor" />
          <path d="M10 16v4.5c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5V16l-6 3z" fill="currentColor" opacity=".8" />
        </svg>
      )}
    </span>
  );
}

function SyncBanner() {
  const online = useOnline();
  const outbox = useOutbox();
  const pending = outbox.filter((i) => !i.error).length;
  const failed = outbox.filter((i) => i.error);
  if (online && !pending && !failed.length) return null;
  return (
    <div className="space-y-2">
      {(!online || pending > 0) && (
        <Notice tone={online ? "info" : "warning"} title={online ? `${pending} change${pending === 1 ? "" : "s"} waiting to sync` : "You are offline"}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              {online
                ? "Your changes are saved on this device and are being sent now."
                : `Keep working. ${pending ? `${pending} saved change${pending === 1 ? "" : "s"} will` : "Changes will"} sync when the connection returns.`}
            </span>
            {online && pending > 0 && (
              <button className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline" onClick={() => void flush()}>
                <IconRefresh size={14} /> Sync now
              </button>
            )}
          </div>
        </Notice>
      )}
      {failed.length > 0 && (
        <Notice tone="error" title={`${failed.length} change${failed.length === 1 ? "" : "s"} could not be saved`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{failed[0].label}: {failed[0].error}</span>
            <button className="font-semibold underline-offset-2 hover:underline" onClick={() => failed.forEach((i) => void discard(i.id))}>Dismiss</button>
          </div>
        </Notice>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { me, school, term, loading, can, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const online = useOnline();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const drawerOpen = openOn === pathname;

  // Parents must respond to the school's privacy notice before using the parent pages.
  const gated = Boolean(me?.permissions.includes("portal.parent")) && pathname.startsWith("/parent") && !pathname.startsWith("/parent/consent");
  const consent = useGql(MyConsentDocument, gated ? {} : null);
  const consentPending = gated && consent.data?.myConsent.pending;
  useEffect(() => {
    if (consentPending) router.replace("/parent/consent?first=1");
  }, [consentPending, router]);

  useEffect(() => {
    if (!loading && !me) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, me, pathname, router]);

  useEffect(() => {
    if (school?.primaryColor) document.documentElement.style.setProperty("--brand", school.primaryColor);
  }, [school?.primaryColor]);

  if (loading || !me || (gated && (consent.isLoading || consentPending))) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Loading />
      </div>
    );
  }

  async function logout() {
    await gql(LogoutDocument).catch(() => undefined);
    await refresh();
    router.replace("/login");
  }

  // Parents land on "My children"; the staff overview would only redirect them there.
  const parentOnly = me.permissions.length === 1 && me.permissions[0] === "portal.parent";
  const visible = (i: NavItem) => (i.perms.length === 0 ? !parentOnly : can(...i.perms));
  const sections = school
    ? NAV.map((s) => ({ ...s, items: s.items.filter(visible) })).filter((s) => s.items.length)
    : [{ section: "Platform", items: [{ href: "/console", label: "Schools", perms: [], icon: IconBuilding }] }];

  // Show the most senior role; the full set is visible in Settings.
  const senior = ["owner", "admin", "bursar", "class_teacher", "subject_teacher", "parent", "student"].find((r) => me.roles.includes(r));
  const roleLabel = me.isPlatformAdmin && !school ? "Platform admin" : senior ? ROLE_LABELS[senior] : me.roles[0] ?? "";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pb-4 pt-5">
        <Crest school={school} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{school?.name ?? SITE.name}</div>
          <div className="truncate text-xs text-muted">{term?.label ?? (school ? "No current term" : "Platform console")}</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {sections.map((s) => (
          <div key={s.section || "main"} className="mt-5 first:mt-1">
            {s.section && <div className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted/80">{s.section}</div>}
            <ul className="space-y-0.5">
              {s.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href) && !(item.href === "/parent" && pathname.startsWith("/parent/consent")));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cx(
                        "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                        active ? "bg-subtle text-ink" : "text-muted hover:bg-subtle/70 hover:text-ink",
                      )}
                    >
                      {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand" aria-hidden />}
                      <Icon size={18} className={active ? "text-brand-ink" : "text-muted group-hover:text-ink"} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-subtle text-xs font-semibold text-ink ring-1 ring-line">{initials(me.user.fullName)}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink">{me.user.fullName}</div>
            <div className="truncate text-xs text-muted">{roleLabel}</div>
          </div>
          <a href="/guide" target="_blank" rel="noopener" aria-label="Help: user guide" title="User guide"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-ink">
            <IconInfo size={17} />
          </a>
          <IconButton label="Sign out" onClick={logout}>
            <IconLogout size={17} />
          </IconButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface lg:block">{sidebar}</aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="ui-fade-in absolute inset-0 bg-black/40" onClick={() => setOpenOn(null)} aria-hidden />
          <div className="ui-slide-in absolute inset-y-0 left-0 w-[280px] border-r border-line bg-surface shadow-lg">
            <IconButton label="Close menu" className="absolute right-2 top-4 z-10" onClick={() => setOpenOn(null)}>
              <IconClose size={16} />
            </IconButton>
            {sidebar}
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur lg:hidden">
          <IconButton label="Open menu" onClick={() => setOpenOn(pathname)}>
            <IconMenu />
          </IconButton>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <Crest school={school} />
            <span className="truncate text-sm font-semibold text-ink">{school?.name ?? SITE.name}</span>
          </div>
          {!online && <IconWifiOff size={18} className="text-amber-600" aria-label="Offline" />}
        </header>

        <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-8 sm:py-8">
          {me.viaSupport && (
            <Notice tone="warning" title="Support access">
              You are in this school&apos;s account with the school&apos;s permission. Everything you do is recorded in its audit log.
            </Notice>
          )}
          {!pathname.startsWith("/settings/billing") && <BillingAlertNotice alert={me.billingAlert} kinds={["read_only", "overdue"]} />}
          {me.accessMode === "read_only" && me.billingAlert?.kind !== "read_only" && (
            <Notice tone="warning" title="Read-only until the subscription is renewed">
              You can view and export everything, but changes are paused. No data has been removed.
            </Notice>
          )}
          <SyncBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
