import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { supabase } from "@/lib/supabase";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 1. Sync user profile for Admin (Universal Sync) and Checking Role
  // We use currentUser() for a more reliable check of Metadata and Email than auth()
  const user = await currentUser();
  
  // Strict check for superadmin role OR the specific owner ID/email
  const role = (user?.publicMetadata as any)?.role;
  const email = user?.primaryEmailAddress?.emailAddress;
  const isAdminEmail = (email === 'far00queapril17@gmail.com');
  const isSuperAdmin = role === 'superadmin' || userId === '48c52067-23b6-412c-a17b-1e7de8bc4f98' || isAdminEmail;
  if (userId && user) {
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        clerk_id: userId,
        email: email || '',
        full_name: `${user.firstName} ${user.lastName}`,
        avatar_url: user.imageUrl,
        role: role || (isAdminEmail ? 'superadmin' : 'user')
      }, { onConflict: 'id' });
    } catch (e) {
      console.error("Admin Profile Sync failed:", e);
    }
  }

  // 2. Fetch the role from the database to be 100% sure
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  const finalIsAdmin = isSuperAdmin || profile?.role === 'superadmin';
  
  if (!finalIsAdmin) {
    // Redirect non-admins to the standard dashboard
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
