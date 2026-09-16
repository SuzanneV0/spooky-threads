"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/queries";
import { quizQuestions, tallyResult, tropes, type TropeSlug } from "@/lib/quizTropes";

async function fetchRecommendations(tropeSlug: TropeSlug): Promise<Product[]> {
  const supabase = createClient();
  const { data: collection } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", tropeSlug)
    .single();
  if (!collection) return [];

  const { data: links } = await supabase
    .from("product_collections")
    .select("product_id")
    .eq("collection_id", collection.id)
    .limit(4);

  const ids = (links ?? []).map((l) => l.product_id);
  if (ids.length === 0) return [];

  const { data: products } = await supabase.from("products").select("*").in("id", ids).limit(4);
  return products ?? [];
}

export default function QuizExperience() {
  const { user, profile, refresh } = useAuth();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TropeSlug[]>([]);
  const [result, setResult] = useState<TropeSlug | null>(null);
  const [recommended, setRecommended] = useState<Product[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [pendingResult, setPendingResult] = useState<TropeSlug | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const savedTrope = profile?.halloween_trope as TropeSlug | null | undefined;
    if (savedTrope && tropes[savedTrope]) {
      setResult(savedTrope);
      setSaved(true);
    }
  }, [profile]);

  useEffect(() => {
    if (!result) {
      setRecommended(null);
      return;
    }
    fetchRecommendations(result).then(setRecommended);
  }, [result]);

  function selectOption(trope: TropeSlug) {
    const nextAnswers = [...answers, trope];

    if (questionIndex + 1 < quizQuestions.length) {
      setAnswers(nextAnswers);
      setQuestionIndex(questionIndex + 1);
      return;
    }

    setPendingResult(tallyResult(nextAnswers));
    setRevealing(true);
  }

  async function finishReveal() {
    setRevealing(false);
    if (!pendingResult) return;

    const res = await fetch("/api/quiz/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trope: pendingResult }),
    });

    if (res.status === 429) {
      setLimitReached(true);
      return;
    }

    setResult(pendingResult);
    if (user) {
      await refresh();
      setSaved(true);
    }
  }

  function retake() {
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setSaved(false);
    setRevealing(false);
    setPendingResult(null);
    setLimitReached(false);
  }

  if (revealing) {
    return (
      <div className="card quiz-reveal">
        <p className="quiz-reveal-text">Consulting the crystal ball…</p>
        <div className="quiz-reveal-track">
          <span className="quiz-reveal-witch" onAnimationEnd={finishReveal}>
            <span className="quiz-reveal-witch-figure">🧙‍♀️</span>
            <span className="quiz-reveal-broom">🧹</span>
          </span>
        </div>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="card quiz-reveal">
        <span className="quiz-reveal-limit-emoji">🔮</span>
        <p className="quiz-reveal-text">
          You've already taken the quiz twice today — the crystal ball needs to recharge. Come back tomorrow for
          another reading!
        </p>
      </div>
    );
  }

  if (result) {
    const trope = tropes[result];
    return (
      <div className="quiz-result">
        <div className="card quiz-result-card">
          <span className="quiz-result-emoji">{trope.emoji}</span>
          <p className="quiz-result-label">You are...</p>
          <h2>{trope.name}</h2>
          <p className="quiz-result-description">{trope.description}</p>
          {user ? (
            saved && <p className="quiz-result-note">Saved to your profile ✓</p>
          ) : (
            <p className="quiz-result-note">
              <Link href="/login">Log in</Link> to save this result to your profile.
            </p>
          )}
          <button className="button secondary small" onClick={retake}>
            Retake the quiz
          </button>
        </div>

        {recommended && recommended.length > 0 && (
          <div className="quiz-recommendations">
            <h3>Picks for {trope.plural}</h3>
            <div className="grid cols-4">
              {recommended.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const current = quizQuestions[questionIndex];

  return (
    <div className="quiz-card card">
      <p className="quiz-progress">
        Question {questionIndex + 1} of {quizQuestions.length}
      </p>
      <h2 className="quiz-question">{current.question}</h2>
      <div className="quiz-options">
        {current.options.map((option) => (
          <button key={option.label} className="quiz-option" onClick={() => selectOption(option.trope)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
