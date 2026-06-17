import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminMobileNav } from "@/components/layout/AdminMobileNav";

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
  const isSuperAdmin = userRole === 'superadmin' || session.user.email?.toLowerCase() === 'far00queapril17@gmail.com';
  
  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-y-auto w-full pt-[72px] md:pt-10 p-4 md:p-10 pb-32 md:pb-10 bg-muted/10">
        <div className="print:hidden">
          <AdminMobileNav />
        </div>
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
