"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { Button, ButtonLink, Card, Loading, Notice, PageHeader } from "@/components/ui";
import { graphql } from "@/gql";
import type { ConfirmPlatformPaymentMutation } from "@/gql/graphql";
import { gql } from "@/lib/api";
import { naira } from "@/lib/money";
import { useSession } from "@/lib/session";

const ConfirmDocument = graphql(`
  mutation ConfirmPlatformPayment($reference: String!) {
    confirmPlatformPayment(reference: $reference) { reference status purpose units amountKobo invoiceNumber smsBalance }
  }
`);

type Result = ConfirmPlatformPaymentMutation["confirmPlatformPayment"];

function PaymentReturn() {
  const reference = useSearchParams().get("reference") ?? "";
  const { refresh } = useSession();
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const { confirmPlatformPayment } = await gql(ConfirmDocument, { reference });
      setResult(confirmPlatformPayment);
      if (confirmPlatformPayment.status === "success") await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }, [reference, refresh]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- confirming the payment is the point of this page
    if (reference) void check();
  }, [reference, check]);

  if (!reference) return <Notice tone="error">This link is missing its payment reference.</Notice>;
  if (checking && !result) return <Loading label="Confirming your payment" />;

  return (
    <>
      <PageHeader title="Payment" back={{ href: "/settings/billing", label: "Billing" }} />
      <Card>
        {error ? (
          <Notice tone="error" title="We could not check this payment">{error}</Notice>
        ) : result?.status === "success" ? (
          <div className="space-y-2">
            <Notice tone="success" title="Payment received">
              {result.purpose === "invoice"
                ? `Invoice ${result.invoiceNumber} is paid. Thank you.`
                : `${result.units.toLocaleString("en-NG")} SMS units have been added. Your balance is now ${result.smsBalance.toLocaleString("en-NG")} units.`}
            </Notice>
            <p className="text-sm text-muted">{naira(result.amountKobo)} · reference <span className="tabular-nums">{result.reference}</span></p>
          </div>
        ) : result?.status === "failed" ? (
          <Notice tone="error" title="The payment did not go through">
            Nothing was charged for this attempt, or the amount did not match. You can try again from the billing page.
          </Notice>
        ) : (
          <Notice tone="info" title="Waiting for confirmation">
            Paystack has not confirmed this payment yet. Bank transfers can take a few minutes. You can check again, or leave this page: it will be applied automatically when it arrives.
          </Notice>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href="/settings/billing">Back to billing</ButtonLink>
          {result?.status === "pending" && <Button variant="secondary" busy={checking} onClick={check}>Check again</Button>}
        </div>
      </Card>
    </>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentReturn />
    </Suspense>
  );
}
