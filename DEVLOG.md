# Dev Log

Dated log of decisions and progress. Newest entry on top.

## 2026-09-12 (cont'd)

- Audited the user's existing paid CashBook app (web.cashbook.in) live via
  browser — every major section (ledger, filters, entry detail/actions,
  book settings, roles/permissions, Business Team, Business Payments/UPI
  wallets, Integrations, Subscription, Help Docs). Full findings captured
  in CLAUDE.md under "Reference: competitor audit". Highlights: two-tier
  role model (org-level + book-level) worth adopting; their "Passbook" auto
  bank-SMS-read feature is Android-only, confirming our statement-upload
  approach; "Integrations" there means Zoho Books/Tally sync — added as an
  idea for our own Integrations settings.

## 2026-09-12

- Repo `zeebas-cashbook-app` found (created 2026-06-15, empty except README)
  and renamed to `dot-cashbook-app`. Cloned locally to this folder, remote
  updated.
- Gathered full feature scope through a series of clarifying questions (see
  CLAUDE.md for the confirmed list). Key decisions locked in:
  - Full bookkeeping scope (parties, invoices, GST, receivables/payables).
  - Web app, responsive across mobile/tablet/desktop.
  - Multi-user login with Admin/Staff roles.
  - Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Supabase.
  - Deploy: GitHub → Vercel, instant deploy on push.
  - Theme: iOS "Liquid Glass" (frosted/translucent UI).
  - UPI/bank transactions: semi-automatic via statement upload + parse
    (real-time notification reading ruled out — not possible on iOS for any
    app, and out of scope for a web app on Android).
  - "MCP Connection settings" clarified to mean a normal Integrations
    settings page, not a literal MCP protocol feature.
  - Products/services catalog + Quotations, with GST and non-GST invoice
    options.
- Set up CLAUDE.md + this DEVLOG.md for cross-session/cross-account
  continuity — any Claude Code session opening this repo gets full context.
- Build not started — user has more requirements to share first.
