import { Suspense } from "react";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import { subscriptionTiers } from "@/lib/subscriptionTiers";

export const metadata = {
  title: "Subscriptions",
  description:
    "Join the Spooky Threads subscription box and get new Halloween apparel delivered every month.",
};

export default function SubscriptionsPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Subscription Boxes</h1>
          <p>
            Join the coven and get new Halloween-worthy apparel delivered to your door every
            month — pick the tier that matches your level of spooky. Subscribers also get
            unlimited tries at the Halloween trope quiz.
          </p>
        </div>
      </section>

      <section className="container pricing-section">
        <Suspense fallback={null}>
          <SubscriptionTiers tiers={subscriptionTiers} />
        </Suspense>
      </section>
    </>
  );
}
