"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container" style={{ textAlign: "center", padding: "4rem 1.25rem" }}>
      <h1>🎃 Something went wrong</h1>
      <p style={{ color: "var(--color-muted-text)" }}>
        We hit a snag loading this page. Please try again.
      </p>
      <button className="button" onClick={() => reset()} style={{ marginTop: "1.5rem" }}>
        Try again
      </button>
    </div>
  );
}
