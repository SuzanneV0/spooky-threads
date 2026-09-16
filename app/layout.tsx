import type { Metadata } from "next";
import Script from "next/script";
import { Ultra } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const ultra = Ultra({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ultra",
});

const description =
  "Halloween sweaters, tees, hats, mugs, and home decor. Shop Spooky Threads for cozy, spooky-cute apparel and gifts all season long.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Halloween Apparel & Home Goods`,
    template: `%s — ${SITE_NAME}`,
  },
  description,
  keywords: [
    "Halloween apparel",
    "Halloween sweaters",
    "spooky clothing",
    "Halloween home decor",
    "Halloween gifts",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Halloween Apparel & Home Goods`,
    description,
    url: SITE_URL,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Halloween Apparel & Home Goods`,
    description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ultra.variable}>
      <body>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="805b5da8-676d-4e0e-85c0-cd270a117465"
        />
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
