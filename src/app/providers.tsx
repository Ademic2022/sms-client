"use client";

import { useEffect, type ReactNode } from "react";

import { startOutbox } from "@/lib/outbox";
import { SessionProvider } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    startOutbox();
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    } else {
      // A worker left by a production build on this address would keep serving old code in
      // development (dev file names don't change between edits). Remove it and its cache.
      void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        if (!registrations.length) return;
        await Promise.all(registrations.map((r) => r.unregister()));
        await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
        window.location.reload();
      });
    }
  }, []);
  return <SessionProvider>{children}</SessionProvider>;
}
