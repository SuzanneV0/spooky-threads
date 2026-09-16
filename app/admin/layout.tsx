import type { Metadata } from "next";
import RequireAdmin from "@/components/RequireAdmin";
import AdminNav from "@/components/AdminNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="container account-layout">
        <AdminNav />
        <div className="account-content">{children}</div>
      </div>
    </RequireAdmin>
  );
}
