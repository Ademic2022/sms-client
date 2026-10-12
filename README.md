# Akademiq · sms-client

The web app for **Akademiq**, a multi-tenant school management platform for Nigerian private nursery, primary and secondary schools. It's a mobile-first, installable progressive web app (PWA). Teachers enter scores and take registers on their phones, even offline. Principals approve and publish results, bursars collect fees, and parents pay online and download report cards.

Each school opens the app on its own address, for example `greenfield.akademiq.ng`, with its own name, crest and colours. The bare domain shows the marketing homepage and school sign-up.

> **Backend:** [sms-server](https://github.com/Ademic2022/sms-server), Django with a GraphQL API. This app needs it running.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [How it connects to the server](#how-it-connects-to-the-server)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Data fetching and types](#data-fetching-and-types)
- [Offline support](#offline-support)
- [Conventions](#conventions)
- [Scripts](#scripts)
- [Deploying](#deploying)

---

## Features

**Public**
- Marketing homepage with pricing and FAQ
- School sign-up with a live preview of the web address
- Sign-in that carries each school's name, crest and colour
- Password reset by SMS code
- Each school's privacy notice at `/privacy`

**By role**

| Role | Screens |
| --- | --- |
| School owner | Overview: fees billed, collected and outstanding, enrolment by level, results progress |
| Administrator | Students (search, add, Excel import, profiles, withdraw or transfer), academic setup, staff and roles (with Excel import), school settings including automatic fee reminders, message delivery reports and resending to failed numbers, a download of all school records, billing (invoices, online payment, invoice PDFs, buying SMS units), privacy notice and consent coverage, paper consent forms on student profiles, support access, audit log |
| Class teacher | One-tap daily register, class broadsheet, report card comments, behaviour and skills ratings |
| Subject teacher | Score grid with autosave, offline queueing, limits per assessment column, and Excel download and upload |
| Principal | Missing scores per class, approve and lock, publish on a chosen date, generate report cards for a whole class |
| Bursar | Fee setup, term bills, discounts, opening balances (by hand or from Excel), cash, POS and bank payments, receipts, payments export for the accountant, students owing, SMS fee reminders |
| Parent | Each child's balance and bill, one payment covering several children, results by term, report card and receipt downloads, privacy notice and consent (asked before first use, withdrawable at any time) |
| Platform admin | Schools, usage per school (sign-ins, active people, money collected, SMS units), suspension, SMS sender name approval, SMS unit credits, subscription invoices (raise, record bank transfers, void) |

## Tech stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, with design tokens as CSS variables |
| Fonts | Fraunces (headings) and Instrument Sans (text), loaded through `next/font` |
| Data | GraphQL over `fetch`, cached with SWR |
| Types | GraphQL Code Generator (client preset), generated from the server's `schema.graphql` |
| Offline | IndexedDB outbox (`idb-keyval`) and a service worker |

## Getting started

### Prerequisites

- Node.js 20.9 or newer, and npm
- [sms-server](https://github.com/Ademic2022/sms-server) running on port 8000, with demo data (`uv run python manage.py seed_demo`)

### Run it locally

```bash
git clone https://github.com/Ademic2022/sms-client.git
cd sms-client
npm install
cp .env.example .env.local
npm run dev
```

| Address | What you get |
| --- | --- |
| http://localhost:3000 | Homepage, sign-up, and platform admin sign-in (`admin@platform.test`) |
| http://greenfield.localhost:3000 | The demo school. Sign in as owner `08030000001`, teacher `08030000004`, bursar `08030000003` or parent `08060000001`. |

Every demo password is `demo-pass-2026`. Browsers resolve `*.localhost` to your own machine, so you don't need to edit your hosts file.

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_ORIGIN` | `http://127.0.0.1:8000` | Where the Django API runs |
| `TENANT_BASE_DOMAIN` | `localhost` | Must match the server. The bare domain shows the homepage and `<slug>.<domain>` is a school. Any other host, such as your hosting provider's address, shows the homepage unless the API recognises it as a school's custom domain. |

## How it connects to the server

The browser only ever talks to this Next.js app. Next.js forwards the API paths (`/graphql`, `/api`, `/files`, `/payments` and `/webhooks`) to Django, and passes the original host in `X-Forwarded-Host`. Django uses that host to work out which school is making the request.

As a result:

- **No school ID is ever sent from the browser.** The school comes from the address.
- **Session cookies are host-only,** so a sign-in at one school is never sent to another.
- **Trailing slashes are preserved,** because Django's paths end in `/`. See `skipTrailingSlashRedirect` and the rewrites in `next.config.ts`.

In production, a load balancer can do this routing instead.

## Project structure

```
src/
  app/
    page.tsx                 homepage (platform domain); school addresses redirect to the portal
    (auth)/                  sign-in, password reset, school sign-up
    (app)/                   signed-in portal, wrapped in AppShell
      dashboard/             overview for each role
      students/              list, profile, add, Excel import
      attendance/            class list and register
      scores/                assignments and score grid
      results/               class status, broadsheet, comments, ratings, approval
      fees/                  overview, fee setup, payments, student fees account
      messages/              compose and delivery history
      settings/              school, academic setup, staff and roles
      parent/                children, child results, payment return
      console/               platform admin
      audit/                 audit log
    manifest.ts              PWA manifest
  components/
    ui.tsx                   design system components
    icons.tsx                icon set
    AppShell.tsx             sidebar, mobile menu, sync and offline banners
    auth/AuthShell.tsx       split-screen frame for sign-in pages
    landing/                 homepage sections and product mock-ups
  lib/
    api.ts                   gql() request helper with CSRF, useGql() hook, uploads
    session.tsx              signed-in user, school, current term, can(...)
    outbox.ts                offline write queue
    hooks.ts                 useDerivedState
    money.ts                 naira, kobo, ordinals, phone formatting
    queries.ts               queries shared by several screens
    site.ts                  product name, price and contact details for the homepage
  gql/                       generated: do not edit
public/
  sw.js                      service worker
schema.graphql               copied from sms-server
```

## Design system

Everything visual goes through `src/components/ui.tsx` and the tokens in `src/app/globals.css`:

- **Tokens:** `--background`, `--surface`, `--subtle`, `--line`, `--ink`, `--muted` and `--brand`, each with a dark-mode value. `--brand` is replaced at runtime with the school's own colour; `--brand-ink` is a version of it that stays readable on dark backgrounds.
- **Components:** `Button`, `ButtonLink`, `Field`, `Input`, `Select`, `Textarea`, `Checkbox`, `SearchInput`, `Card`, `PageHeader`, `Stat`, `Table`/`TH`/`TD`, `RowLink`, `Tabs`, `Badge`, `StatusBadge`, `Notice`, `Empty`, `Skeleton`/`Loading`, `Dialog`, `ActionDialog`, `FormSection` and `FormActions`.
- **Confirmations:** use `ActionDialog`, never `window.prompt` or `window.confirm`. Actions that go into the audit log should ask for a reason.
- **Homepage:** has its own palette in `components/landing/landing.css`, loaded only on that page.

## Data fetching and types

Each screen declares its queries next to the code that uses them:

```tsx
const StudentsDocument = graphql(`
  query Students($search: String) { students(search: $search) { total items { id fullName } } }
`);

const { data } = useGql(StudentsDocument, { search });   // data is fully typed
```

After changing the server's API, regenerate the types:

```bash
npm run schema   # copies ../sms-server/schema.graphql and runs codegen
```

Forms that are seeded from fetched data use `useDerivedState`, not an effect, which keeps the React Compiler lint rules happy.

## Offline support

Score entry and attendance send their writes through `sendOrQueue` in `src/lib/outbox.ts`:

1. If the network is up, the write is sent straight away.
2. If the phone is offline, the write is saved in IndexedDB and the screen says "Saved on this device".
3. When the connection returns, queued writes are sent oldest first. Each one carries the time it was made on the device, and the server keeps whichever edit is newer.
4. Writes the server rejects, for example because results were locked in the meantime, are shown in a banner rather than silently dropped.

In production, `public/sw.js` caches the app shell and static assets, so a teacher can reopen the app without a connection.

## Conventions

- **Money** is whole kobo everywhere. Use `naira()` to display it and `toKobo()` to parse user input. Never use floating-point naira.
- **Phone numbers** are stored as `+234…` and shown with `localPhone()` as `0803 123 4567`.
- **Permissions:** hide what a role can't use with `can(...)` from `useSession()`. The server checks every request regardless.
- **File links** under `/files/` are plain `<a>` links (or `ButtonLink`), not client-side navigation.
- **Copy:** use plain language, name things the way Nigerian schools do (term, session, bursar, class arm), and write full sentences in notices.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint, including React Compiler rules |
| `npm run typecheck` | TypeScript check |
| `npm run schema` | Copy the server schema and regenerate GraphQL types |
| `npm run codegen` | Regenerate GraphQL types from the current `schema.graphql` |

## Deploying

1. Build with `npm run build` and run with `npm start`, or deploy to any Node host.
2. Set `API_ORIGIN` to the Django service, and `TENANT_BASE_DOMAIN` to your domain.
3. Serve the bare domain and `*.yourdomain` with a wildcard TLS certificate.
4. Make sure the Django side has the matching `TENANT_BASE_DOMAIN`, `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`.

Before launch, set the product name, price and contact details in `src/lib/site.ts`. The defaults are placeholders, and the footer's legal links need real pages.

## Licence

[MIT](LICENSE) © 2026 Adeeyo Michael
