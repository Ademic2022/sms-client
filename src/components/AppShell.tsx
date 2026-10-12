"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { graphql } from "@/gql";
import { gql } from "@/lib/api";
import { discard, flush, useOnline, useOutbox } from "@/lib/outbox";
import { useSession } from "@/lib/session";

import { Button, Loading, Notice, cx } from "./ui";

const LogoutDocument = graphql(`
  mutation Logout {
    logout
  }
`);

interface NavItem {
  href: string;
  label: string;
  perms: string[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", perms: [] },
  { href: "/parent", label: "My children", perms: ["portal.parent"] },
  { href: "/students", label: "Students", perms: ["students.view"] },
  { href: "/attendance", label: "Attendance", perms: ["attendance.mark", "attendance.manage"] },
  { href: "/scores", label: "Scores", perms: ["scores.enter", "scores.manage"] },
  { href: "/results", label: "Results", perms: ["results.class", "results.approve", "results.publish"] },
  { href: "/fees", label: "Fees", perms: ["fees.view"] },
  { href: "/messages", label: "Messages", perms: ["messaging.send"] },
  { href: "/settings", label: "Settings", perms: ["school.manage", "academics.manage", "staff.manage"] },
  { href: "/audit", label: "Audit log", perms: ["audit.view"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { me, school, loading, can, refresh } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const online = useOnline();
  const outbox = useOutbox();
  const pending = outbox.filter((i) => !i.error).length;
  const failed = outbox.filter((i) => i.error).length;

  useEffect(() => {
    if (!loading && !me) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, me, pathname, router]);

  useEffect(() => {
    if (school?.primaryColor) document.documentElement.style.setProperty("--brand", school.primaryColor);
  }, [school?.primaryColor]);

  if (loading || !me) return <Loading />;

  const items = NAV.filter((item) => item.perms.length === 0 || can(...item.perms));

  async function logout() {
    await gql(LogoutDocument).catch(() => undefined);
    await refresh();
    router.replace("/login");
  }

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx("rounded-lg px-3 py-2.5 text-sm font-medium", active ? "bg-brand/10 text-brand" : "text-ink hover:bg-subtle")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-surface p-4 lg:block">
        <div className="mb-6 px-3">
          <div className="text-sm font-bold text-ink">{school?.name}</div>
          <div className="truncate text-xs text-muted">{me.user.fullName}</div>
        </div>
        {nav}
        <Button variant="ghost" className="mt-4 w-full justify-start" onClick={logout}>Log out</Button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 py-2 backdrop-blur lg:hidden">
          <button className="min-h-11 min-w-11 rounded-lg text-ink" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{school?.name}</div>
          {!online && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">Offline</span>}
        </header>
        {open && (
          <div className="border-b border-line bg-surface p-3 lg:hidden">
            {nav}
            <Button variant="ghost" className="mt-2 w-full justify-start" onClick={logout}>Log out</Button>
          </div>
        )}

        <main className="mx-auto max-w-6xl space-y-3 px-4 py-4 sm:px-6">
          {me.viaSupport && <Notice tone="warning">You are in this school&apos;s account through support access. Everything you do is logged.</Notice>}
          {me.accessMode === "read_only" && <Notice tone="warning">The subscription is overdue, so the portal is read-only until it is renewed. No data has been removed.</Notice>}
          {(pending > 0 || failed > 0) && (
            <Notice tone={failed ? "warning" : "info"}>
              {pending > 0 && <>{pending} change{pending > 1 ? "s" : ""} waiting to sync{online ? "" : " when you are back online"}. </>}
              {failed > 0 && <>{failed} change{failed > 1 ? "s" : ""} could not be saved: {outbox.find((i) => i.error)?.error} </>}
              {online && pending > 0 && <button className="font-semibold underline" onClick={() => void flush()}>Sync now</button>}
              {failed > 0 && (
                <button className="ml-2 font-semibold underline" onClick={() => outbox.filter((i) => i.error).forEach((i) => void discard(i.id))}>
                  Dismiss
                </button>
              )}
            </Notice>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
