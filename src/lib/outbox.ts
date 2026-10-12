/**
 * Offline outbox for score entry and attendance.
 *
 * Writes that fail because the phone is offline are stored in IndexedDB and replayed in the
 * order they were made when the network returns. Each write carries the time it was made on
 * the device, so the server keeps whichever edit is newer if two devices disagree.
 */

import { createStore, del, entries, set } from "idb-keyval";
import { useSyncExternalStore } from "react";

import { ApiError, NetworkError, gql } from "./api";

export interface OutboxItem {
  id: string;
  createdAt: number;
  label: string;
  query: string;
  variables: Record<string, unknown>;
  error?: string;
}

const store = typeof indexedDB !== "undefined" ? createStore("school-portal", "outbox") : undefined;
let items: OutboxItem[] = [];
let flushing = false;
const listeners = new Set<() => void>();

function emit() {
  items = [...items].sort((a, b) => a.createdAt - b.createdAt);
  listeners.forEach((l) => l());
}

async function load() {
  if (!store) return;
  items = (await entries<string, OutboxItem>(store)).map(([, v]) => v);
  emit();
}

export async function enqueue(label: string, query: string, variables: Record<string, unknown>) {
  const item: OutboxItem = { id: crypto.randomUUID(), createdAt: Date.now(), label, query, variables };
  items.push(item);
  if (store) await set(item.id, item, store);
  emit();
}

export async function discard(id: string) {
  items = items.filter((i) => i.id !== id);
  if (store) await del(id, store);
  emit();
}

/** Send queued writes oldest first. Stops at the first network failure to keep the order. */
export async function flush(): Promise<number> {
  if (flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    for (const item of [...items].filter((i) => !i.error)) {
      try {
        await gql(item.query, item.variables);
        await discard(item.id);
        sent += 1;
      } catch (error) {
        if (error instanceof NetworkError) break;
        // The server refused it (e.g. results were locked meanwhile). Keep it visible so the
        // teacher can see what did not save, instead of silently dropping it.
        item.error = error instanceof ApiError ? error.message : "Could not save.";
        if (store) await set(item.id, item, store);
        emit();
      }
    }
  } finally {
    flushing = false;
  }
  return sent;
}

/**
 * Try a write now; if the phone is offline, queue it and report that it was queued.
 * Server-side errors are thrown so the screen can show them.
 */
export async function sendOrQueue<R>(label: string, query: string, variables: Record<string, unknown>): Promise<{ queued: boolean; data?: R }> {
  try {
    const data = await gql<R, Record<string, unknown>>(query, variables);
    return { queued: false, data };
  } catch (error) {
    if (error instanceof NetworkError) {
      await enqueue(label, query, variables);
      return { queued: true };
    }
    throw error;
  }
}

let started = false;

export function startOutbox() {
  if (started || typeof window === "undefined") return;
  started = true;
  load().then(() => flush());
  window.addEventListener("online", () => void flush());
  window.setInterval(() => {
    if (items.some((i) => !i.error) && navigator.onLine) void flush();
  }, 30_000);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: OutboxItem[] = [];

export function useOutbox(): OutboxItem[] {
  return useSyncExternalStore(subscribe, () => items, () => EMPTY);
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("online", cb);
      window.addEventListener("offline", cb);
      return () => {
        window.removeEventListener("online", cb);
        window.removeEventListener("offline", cb);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}
