import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { SportProvider } from "@/components/providers/SportProvider";
import { QuickActionFab } from "@/components/ui/QuickActionFab";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let authData: any = { orgId: null, userId: null };
  try {
    authData = await auth();
  } catch (e) {
    console.error("Clerk Auth Fetch Failed:", e);
  }

  const { orgId, userId, sessionClaims } = authData as any;

  // 0. Superadmin Redirect: If platform owner, bypass facility dashboard and go to Admin Hub
  // We use currentUser() for a more reliable check of Metadata and Email than auth()
  const user = await currentUser();
  
  if (userId && user) {
    const role = (user.publicMetadata as any)?.role || (sessionClaims?.metadata as any)?.role;
    const email = user.primaryEmailAddress?.emailAddress;
    const isAdminEmail = (email === 'far00queapril17@gmail.com');
    const isSuperAdmin = role === 'superadmin' || isAdminEmail || userId === '48c52067-23b6-412c-a17b-1e7de8bc4f98';

    if (isSuperAdmin) {
      console.log(`[DashboardLayout] Admin detected (${email}). Redirecting to /admin`);
      redirect("/admin");
    }

    // 1. Sync user profile to Supabase (Safe check)
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        clerk_id: userId,
        email: email,
        full_name: `${user.firstName} ${user.lastName}`,
        avatar_url: user.imageUrl,
        role: role || (isAdminEmail ? 'superadmin' : 'user')
      }, { onConflict: 'id' });
    } catch (e) {
      console.error("Supabase Profile Sync failed:", e);
    }
  }

  if (!orgId) redirect("/onboarding");

  // 2. Fetch facility status
  const { data: facility } = await supabase
    .from('facilities')
    .select('subscription_status, trial_end, sport_type, status')
    .eq('id', orgId)
    .maybeSingle();

  if (!facility) redirect("/onboarding");

  // 2.5 Approval Guard
  const isPending = facility?.status === 'pending';
  const isSuspended = facility?.status === 'suspended';

  if (isPending || isSuspended) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-8 font-sans overflow-hidden">
        <div className="relative max-w-lg w-full text-center space-y-10 animate-in fade-in zoom-in duration-1000">
           {/* Animated Background Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-pulse-soft -z-10" />

          <div className="space-y-6">
            <div className="h-28 w-28 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent rounded-[32px] flex items-center justify-center mx-auto border border-primary/20 shadow-2xl shadow-primary/10 rotate-3 hover:rotate-0 transition-transform duration-700">
              {isPending ? (
                <AlertCircle className="h-12 w-12 text-primary animate-pulse" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            
            <div className="space-y-3">
              <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8]">
                {isPending ? "Under Review" : "Access Denied"}
              </h1>
              <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase pt-2">
                {isPending ? "Security Verification in Progress" : "Account Status: Suspended"}
              </p>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[40px] border-primary/10 bg-card/60 backdrop-blur-xl relative overflow-hidden">
            <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
              {isPending 
                ? "Your organization is currently being verified by our security team. This process ensures the integrity of the SportBaba community. You'll receive full access once approved."
                : "Your access to the SportBaba platform has been suspended. Please contact support or your account manager for more information regarding this status."}
            </p>
            
            <div className="space-y-4 pt-4 border-t border-border/50">
               <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Authenticated As</p>
                <OrganizationSwitcher 
                  afterCreateOrganizationUrl="/dashboard"
                  afterSelectOrganizationUrl="/dashboard"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      organizationSwitcherTrigger: "w-full justify-center h-12 rounded-[20px] bg-background border-border/50",
                    }
                  }}
                />
              </div>
              <a href="mailto:support@sportbaba.com" className="block py-4 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                Contact Support Hub
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Security Guard (Subscription Gating)
  const isTrialActive = facility?.subscription_status === 'trialing' && 
                        new Date(facility.trial_end) > new Date();
  const isSubscribed = facility?.subscription_status === 'active';

  // Hard Gate
  if (!isTrialActive && !isSubscribed && facility) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-8 font-sans">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter italic uppercase text-foreground leading-[0.9]">Subscription Required</h1>
            <p className="text-muted-foreground font-bold text-sm tracking-tight opacity-80 uppercase pt-2">Your access has expired</p>
          </div>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Your free trial has ended or your subscription is currently inactive. Please subscribe to continue managing your sports facility.
          </p>
          <div className="space-y-4 pt-4">
            <Button variant="primary" className="w-full h-16 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group">
              <CreditCard className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Unlock Dashboard
            </Button>
            <div className="pt-4 border-t border-border flex flex-col items-center gap-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Switch Organization</p>
              <OrganizationSwitcher 
                afterCreateOrganizationUrl="/dashboard"
                afterSelectOrganizationUrl="/dashboard"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SportProvider facilityType={facility?.sport_type}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar 
          subscriptionStatus={facility?.subscription_status} 
          trialEnd={facility?.trial_end} 
        />
        <MobileNav />
        <main className="flex-1 overflow-y-auto w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 pb-32 md:pb-12 bg-muted/10">
          {children}
        </main>
        <QuickActionFab />
      </div>
    </SportProvider>
  );
}


