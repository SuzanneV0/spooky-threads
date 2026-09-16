import type { Metadata } from "next";
import RequireAuth from "@/components/RequireAuth";
import AccountNav from "@/components/AccountNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="container account-layout">
        <AccountNav />
        <div className="account-content">{children}</div>
      </div>
    </RequireAuth>
  );
}
