# DOT Cash Book App — Project Context

This file is auto-loaded by Claude Code whenever this repo is opened, from any
machine or account. It exists so work on this project can continue seamlessly
across sessions/devices — read this first before doing anything else.

See [DEVLOG.md](./DEVLOG.md) for the dated session-by-session history.

## What this is

A full bookkeeping cash book web app for DOT Advertising, replacing manual
cash book registers. Multi-user, GST-aware, works on mobile/tablet/web.

## Confirmed decisions

- **Scope:** Full bookkeeping — not just a simple in/out tracker. Includes
  parties, invoices/quotations, GST, receivables/payables.
- **Platform:** Web app (responsive — mobile, tablet, desktop). No native app.
- **Auth:** Multi-user login. Roles: Admin (full access), Staff (limited —
  entry only, no delete/reports).
- **Tech stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS +
  shadcn/ui + Supabase (Postgres DB + Auth + Storage for receipts) + Recharts
  for dashboard charts.
- **Hosting/deploy:** GitHub repo → Vercel, connected for instant deploy on
  every push.
- **GitHub repo:** https://github.com/maildotadvertising-del/dot-cashbook-app
  (renamed from `zeebas-cashbook-app`; was empty except README when we
  started).
- **Theme:** iOS "Liquid Glass" style — translucent/frosted glass UI
  (backdrop-filter blur, layered translucency), Apple-style.

## Feature list (confirmed)

1. **Auth & Users** — Supabase Auth, Admin/Staff roles, one workspace per
   business, multiple staff can log in and see shared data.
2. **Dashboard** — cash balance, bank balance, total receivables/payables,
   income vs expense chart, recent transactions, low-balance/overdue alerts.
3. **Accounts (cash book core)** — multiple accounts (Cash, Bank(s), Petty
   Cash), Receipt/Payment/Contra entries, running balance, date-wise ledger,
   attach receipt/bill photo to entries.
4. **Parties (customers & suppliers)** — contacts with opening balance,
   party-wise ledger/statement, outstanding receivables/payables with due
   dates.
5. **Products/Services catalog** — business items to attach to
   quotations/invoices.
6. **Quotations & Invoices** — create quotations, convert to GST invoices
   (CGST/SGST/IGST calc, auto invoice numbering) **or** non-GST invoices
   (toggle per invoice) — record purchase bills from suppliers, mark
   Paid/Partial/Unpaid, PDF generation & share.
7. **Categories & transactions** — custom income/expense categories, search
   and filter by date/party/category/account.
8. **UPI/bank auto-capture (semi-automatic)** — user uploads bank/UPI
   statement (PDF/CSV) periodically; app parses and bulk-imports transactions
   as in/out entries, extracting the UPI note/description automatically into
   each entry. (Real-time notification/SMS reading is not used: iOS never
   allows any app to read another app's notifications/SMS, and this is a web
   app so the Android-only Notification Listener approach is also out —
   statement upload/parse is the cross-platform approach.)
9. **Reports** — P&L, cash flow, party-wise outstanding, GST summary, export
   to Excel/PDF.
10. **Settings** — business profile (name, GST no., logo, address for
    invoices), manage users, manage categories/accounts, **Integrations**
    section (connection management for bank/UPI/future integrations — not a
    literal MCP protocol feature, just called "MCP Connection settings" by
    the user informally).

## Explicitly ruled out / clarified

- No native Android/iOS app — web-only, responsive.
- No real-time UPI notification capture — technically impossible on iOS for
  any app, and out of scope for a web app on Android too. Statement
  upload+parse instead.
- "MCP Connection settings" = a normal integrations settings page, not a
  literal Model Context Protocol server connection.

## Status

Planning complete for the items above. Build has **not started yet** — the
user has more requirements to share before implementation begins. Do not
scaffold the Next.js project until the user explicitly says to start building.

## Working agreement

- Keep this file and DEVLOG.md updated as decisions are made or features are
  added/changed, so any future session (any account) has full context just by
  opening this repo.
- Commit and push progress regularly so GitHub is always the source of truth.
