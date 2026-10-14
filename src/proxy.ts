import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before API calls are forwarded to Django (next.config.ts rewrites). It vouches for the
 * visitor's IP address with a secret shared with the API (API_PROXY_SECRET), so the API's
 * per-address rate limits use the real visitor and cannot be dodged by someone calling the
 * API directly with a made-up X-Forwarded-For. Without the secret configured nothing is added.
 */
const SECRET = process.env.API_PROXY_SECRET;

function visitorIp(request: NextRequest) {
  // Vercel sets both from the connection itself, overwriting anything the browser sent.
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Never pass through values a browser made up.
  headers.delete("x-akademiq-proxy");
  headers.delete("x-akademiq-client-ip");
  if (SECRET) {
    headers.set("x-akademiq-proxy", SECRET);
    const ip = visitorIp(request);
    if (ip) headers.set("x-akademiq-client-ip", ip);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/graphql", "/api/:path*", "/files/:path*", "/payments/:path*", "/webhooks/:path*"],
};
