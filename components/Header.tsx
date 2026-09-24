"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { mainNav } from "@/lib/nav";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const { user, profile } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const cartLabel = `Cart${count > 0 ? ` (${count})` : ""}`;

  function closeMenu() {
    setMenuOpen(false);
    setExpandedSection(null);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setExpandedSection(null);
      toggleRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo" onClick={closeMenu}>
          🎃 Spooky Threads
        </Link>

        <Link href="/cart" className="header-link header-cart-mobile" onClick={closeMenu}>
          {cartLabel}
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <div
          id="site-menu"
          className={`header-menu${menuOpen ? " open" : ""}`}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) closeMenu();
          }}
        >
          <nav className="main-nav">
            {mainNav.map((section) => {
              const expanded = expandedSection === section.label;
              return (
                <div className={`nav-item${expanded ? " expanded" : ""}`} key={section.label}>
                  <Link href={section.href}>{section.label}</Link>
                  {section.items.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="nav-expand"
                        aria-expanded={expanded}
                        aria-label={`${section.label} links`}
                        onClick={() => setExpandedSection(expanded ? null : section.label)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                      <div className="dropdown">
                        {section.items.map((item) => (
                          <Link key={item.href} href={item.href}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
              {cartLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
