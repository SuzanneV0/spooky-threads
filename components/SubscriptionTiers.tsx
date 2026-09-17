"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tier } from "@/lib/subscriptionTiers";

export default function SubscriptionTiers({ tiers }: { tiers: Tier[] }) {
  const { user, profile, refresh } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  async function selectTier(slug: string) {
    if (!user) return;
    setUpdating(slug);
    await supabase.from("profiles").update({ subscription_tier: slug }).eq("id", user.id);
    await refresh();
    setUpdating(null);
  }

  async function cancelSubscription() {
    if (!user) return;
    setUpdating("cancel");
    await supabase.from("profiles").update({ subscription_tier: null }).eq("id", user.id);
    await refresh();
    setUpdating(null);
  }

  return (
    <div className="grid pricing-grid">
      {tiers.map((tier) => {
        const isCurrent = profile?.subscription_tier === tier.slug;
        const isBusy = updating === tier.slug || (isCurrent && updating === "cancel");

        return (
          <div
            key={tier.slug}
            className={`card pricing-card${tier.featured ? " pricing-card-featured" : ""}`}
          >
            {isCurrent ? (
              <span className="tag pricing-badge pricing-badge-current">Current Plan</span>
            ) : (
              tier.featured && <span className="tag pricing-badge">Most Popular</span>
            )}
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
            {!user ? (
              <Link href="/login" className="button pricing-cta">
                Log in to subscribe
              </Link>
            ) : isCurrent ? (
              <button className="button secondary pricing-cta" onClick={cancelSubscription} disabled={isBusy}>
                {isBusy ? "Cancelling…" : "Cancel subscription"}
              </button>
            ) : (
              <button className="button pricing-cta" onClick={() => selectTier(tier.slug)} disabled={isBusy}>
                {isBusy ? "Subscribing…" : profile?.subscription_tier ? "Switch to this plan" : "Get Started"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
