"use client";

import Link from "next/link";
import { mainNav } from "@/lib/nav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const { user, profile } = useAuth();
  const { count } = useCart();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          🎃 Spooky Threads
        </Link>

        <nav className="main-nav">
          {mainNav.map((section) => (
            <div className="nav-item" key={section.label}>
              <Link href={section.href}>{section.label}</Link>
              <div className="dropdown">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="header-actions">
          {profile?.is_admin && (
            <Link href="/admin" className="header-link">
              Admin
            </Link>
          )}
          <Link href={user ? "/account" : "/login"} className="header-link">
            {user ? "Account" : "Log in"}
          </Link>
          <Link href="/cart" className="header-link cart-link">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
