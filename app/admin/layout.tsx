import RequireAdmin from "@/components/RequireAdmin";
import AdminNav from "@/components/AdminNav";

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
