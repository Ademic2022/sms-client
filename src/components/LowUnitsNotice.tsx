"use client";

import Link from "next/link";

import { Notice } from "@/components/ui";
import { graphql } from "@/gql";
import { useGql } from "@/lib/api";
import { useSession } from "@/lib/session";

const WalletStatusDocument = graphql(`query SmsWalletStatus { smsWalletStatus { balance lowThreshold isLow } }`);

/** Shown to staff who send or pay for SMS when the wallet is below the school's warning level. */
export function LowUnitsNotice() {
  const { can } = useSession();
  const allowed = can("messaging.send", "messaging.wallet", "school.manage");
  const { data } = useGql(WalletStatusDocument, allowed ? {} : null);
  const w = data?.smsWalletStatus;
  if (!w?.isLow) return null;
  const empty = w.balance <= 0;
  return (
    <Notice tone={empty ? "error" : "warning"} title={empty ? "Out of SMS units" : `SMS units running low: ${w.balance.toLocaleString("en-NG")} left`}>
      Receipts, absence alerts and fee reminders are not sent by SMS once the wallet is empty.{" "}
      {can("school.manage")
        ? <Link href="/settings/billing" className="font-semibold underline underline-offset-2">Buy units</Link>
        : "Ask the school owner to buy more units."}
    </Notice>
  );
}
