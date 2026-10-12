"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { IconAlert, IconCheck, IconClock } from "@/components/icons";
import { ButtonLink, Card, ErrorNote, Loading } from "@/components/ui";
import { graphql } from "@/gql";
import { gql } from "@/lib/api";
import { naira } from "@/lib/money";

const CheckoutStatusDocument = graphql(`
  query CheckoutStatus($reference: String!) {
    checkoutStatus(reference: $reference) { reference status amountKobo }
  }
`);

type Status = { status: string; amountKobo: number };

function PaymentReturn() {
  const params = useSearchParams();
  // Paystack sends ?reference= (and ?trxref=) back to the callback URL.
  const reference = params.get("reference") ?? params.get("trxref");
  const [result, setResult] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        const { checkoutStatus } = await gql(CheckoutStatusDocument, { reference });
        setResult(checkoutStatus);
        // The bank may take a moment to confirm transfers; keep checking for a minute.
        if (checkoutStatus.status === "pending" && attempts++ < 12) timer = setTimeout(check, 5000);
      } catch (e) {
        setError((e as Error).message);
      }
    };
    void check();
    return () => clearTimeout(timer);
  }, [reference]);

  if (!reference) return <ErrorNote error="No payment reference was returned." />;
  if (error) return <ErrorNote error={error} />;
  if (!result) return <Loading label="Confirming your payment" />;

  const view = {
    success: { tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", icon: <IconCheck size={26} strokeWidth={2.2} />, title: "Payment received", text: `${naira(result.amountKobo)} has been paid to the school. A receipt has been sent to your phone by SMS.` },
    pending: { tone: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", icon: <IconClock size={26} />, title: "Waiting for your bank", text: "Your bank has not confirmed the payment yet. You can leave this page. Your balance updates as soon as it is confirmed." },
    failed: { tone: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: <IconAlert size={26} />, title: "Payment not completed", text: "The payment did not go through and no money was taken. You can try again." },
  }[result.status === "success" ? "success" : result.status === "pending" ? "pending" : "failed"];

  return (
    <div className="mx-auto max-w-md py-8">
      <Card>
        <div className="flex flex-col items-center px-2 py-6 text-center">
          <span className={`grid h-14 w-14 place-items-center rounded-full ${view.tone}`}>{view.icon}</span>
          <h1 className="mt-5 font-display text-2xl font-medium text-ink">{view.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{view.text}</p>
          <div className="mt-2 text-xs tabular-nums text-muted">Reference {reference}</div>
          <ButtonLink href="/parent" className="mt-6">Back to my children</ButtonLink>
        </div>
      </Card>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentReturn />
    </Suspense>
  );
}
