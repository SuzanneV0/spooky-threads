# Spooky Threads 🎃

A Halloween-themed apparel and home goods shop, built as a practice project for a course on integrating **AI chatbots** and **Stripe payments** into an online store. This is a dry run before the real store launches.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Supabase](https://supabase.com/) — database, auth, and admin backend
- [Stripe](https://stripe.com/docs) for checkout/payments (not yet wired up)
- An LLM API (OpenAI or Claude) for the shopping assistant chatbot (not yet wired up)

## Getting started

```bash
npm install
npm run dev
```

`.env.local` already has the Supabase project URL and anon key filled in. Add your Stripe and OpenAI keys there when you get to those lessons.

## What's built

- **Storefront**: home page with 3 product rows, full nav (Collections, Women, Men, Accessories, Home Decor) matching the site's collection structure, 22 collections seeded across themes/categories/departments, 33 sample products with fake pricing and hand-illustrated SVG art in the brand color palette (`app/globals.css`, `lib/productArt.ts`).
- **Product pages**: quantity selector, add to cart, save for later, add to wishlist, wash instructions, and a reviews/ratings section.
- **Cart**: guest cart stored in the browser (`components/CartProvider.tsx`) — checkout button is a placeholder until Stripe is wired up.
- **Accounts**: sign up / log in via Supabase Auth, with an account area for saved items, wishlist, addresses, and order history (`app/account/*`).
- **Admin**: `/admin` (gated to accounts with `is_admin = true` on their profile) for managing products and order statuses.
- **Static pages**: About, Privacy Policy, Cookies, Shipping Information, Order Information, Return Policy.

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

- [ ] Wire up an AI shopping assistant (`app/api/chat/route.ts`)
- [ ] Wire up Stripe Checkout (`app/api/checkout/route.ts`) and move the cart to real checkout
- [ ] Stripe webhook handling to create real `orders` rows
- [ ] Replace illustrated SVG product art with real photography
