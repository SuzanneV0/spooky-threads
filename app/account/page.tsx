"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { tropes, type TropeSlug } from "@/lib/quizTropes";
import { getTierBySlug } from "@/lib/subscriptionTiers";

export default function AccountOverview() {
  const { user, profile } = useAuth();
  const trope = profile?.halloween_trope ? tropes[profile.halloween_trope as TropeSlug] : null;
  const tier = getTierBySlug(profile?.subscription_tier);

  return (
    <div>
      <h1>Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
      <p style={{ color: "var(--color-muted-text)" }}>{user?.email}</p>
      <div className="grid cols-3" style={{ marginTop: "2rem" }}>
        <Link href="/quiz" className="card account-tile">
          <h3>Your Halloween Trope</h3>
          <p>{trope ? `${trope.emoji} You're ${trope.name}.` : "Take the quiz to find out."}</p>
        </Link>
        <Link href="/subscriptions" className="card account-tile">
          <h3>Subscription</h3>
          <p>{tier ? `${tier.name} — $${tier.price}/month` : "Not subscribed."}</p>
        </Link>
        <Link href="/account/saved" className="card account-tile">
          <h3>Saved for later</h3>
          <p>Items you're not ready to buy yet.</p>
        </Link>
        <Link href="/account/wishlist" className="card account-tile">
          <h3>Wishlist</h3>
          <p>Things you're hoping to get.</p>
        </Link>
        <Link href="/account/addresses" className="card account-tile">
          <h3>Addresses</h3>
          <p>Manage your shipping addresses.</p>
        </Link>
        <Link href="/account/orders" className="card account-tile">
          <h3>Orders</h3>
          <p>Track your past and current orders.</p>
        </Link>
      </div>
    </div>
  );
}
