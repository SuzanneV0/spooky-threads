"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import type { Tier } from "@/lib/subscriptionTiers";

export default function SubscriptionTiers({ tiers }: { tiers: Tier[] }) {
  const { user, profile, refresh } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("subscribed") === "1") {
      setBanner("Payment successful — activating your subscription…");
      const timer = setTimeout(async () => {
        await refresh();
        setBanner(null);
      }, 2000);
      router.replace("/subscriptions");
      return () => clearTimeout(timer);
    }
    if (searchParams.get("canceled") === "1") {
      setBanner("Checkout canceled — no charge was made.");
      router.replace("/subscriptions");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectTier(slug: string) {
    if (!user) return;
    setUpdating(slug);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setBanner(data.error ?? "Something went wrong starting checkout.");
        setUpdating(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setBanner("Something went wrong starting checkout.");
      setUpdating(null);
    }
  }

  async function cancelSubscription() {
    if (!user) return;
    setUpdating("cancel");
    setBanner(null);
    try {
      const res = await fetch("/api/subscribe/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setBanner(data.error ?? "Something went wrong cancelling your subscription.");
      } else {
        await refresh();
      }
    } catch {
      setBanner("Something went wrong cancelling your subscription.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <>
      {banner && <p className="pricing-banner">{banner}</p>}
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
                  {isBusy ? "Redirecting…" : profile?.subscription_tier ? "Switch to this plan" : "Get Started"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
