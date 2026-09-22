"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Something went wrong sending the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="container auth-page">
        <div className="card auth-form">
          <h1>Check your email</h1>
          <p>If an account exists for {email}, we sent a link to reset the password.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Forgot your password?</h1>
        <p>Enter your email and we&apos;ll send you a reset link.</p>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <p className="form-error">{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <p className="auth-switch">
          <Link href="/login">Back to log in</Link>
        </p>
      </form>
    </div>
  );
}
