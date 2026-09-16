# Spooky Threads 🎃

A Halloween-themed apparel and home goods shop, built as a practice project for a course on integrating **AI chatbots** and **Stripe payments** into an online store. This is a dry run before the real store launches.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Supabase](https://supabase.com/) — database, auth, and admin backend
- [Stripe](https://stripe.com/docs) Checkout for payments
- [Anthropic API](https://docs.claude.com/) (`@anthropic-ai/sdk`, Claude Haiku 4.5) for the shopping assistant chatbot

## Getting started

```bash
npm install
npm run dev
```

`.env.local` already has the Supabase project URL and anon key filled in. Add your own `ANTHROPIC_API_KEY` (create one at [console.anthropic.com](https://console.anthropic.com) — new accounts get a small free credit) to turn on the chat assistant.

Checkout needs three more values in `.env.local`:
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (test mode)
- `STRIPE_WEBHOOK_SECRET` — run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` locally to get one, or add a webhook endpoint in the Stripe dashboard pointing at `<your-deployed-url>/api/webhooks/stripe` (subscribed to `checkout.session.completed`) and use the signing secret it gives you
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase → Project Settings → API. Used only by the webhook handler (`lib/supabase/admin.ts`) to write the order after payment succeeds, since Stripe calls that route with no logged-in session.

## What's built

- **Storefront**: home page with 3 product rows, full nav (Collections, Women, Men, Accessories, Home Decor) matching the site's collection structure, 22 collections seeded across themes/categories/departments, 33 sample products with fake pricing and hand-illustrated SVG art in the brand color palette (`app/globals.css`, `lib/productArt.ts`).
- **Product pages**: quantity selector, add to cart, save for later, add to wishlist, wash instructions, and a reviews/ratings section.
- **Cart**: guest cart stored in the browser (`components/CartProvider.tsx`). Checkout requires being logged in, creates a Stripe Checkout Session (`app/api/checkout/route.ts`) with prices looked up server-side (never trusts the client), and a webhook (`app/api/webhooks/stripe/route.ts`) creates the `orders`/`order_items` rows once payment completes.
- **Accounts**: sign up / log in via Supabase Auth, with an account area for saved items, wishlist, addresses, and order history (`app/account/*`).
- **Admin**: `/admin` (gated to accounts with `is_admin = true` on their profile) for managing products and order statuses.
- **Static pages**: About, Privacy Policy, Cookies, Shipping Information, Order Information, Return Policy.
- **Chat assistant**: a floating widget (`components/ChatWidget.tsx`) backed by the Anthropic API (`app/api/chat/route.ts`), grounded in the live product catalog so it only recommends real products and links to them. Rate-limited to 5 messages/day per visitor.
- **Halloween trope quiz**: `/quiz` matches shoppers to one of five tropes, saves the result to their profile if logged in, and recommends products from the matching collection. Rate-limited to 2 completions/day per visitor.
- **Subscriptions**: `/subscriptions` — three recurring apparel-box tiers.
- **Rate limiting**: `lib/rateLimit.ts` + a `check_and_increment_usage` Postgres function enforce the AI-feature daily limits server-side, keyed by account (logged in) or an anonymous cookie (guests) — so it can't be bypassed by clearing client state.

## Becoming an admin

Sign up for an account on the site, then in the Supabase SQL editor (or ask Claude) run:

```sql
update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
```

## Project structure

- `app/` — pages (App Router)
- `components/` — shared UI, providers (auth, cart), product art
- `lib/queries.ts` — server-side Supabase data fetching
- `lib/nav.ts` — the site's nav/footer link structure
- `lib/productArt.ts` — per-product illustration color + motif mapping

## Roadmap

- [x] Wire up an AI shopping assistant (`app/api/chat/route.ts`)
- [x] Wire up Stripe Checkout (`app/api/checkout/route.ts`) and move the cart to real checkout
- [x] Stripe webhook handling to create real `orders` rows
- [ ] Replace illustrated SVG product art with real photography
