import QuizExperience from "@/components/QuizExperience";

export const metadata = {
  title: "Which Halloween Trope Are You?",
  description:
    "Take the Spooky Threads quiz to find your Halloween trope and get product picks matched to your result.",
};

export default function QuizPage() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Which Halloween Trope Are You?</h1>
          <p>Answer a few questions and we'll match you to your spooky alter ego — plus a few picks to match.</p>
        </div>
      </section>

      <section className="container quiz-section">
        <QuizExperience />
      </section>
    </>
  );
}
