import { auth } from "@clerk/nextjs/server";
import { Card } from "@/components/ui/Card";
import { Users, Shield, ShieldCheck, User, Lock } from "lucide-react";
import { fetchMembers } from "@/lib/actions/members";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { MembersHub } from "@/components/members/MembersHub";

export default async function MembersPage() {
  const { orgId } = await auth();
  const role = await getCurrentUserRole();

  if (!orgId) return null;

  // Route Protection: Admin Only
  if (role !== 'owner' && role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 mesh-gradient rounded-[48px] border border-border/20">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto font-bold uppercase tracking-widest opacity-60">Member management is only accessible by facility owners and managers.</p>
        </div>
        <a href="/dashboard" className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all outline-none">
          Return to Dashboard
        </a>
      </div>
    );
  }

  const members = await fetchMembers(orgId);
  const ownerCount = members.filter((m: any) => m.role === 'owner').length;
  const staffCount = members.filter((m: any) => m.role === 'staff' || m.role === 'manager').length;
  const playerCount = members.filter((m: any) => m.role === 'player').length;

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20 mesh-gradient p-1 rounded-[48px] overflow-hidden">
      
      {/* Interactive Hub */}
      <MembersHub 
        members={members} 
        facilityId={orgId} 
        currentUserRole={role || 'staff'} 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1 md:px-2">
        {[
          { label: "Total Members", value: members.length, color: "text-foreground", icon: Users },
          { label: "Owners", value: ownerCount, color: "text-amber-500", icon: ShieldCheck },
          { label: "Staff", value: staffCount, color: "text-blue-500", icon: Shield },
          { label: "Players", value: playerCount, color: "text-green-500", icon: User },
        ].map((stat) => (
          <Card key={stat.label} className="p-8 bg-card/40 backdrop-blur-xl border-border/40 rounded-[32px] relative overflow-hidden group hover:border-primary/30 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">{stat.label}</p>
            <p className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
            <stat.icon className="absolute -right-2 -bottom-2 h-20 w-20 opacity-5 rotate-12 group-hover:rotate-0 transition-transform" />
          </Card>
        ))}
      </div>
    </div>
  );
}
