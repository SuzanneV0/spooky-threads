# Spooky Threads 🎃

A Halloween-themed apparel shop, built as a practice project for a course on integrating **AI chatbots** and **Stripe payments** into an online store. This is a dry run before the real store launches.

## Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Stripe](https://stripe.com/docs) for checkout/payments
- An LLM API (OpenAI or Claude) for the shopping assistant chatbot

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your API keys
npm run dev
```

## Project structure

- `app/page.tsx` — storefront home page
- `app/api/chat/route.ts` — stub endpoint for the AI shopping assistant (not yet wired up)
- `app/api/checkout/route.ts` — stub endpoint for Stripe Checkout (not yet wired up)
- `lib/products.ts` — sample product catalog
- `components/ProductCard.tsx` — product display component

## Roadmap

- [ ] Wire up `app/api/chat` to an LLM for a shopping assistant
- [ ] Wire up `app/api/checkout` to Stripe Checkout Sessions
- [ ] Add a cart
- [ ] Add order confirmation + Stripe webhook handling
