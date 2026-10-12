import useSWR, { type SWRConfiguration } from "swr";

import type { TypedDocumentString } from "@/gql/graphql";

export class ApiError extends Error {
  code: string;
  constructor(message: string, code = "error") {
    super(message);
    this.code = code;
  }
}

/** The request never reached the server: the phone is offline or the network dropped. */
export class NetworkError extends Error {}

function cookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfPromise: Promise<void> | null = null;

async function ensureCsrf() {
  if (cookie("csrftoken")) return;
  csrfPromise ??= fetch("/api/csrf/", { credentials: "include" }).then(() => undefined);
  await csrfPromise;
  csrfPromise = null;
}

export function csrfHeaders(): Record<string, string> {
  const token = cookie("csrftoken");
  return token ? { "X-CSRFToken": token } : {};
}

type Doc<R, V> = TypedDocumentString<R, V> | string;

/** Send a GraphQL operation to the school's API on this same host. */
export async function gql<R, V = Record<string, never>>(doc: Doc<R, V>, variables?: V): Promise<R> {
  await ensureCsrf();
  let response: Response;
  try {
    response = await fetch("/graphql", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ query: doc.toString(), variables: variables ?? {} }),
    });
  } catch {
    throw new NetworkError("No connection. Your changes will be sent when you are back online.");
  }
  if (response.status === 404) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error === "school_not_found" ? "This school address does not exist." : "Not found.", "not_found");
  }
  if (response.status === 403) {
    const body = await response.json().catch(() => ({}));
    if (body.error === "school_suspended") throw new ApiError("This school's portal is suspended.", "suspended");
  }
  if (response.status >= 500) throw new ApiError("The server had a problem. Please try again.", "server");
  const body = await response.json();
  if (body.errors?.length) {
    const first = body.errors[0];
    throw new ApiError(first.message, first.extensions?.code ?? "error");
  }
  return body.data as R;
}

/** Read data with caching and revalidation. Pass null variables to skip the request. */
export function useGql<R, V>(doc: Doc<R, V>, variables: V | null, config?: SWRConfiguration<R, ApiError>) {
  return useSWR<R, ApiError>(variables === null ? null : [doc.toString(), JSON.stringify(variables)], () => gql(doc, variables as V), {
    revalidateOnFocus: false,
    shouldRetryOnError: (error: unknown) => error instanceof NetworkError,
    ...config,
  });
}

/** POST a file (Excel uploads) with the CSRF token. */
export async function uploadFile(path: string, file: File) {
  await ensureCsrf();
  const form = new FormData();
  form.append("file", file);
  let response: Response;
  try {
    response = await fetch(path, { method: "POST", body: form, credentials: "include", headers: csrfHeaders() });
  } catch {
    throw new NetworkError("No connection. Try the upload again when you are back online.");
  }
  const body = await response.json().catch(() => ({ error: "Unexpected response from the server." }));
  return { ok: response.ok, status: response.status, body };
}
