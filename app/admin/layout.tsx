import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  const isSuperAdmin = userRole === 'superadmin' || session.user.email === 'far00queapril17@gmail.com';
  
  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-muted/10">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
