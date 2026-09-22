import Stripe from "stripe";

export function getStripeClient(apiKey: string) {
  return new Stripe(apiKey, { httpClient: Stripe.createFetchHttpClient() });
}
