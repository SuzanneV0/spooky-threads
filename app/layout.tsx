import { Ultra } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ultra = Ultra({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ultra",
});

export const metadata = {
  title: "Spooky Threads",
  description: "Halloween apparel and home goods — practice project for AI chat + Stripe integration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ultra.variable}>
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
