"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession } from "@/lib/session";

import { cx } from "./ui";

const ITEMS = [
  { href: "/settings", label: "School", perms: ["school.manage"] },
  { href: "/settings/academics", label: "Academic setup", perms: ["academics.manage"] },
  { href: "/settings/staff", label: "Staff and roles", perms: ["staff.manage"] },
  { href: "/settings/privacy", label: "Privacy", perms: ["school.manage"] },
  { href: "/settings/billing", label: "Billing", perms: ["school.manage"] },
];

/** Sub-navigation shared by the settings pages. */
export function SettingsNav() {
  const pathname = usePathname();
  const { can } = useSession();
  return (
    <nav className="-mt-1 flex gap-1 overflow-x-auto border-b border-line" aria-label="Settings">
      {ITEMS.filter((i) => can(...i.perms)).map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={pathname === i.href ? "page" : undefined}
          className={cx(
            "-mb-px inline-flex h-10 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition",
            pathname === i.href ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
