"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "Georgia, serif", textAlign: "center", padding: "4rem 1.5rem" }}>
        <h1>🎃 Something went wrong</h1>
        <p>We hit a snag loading this page. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "1rem", padding: "0.6rem 1.4rem", cursor: "pointer" }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
