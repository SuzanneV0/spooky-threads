"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/account");
      router.refresh();
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="container auth-page">
        <div className="card auth-form">
          <h1>Check your email</h1>
          <p>We sent a confirmation link to {email}. Confirm your address to finish creating your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <label htmlFor="name">Full name</label>
        <input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="form-error">{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
