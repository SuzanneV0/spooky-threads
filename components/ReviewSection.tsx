"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import { firstIssueMessage, reviewSchema } from "@/lib/validation";

type Review = Tables<"reviews">;

function Stars({ rating }: { rating: number }) {
  return <span className="stars">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

export default function ReviewSection({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const supabase = createClient();

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setStatus("Log in to leave a review.");
      return;
    }

    const parsed = reviewSchema.safeParse({ rating, title, body });
    if (!parsed.success) {
      setStatus(firstIssueMessage(parsed.error));
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        { product_id: productId, user_id: user.id, ...parsed.data },
        { onConflict: "product_id,user_id" }
      )
      .select()
      .single();

    if (error) {
      setStatus("Something went wrong submitting your review.");
      return;
    }
    setReviews((prev) => [data, ...prev.filter((r) => r.id !== data.id)]);
    setTitle("");
    setBody("");
    setStatus("Thanks for your review!");
  }

  return (
    <section className="reviews">
      <h2>
        Reviews {average && <span className="review-average">{average} ★ ({reviews.length})</span>}
      </h2>

      {reviews.length === 0 && <p style={{ color: "var(--color-muted-text)" }}>No reviews yet — be the first!</p>}

      <ul className="review-list">
        {reviews.map((review) => (
          <li key={review.id} className="card review-item">
            <Stars rating={review.rating} />
            {review.title && <strong>{review.title}</strong>}
            {review.body && <p>{review.body}</p>}
          </li>
        ))}
      </ul>

      <form className="review-form card" onSubmit={submitReview}>
        <h3>Write a review</h3>
        <label htmlFor="rating">Rating</label>
        <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <label htmlFor="review-title">Title</label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Great fit!"
          maxLength={120}
        />
        <label htmlFor="review-body">Review</label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Tell other shoppers what you think..."
          maxLength={2000}
        />
        <button className="button" type="submit">
          Submit review
        </button>
        {status && <p className="list-status">{status}</p>}
      </form>
    </section>
  );
}
