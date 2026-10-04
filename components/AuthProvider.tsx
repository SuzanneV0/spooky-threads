"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type Profile = {
  id: string;
  is_admin: boolean;
  halloween_trope: string | null;
  subscription_tier: string | null;
};

type AuthUser = { id: string; email: string | null; firstName: string | null };

type AuthContextValue = {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => {},
});

// Clerk owns the session; this adds the shopper's profile row from our own database on top.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const userId = isSignedIn && clerkUser ? clerkUser.id : null;
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const firstName = clerkUser?.firstName ?? null;
  // Stable object, so pages that re-fetch when `user` changes don't loop on every render.
  const user = useMemo<AuthUser | null>(
    () => (userId ? { id: userId, email, firstName } : null),
    [userId, email, firstName]
  );

  const load = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      setProfileLoaded(true);
      return;
    }
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      setProfile(data.profile ?? null);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoaded(true);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    setProfileLoaded(false);
    load();
  }, [isLoaded, userId, load]);

  return (
    <AuthContext.Provider value={{ user, profile, loading: !isLoaded || !profileLoaded, refresh: load }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
