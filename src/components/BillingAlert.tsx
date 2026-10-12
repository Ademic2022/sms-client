"use client";

import Link from "next/link";

import { naira } from "@/lib/money";
import type { Me } from "@/lib/session";

import { Notice } from "./ui";

type Alert = NonNullable<Me["billingAlert"]>;

function long(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

const link = "font-semibold underline underline-offset-2";

/** Billing reminders for school owners and admins. The server only sends these to them. */
export function BillingAlertNotice({ alert, kinds }: { alert: Alert | null | undefined; kinds: Alert["kind"][] }) {
  if (!alert || !kinds.includes(alert.kind)) return null;
  const inv = alert.invoice;
  switch (alert.kind) {
    case "read_only":
      return (
        <Notice tone="error" title="Read-only until the subscription is paid">
          Invoice {inv?.number} for {naira(inv?.amountKobo)} is overdue. Everyone can still view and export, and no data has been removed.{" "}
          <Link className={link} href="/settings/billing">Pay now to restore full access</Link>
        </Notice>
      );
    case "overdue":
      return (
        <Notice tone="warning" title={`Invoice ${inv?.number} is overdue`}>
          {naira(inv?.amountKobo)} was due for {inv?.periodLabel}.{" "}
          {new Date(alert.date) > new Date() ? `Please pay before ${long(alert.date)}, or the portal becomes read-only until it is paid.` : "Please pay it as soon as possible to avoid the portal becoming read-only."}{" "}
          <Link className={link} href="/settings/billing">Pay invoice</Link>
        </Notice>
      );
    case "due":
      return (
        <Notice tone="info" title={`Invoice for ${inv?.periodLabel}`}>
          {naira(inv?.amountKobo)} for {inv?.studentCount} active students, due {long(alert.date)}.{" "}
          <Link className={link} href="/settings/billing">View and pay</Link>
        </Notice>
      );
    case "trial_ending":
      return (
        <Notice tone="info" title={`Your free trial ends on ${long(alert.date)}`}>
          After that you are billed per active student each term. Nothing changes in the portal.{" "}
          <Link className={link} href="/settings/billing">See billing</Link>
        </Notice>
      );
    default:
      return null;
  }
}
