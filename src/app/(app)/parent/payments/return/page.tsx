"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ButtonLink, Card, ErrorNote, Loading, Notice } from "@/components/ui";
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
  if (!result) return <Loading label="Confirming your payment…" />;

  return (
    <Card>
      {result.status === "success" && <Notice tone="success">Payment of {naira(result.amountKobo)} received. A receipt has been sent to your phone.</Notice>}
      {result.status === "pending" && <Notice>We are still waiting for the bank to confirm. You can leave this page; the balance will update once it is confirmed.</Notice>}
      {(result.status === "failed" || result.status === "abandoned") && <Notice tone="warning">The payment did not go through. No money was taken. You can try again.</Notice>}
      <ButtonLink href="/parent" className="mt-4">Back to my children</ButtonLink>
    </Card>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentReturn />
    </Suspense>
  );
}
