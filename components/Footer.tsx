import Link from "next/link";
import { footerLinks } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">🎃 Spooky Threads</div>
          <p className="footer-copy">© {new Date().getFullYear()} Spooky Threads. All rights reserved.</p>
        </div>
        <ul className="footer-links">
          {footerLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
