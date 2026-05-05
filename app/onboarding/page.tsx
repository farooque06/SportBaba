"use client"

import { registerFacility } from "@/lib/actions/facility";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [facilityName, setFacilityName] = useState("");

  // Redirect Superadmin
  useEffect(() => {
    if (session?.user?.email === 'far00queapril17@gmail.com' || (session?.user as any)?.role === 'superadmin') {
      router.push("/admin");
    }
  }, [session, router]);

  const handleFinalize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await registerFacility(formData);
      
      if (result && result.success) {
        router.push("/dashboard");
      } else {
        alert(result?.error || "Could not save your Hub.");
      }
    } catch (error: any) {
      alert(error.message || "A critical error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="max-w-xl w-full">
        <Card className="p-10 shadow-2xl rounded-[48px] border-primary/20 bg-card relative overflow-hidden group animate-in slide-in-from-bottom-10 duration-700">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

          <div className="mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-foreground mb-4 leading-tight">Create Your Facility Hub</h1>
            <p className="text-muted-foreground font-medium italic">Welcome, <span className="text-primary font-black uppercase">{session?.user?.name || 'Partner'}</span>. Let's set up your sports facility command center.</p>
          </div>

          <form onSubmit={handleFinalize} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Facility Business Name</label>
              <input 
                required
                name="name"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="e.g. Kathmandu Sports Hub"
                className="w-full h-16 bg-muted border border-border/50 rounded-3xl px-8 text-lg font-bold outline-none focus:ring-4 ring-primary/10 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Facility Type</label>
              <div className="grid grid-cols-1 gap-4">
                <label className="relative flex items-center p-6 rounded-3xl bg-muted border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="sport_type" value="football" className="sr-only" defaultChecked />
                  <div className="flex-1">
                    <p className="text-xl font-black">Footshall Only</p>
                    <p className="text-sm text-muted-foreground">Focus exclusively on Football pitches and leagues.</p>
                  </div>
                </label>
                <label className="relative flex items-center p-6 rounded-3xl bg-muted border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="sport_type" value="cricket" className="sr-only" />
                  <div className="flex-1">
                    <p className="text-xl font-black">Cricshall Only</p>
                    <p className="text-sm text-muted-foreground">Dedicated management for Cricket nets and tournaments.</p>
                  </div>
                </label>
                <label className="relative flex items-center p-6 rounded-3xl bg-muted border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="sport_type" value="both" className="sr-only" />
                  <div className="flex-1">
                    <p className="text-xl font-black">Combined Hub (Recommended)</p>
                    <p className="text-sm text-muted-foreground">Manage both Football and Cricket Hubs in one dashboard.</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-20 text-xl rounded-[28px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? "Initializing Hub..." : "Launch My Dashboard"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
