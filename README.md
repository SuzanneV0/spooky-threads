# Spooky Threads 🎃

A Halloween-themed apparel and home goods shop, built as a practice project for a course on integrating **AI chatbots** and **Stripe payments** into an online store. This is a dry run before the real store launches.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Turso](https://turso.tech/) (libSQL/SQLite) — database
- [Clerk](https://clerk.com/) — sign-up, sign-in (email/password and Google) and password resets
- [Stripe](https://stripe.com/docs) Checkout for payments
- [Anthropic API](https://docs.claude.com/) (`@anthropic-ai/sdk`, Claude Haiku 4.5) for the shopping assistant chatbot
- [Resend](https://resend.com/) for transactional email (welcome, order confirmation)
- [Sentry](https://sentry.io/) for error monitoring, installed via Vercel's native integration

## Getting started

```bash
npm install
npm run db:migrate   # create the tables in your Turso database
npm run db:seed      # load the product catalog from db/catalog.json
npm run dev
```

`.env.local` needs these to run at all:
- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` — from the [Turso dashboard](https://app.turso.tech/): open the database, copy its URL (`libsql://…`) and click **Create Token**. The token is server-only; the browser never talks to the database directly, only through the app's API routes.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from the [Clerk dashboard](https://dashboard.clerk.com/) → API keys (`clerk init` writes these for you).

Add your own `ANTHROPIC_API_KEY` (create one at [console.anthropic.com](https://console.anthropic.com) — new accounts get a small free credit) to turn on the chat assistant.

Checkout needs three more values in `.env.local`:
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (test mode)
- `STRIPE_WEBHOOK_SECRET` — run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` locally to get one, or add a webhook endpoint in the Stripe dashboard pointing at `<your-deployed-url>/api/webhooks/stripe` (subscribed to `checkout.session.completed`) and use the signing secret it gives you

Transactional email needs one more value:
- `RESEND_API_KEY` — from the [Resend dashboard](https://resend.com/api-keys). Sending also requires verifying a domain in Resend (Domains → Add Domain) and adding the SPF/DKIM records it gives you at your DNS provider — until that's done, `lib/email/send.ts` logs a warning and skips sending instead of failing the request. Emails are currently sent from `hello@spookythreads.store` (`EMAIL_FROM` in `lib/site.ts`).

The contact form's spam protection needs two more values:
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` — register the site (v2 "I'm not a robot" checkbox) at the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin). Without these, `/contact` skips rendering the widget and the API route skips verification — fine for local dev, but set them in production.

Error monitoring needs four more values, all provisioned automatically in Vercel by the Sentry integration (Vercel dashboard → Project → Integrations → Sentry → Connect to Project) — pull them into `.env.local` with `vc env pull` if you want errors reported locally too:
- `NEXT_PUBLIC_SENTRY_DSN` — where the SDK sends events. Safe to expose client-side; it's a write-only ingestion address, not a secret.
- `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` — used at build time to upload source maps so stack traces in Sentry show real code instead of minified output.

## What's built

- **Storefront**: home page with 3 product rows, full nav (Collections, Women, Men, Accessories, Home Decor) matching the site's collection structure, 22 collections seeded across themes/categories/departments, 33 sample products with fake pricing and real photography (`public/products/`, `components/ProductPhoto.tsx`) — falling back to hand-illustrated SVG art in the brand color palette (`components/ProductArt.tsx`, `lib/productArt.ts`) if a photo fails to load.
- **Product pages**: quantity selector, add to cart, save for later, add to wishlist, wash instructions, and a reviews/ratings section.
- **Cart**: guest cart stored in the browser (`components/CartProvider.tsx`). Checkout requires being logged in, creates a Stripe Checkout Session (`app/api/checkout/route.ts`) with prices looked up server-side (never trusts the client), and a webhook (`app/api/webhooks/stripe/route.ts`) creates the `orders`/`order_items` rows once payment completes.
- **Accounts**: sign up / log in via Clerk (`/sign-in`, `/sign-up`; the old `/login` and `/signup` URLs redirect there), with an account area for saved items, wishlist, addresses, and order history (`app/account/*`).
- **Admin**: `/admin` (gated to accounts with `is_admin = true` on their profile) for managing products and order statuses.
- **Static pages**: About, Terms of Service, Privacy Policy, Cookies, Shipping Information, Order Information, Return Policy.
- **Programmatic SEO**: `/whimsical-goth` is a pillar page targeting "whimsical goth year round", linking out to four hand-written seasonal pages (`/whimsical-goth/spring|summer|fall|winter`) that each pull a real product row from a matching collection. All five are in `app/sitemap.ts` and linked from the footer.
- **Chat assistant**: a floating widget (`components/ChatWidget.tsx`) backed by the Anthropic API (`app/api/chat/route.ts`), grounded in the live product catalog so it only recommends real products and links to them. Rate-limited to 5 messages/day per visitor.
- **Halloween trope quiz**: `/quiz` matches shoppers to one of five tropes, saves the result to their profile if logged in, and recommends products from the matching collection. Rate-limited to 2 completions/day per visitor — unlimited for subscribers.
- **Subscriptions**: `/subscriptions` — three tiers with real recurring billing via Stripe Checkout (`mode: "subscription"`, `app/api/subscribe/route.ts`). Subscribing or switching plans redirects to Stripe; the webhook (`checkout.session.completed`) activates it on `profiles.subscription_tier`, which the quiz gate checks. Switching plans starts a new subscription and only cancels the old one once the new one is confirmed paid (via a `previous_subscription_id` carried in the session metadata) — so an abandoned checkout never leaves someone double-billed or without an active plan. Cancelling (`app/api/subscribe/cancel/route.ts`) cancels the Stripe subscription immediately — no proration/refund handling, which is out of scope for a course project.
- **Rate limiting**: `lib/rateLimit.ts` and a single atomic upsert on the `feature_usage` table enforce the AI-feature daily limits server-side, keyed by account (logged in) or an anonymous cookie (guests) — so it can't be bypassed by clearing client state.
- **Transactional email**: sent via [Resend](https://resend.com/) using a shared branded HTML layout (`lib/email/layout.ts`) in the site's own color palette. Two emails: a welcome email the first time a new account is seen (`getOrCreateProfile` in `lib/auth.ts`), and an order confirmation sent from the Stripe webhook once an order is created. Password resets are handled by Clerk. Sending is best-effort: if `RESEND_API_KEY` isn't set or a domain isn't verified yet, it logs and moves on rather than blocking signup or checkout.
- **Contact form**: `/contact` (`components/ContactForm.tsx`), linked only from the footer. Name, email, a topic dropdown (general inquiry, orders, subscriptions, other), and a message — gated by a reCAPTCHA v2 checkbox verified server-side (`app/api/contact/route.ts`) before the message is emailed to `CONTACT_EMAIL` (`lib/site.ts`) via the same Resend layout used elsewhere.
- **Error monitoring**: [Sentry](https://sentry.io/), installed via Vercel's native integration. `instrumentation.ts` + `instrumentation-client.ts` capture unhandled errors from server, edge (`middleware.ts`), and client code; `app/error.tsx` and `app/global-error.tsx` catch React rendering errors and report them via `Sentry.captureException` while showing a branded fallback instead of a blank crash screen. `next.config.ts` uploads source maps at build time so stack traces show real code.

## Becoming an admin

Sign up for an account on the site, then find your user id (`user_…`) in the [Clerk dashboard](https://dashboard.clerk.com/) → Users, and run this in the Turso dashboard's SQL console (or ask Claude):

```sql
UPDATE profiles SET is_admin = 1 WHERE id = 'user_...';
```

## Project structure

- `app/` — pages (App Router)
- `components/` — shared UI, providers (auth, cart), product art
- `db/schema.sql` — the database tables; `db/catalog.json` — the product catalog (`npm run db:seed`)
- `lib/db/client.ts` — the server-only Turso client; `lib/queries.ts` — catalog queries; `lib/auth.ts` — Clerk session + profile helpers
- `app/api/` — every database write from the browser goes through a route here, scoped to the signed-in user
- `lib/nav.ts` — the site's nav/footer link structure
- `lib/productArt.ts` — per-product illustration color + motif mapping

## Roadmap

- [x] Wire up an AI shopping assistant (`app/api/chat/route.ts`)
- [x] Wire up Stripe Checkout (`app/api/checkout/route.ts`) and move the cart to real checkout
- [x] Stripe webhook handling to create real `orders` rows
- [x] Replace illustrated SVG product art with real photography (SVG art now only shows as a fallback if a product photo fails to load)
- [x] Transactional email via Resend (welcome, order confirmation, password reset) — needs a verified sending domain in Resend before it'll actually deliver, see `RESEND_API_KEY` above
- [x] Contact form with reCAPTCHA spam protection (`/contact`) — needs `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` in production, see above
- [x] Error monitoring via Sentry (Vercel native integration) — see env vars above
