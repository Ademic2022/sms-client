"use client";

import { useEffect, useState } from "react";

/** Matches the server, which sends at most one confirmation email per account per minute. */
export const RESEND_AFTER_SECONDS = 60;

/**
 * "Send it again", available only once the wait is over. Shows the seconds left, and starts
 * waiting again after each send. Pass waitFirst when an email has only just gone out.
 */
export function ResendButton({ onSend, waitFirst = false, label = "Send it again", className = "" }: {
  onSend: () => Promise<unknown>;
  waitFirst?: boolean;
  label?: string;
  className?: string;
}) {
  const [until, setUntil] = useState(() => (waitFirst ? Date.now() + RESEND_AFTER_SECONDS * 1000 : 0));
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const left = Math.max(0, Math.ceil((until - now) / 1000));

  useEffect(() => {
    if (until <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [until]);

  async function send() {
    setBusy(true);
    try {
      await onSend();
    } catch {
      // The server answers the same way whether or not it sent; nothing useful to show.
    }
    setSent(true);
    setBusy(false);
    setNow(Date.now());
    setUntil(Date.now() + RESEND_AFTER_SECONDS * 1000);
  }

  if (left > 0 || busy) {
    return (
      <span className={`text-muted ${className}`} aria-live="polite">
        {busy ? "Sending…" : `${sent ? "Sent. " : ""}You can send it again in ${left}s.`}
      </span>
    );
  }
  return (
    <button type="button" onClick={send} className={`font-medium text-brand hover:underline dark:text-[color-mix(in_srgb,var(--brand),white_55%)] ${className}`}>
      {label}
    </button>
  );
}
