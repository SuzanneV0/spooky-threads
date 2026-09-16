import Link from "next/link";

export const metadata = {
  title: "Subscriptions",
  description:
    "Join the Spooky Threads subscription box and get new Halloween apparel delivered every month.",
};

const tiers = [
  {
    name: "Little Ghoul",
    price: 20,
    tagline: "A fresh tee, every month.",
    features: ["1 new T-shirt each month", "Free shipping", "Cancel anytime"],
  },
  {
    name: "Wicked Witch",
    price: 60,
    tagline: "Double the cozy, double the spooky.",
    features: [
      "1 new T-shirt each month",
      "1 new sweater each month",
      "Free shipping",
      "Cancel anytime",
    ],
    featured: true,
  },
  {
    name: "Grand Reaper",
    price: 75,
    tagline: "The full haunted haul, your way.",
    features: [
      "1 new T-shirt each month",
      "1 new sweater each month",
      "Your choice of mug, tumbler, hat, or beanie",
      "Free shipping",
      "Cancel anytime",
    ],
  },
];

export default function SubscriptionsPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Subscription Boxes</h1>
          <p>
            Join the coven and get new Halloween-worthy apparel delivered to your door every
            month — pick the tier that matches your level of spooky.
          </p>
        </div>
      </section>

      <section className="container pricing-section">
        <div className="grid pricing-grid">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`card pricing-card${tier.featured ? " pricing-card-featured" : ""}`}
            >
              {tier.featured && <span className="tag pricing-badge">Most Popular</span>}
              <h2 className="pricing-name">{tier.name}</h2>
              <p className="pricing-price">
                ${tier.price}
                <span className="pricing-cadence">/month</span>
              </p>
              <p className="pricing-tagline">{tier.tagline}</p>
              <ul className="pricing-features">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href="/signup" className="button pricing-cta">
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
