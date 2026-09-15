"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!profile?.is_admin) router.replace("/account");
  }, [loading, user, profile, router]);

  if (loading || !user || !profile?.is_admin) {
    return (
      <div className="container" style={{ padding: "3rem 1.25rem" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
