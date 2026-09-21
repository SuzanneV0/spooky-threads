"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    grecaptcha?: {
      getResponse: (widgetId?: number) => string;
      reset: (widgetId?: number) => void;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const recaptchaToken = RECAPTCHA_SITE_KEY ? window.grecaptcha?.getResponse() : undefined;
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setError("Please confirm you're not a robot.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, messageType, message, recaptchaToken }),
    });
    setLoading(false);

    if (!response.ok) {
      setError("Something went wrong sending your message. Please try again.");
      window.grecaptcha?.reset();
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="card auth-form">
        <h1>Message sent!</h1>
        <p>Thanks for reaching out — we&apos;ll get back to you as soon as we can.</p>
      </div>
    );
  }

  return (
    <form className="card auth-form contact-form" onSubmit={handleSubmit}>
      {RECAPTCHA_SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
      )}

      <label htmlFor="name">Name</label>
      <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="email">Email</label>
      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="messageType">What's this about?</label>
      <select
        id="messageType"
        required
        value={messageType}
        onChange={(e) => setMessageType(e.target.value)}
      >
        <option value="" disabled>
          Select a topic
        </option>
        <option value="general">General inquiry</option>
        <option value="orders">Orders</option>
        <option value="subscriptions">Subscriptions</option>
        <option value="other">Other comments</option>
      </select>

      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        required
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {RECAPTCHA_SITE_KEY && <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} />}

      {error && <p className="form-error">{error}</p>}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
