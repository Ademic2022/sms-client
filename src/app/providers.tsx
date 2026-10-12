"use client";

import { useEffect, type ReactNode } from "react";

import { startOutbox } from "@/lib/outbox";
import { SessionProvider } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    startOutbox();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);
  return <SessionProvider>{children}</SessionProvider>;
}
