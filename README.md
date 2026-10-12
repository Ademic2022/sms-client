# sms-client

Mobile-first web app (installable PWA) for the multi-tenant school management system. Each
school opens it on its own subdomain, for example `greenfield.yourapp.ng`.

Built with Next.js 16, TypeScript and Tailwind CSS. It talks to [sms-server](../sms-server)
over GraphQL.

## Quick start

```bash
npm install
npm run dev
```

With the server running and seeded (`uv run python manage.py seed_demo`), open:

| Address | What |
| --- | --- |
| http://greenfield.localhost:3000 | Demo school. Every demo password is `demo-pass-2026`. Owner `08030000001`, bursar `08030000003`, teacher `08030000004`, parent `08060000001` |
| http://localhost:3000 | Platform site: sign up a school, or log in as platform admin `admin@platform.test` |

Browsers resolve `*.localhost` to your own machine, so no hosts-file changes are needed.

## How it fits together

- **Same-origin API.** `next.config.ts` forwards `/graphql`, `/api`, `/files` and `/payments` to Django,
  passing the original host in `X-Forwarded-Host`. Django resolves the school from it, and cookies stay
  host-only per school. No school ID is ever sent from the browser. Set `API_ORIGIN` to point at another
  backend. In production, a load balancer does the same routing.
- **Typed GraphQL.** Each screen declares its queries with `graphql(...)`. `npm run schema` copies
  `schema.graphql` from the server and regenerates `src/gql/`, so frontend and backend cannot drift apart.
- **Permissions.** Navigation and actions are hidden based on the permission codes in `me`. The server
  checks every request anyway.
- **Offline entry.** Score entry and attendance go through `sendOrQueue` (`src/lib/outbox.ts`). If the
  phone is offline, the write is stored in IndexedDB and replayed in order when the network returns.
  Every write carries the time it was made on the device, and the server keeps the newer edit. The
  service worker (`public/sw.js`) keeps the app shell available offline.
- **Money** is whole kobo everywhere. `src/lib/money.ts` only formats and parses for display.

## Screens

| Who | Where |
| --- | --- |
| Owner | Dashboard: expected, collected and outstanding fees, enrolment, results published |
| Admin | Students (add, Excel import, profile, withdraw), Settings (school, academic setup, staff and roles, support access), Audit log |
| Teachers | Scores (grid with autosave, Excel download and upload), Attendance (one-tap register), Results (broadsheet, comments, ratings) |
| Principal | Results: missing scores per class, approve and lock, publish on a date, generate report cards |
| Bursar | Fees (summary, debtors, SMS reminders, Excel export), fee setup, record payments, student ledgers, discounts |
| Parent | My children: balances, bills, pay for several children at once, results and report cards, receipts |
| Platform admin | Console: schools, suspend or reactivate, SMS sender approval, SMS units |

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run lint
npm run typecheck
npm run schema     # copy the server schema and regenerate types
```
