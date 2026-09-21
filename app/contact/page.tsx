import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Spooky Threads about orders, subscriptions, or anything else.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container auth-page">
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Contact Us</h1>
        <ContactForm />
      </div>
    </div>
  );
}
