"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/saved", label: "Saved for later" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  async function logout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="account-nav">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
          {link.label}
        </Link>
      ))}
      <button className="button secondary small" onClick={logout}>
        Log out
      </button>
    </nav>
  );
}
