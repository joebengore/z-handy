import AdminNav from "@/components/admin/AdminNav";

export default function AdminAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
