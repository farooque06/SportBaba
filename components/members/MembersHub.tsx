"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Plus, Shield, ShieldCheck, User, X, Trash2, UserPlus, Mail, ChevronDown } from "lucide-react";
import { Toast, ToastType } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/Modal";
import { updateMemberRole, removeMember, addMemberByEmail } from "@/lib/actions/members";
import { cn } from "@/lib/utils";

const roleColors: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-500",
  manager: "bg-blue-500/10 text-blue-500",
  staff: "bg-purple-500/10 text-purple-500",
  player: "bg-green-500/10 text-green-500",
};

export function MembersHub({ members: initialMembers, facilityId, currentUserRole }: { members: any[], facilityId: string, currentUserRole: string }) {
  const [members, setMembers] = useState(initialMembers);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, memberId: string | null, type: 'remove' | 'role', data?: string }>({ isOpen: false, memberId: null, type: 'remove' });
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const showToast = (message: string, type: ToastType = "success") => setToast({ message, type });

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setLoading(true);
    const result = await updateMemberRole(memberId, newRole, facilityId);
    if (result.success) {
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      showToast(`Role updated to ${newRole}.`);
    } else {
      showToast(result.error || "Update failed.", "error");
    }
    setLoading(false);
  };

  const handleRemove = async (memberId: string) => {
    setLoading(true);
    const result = await removeMember(memberId, facilityId);
    if (result.success) {
      setMembers(members.filter(m => m.id !== memberId));
      showToast("Member access revoked.");
    } else {
      showToast(result.error || "Removal failed.", "error");
    }
    setConfirmModal({ isOpen: false, memberId: null, type: 'remove' });
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    const result = await addMemberByEmail(facilityId, email, role);
    if (result.success) {
      showToast(`${email} added to facility.`);
      setIsInviteOpen(false);
      // We don't have the full profile in the result, so we'd normally refetch
      // but simple feedback is fine for now as it revalidates server-side
      window.location.reload(); 
    } else {
      showToast(result.error || "Invite failed.", "error");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-none mb-2">Facility Members</h1>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-50">Manage your facility staff, managers, and players.</p>
        </div>
        <Button 
          onClick={() => setIsInviteOpen(true)}
          className="gap-3 rounded-2xl px-8 h-12 md:h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Add Hub Member
        </Button>
      </div>

      {/* Members Registry View */}
      <div className="px-1 md:px-2 mt-10">
        <Card className="glass-card overflow-hidden rounded-[40px] shadow-2xl border-border/40">
          <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-4 p-6 px-10 border-b border-border/20 bg-muted/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Member Identity</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Contact Info</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Global Role</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 text-right">Actions</span>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-24 opacity-50">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
              <p className="text-xl font-black italic tracking-tighter uppercase">No members discovered</p>
            </div>
          ) : (
            members.map((member: any) => (
              <div key={member.id} className="flex flex-col md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-6 p-8 px-10 border-b border-border/10 last:border-0 hover:bg-muted/10 transition-all items-center group">
                {/* Identity */}
                <div className="flex items-center gap-4 w-full">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-lg shadow-inner group-hover:scale-110 transition-transform">
                    {member.profile?.full_name?.[0] || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black italic text-xl tracking-tight uppercase leading-none">{member.profile?.full_name || "Unknown"}</span>
                    <span className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-widest mt-1">ID: #{member.id.split('-')[0]}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 w-full">
                  <Mail className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground font-bold truncate">{member.profile?.email || "No Email"}</span>
                </div>

                {/* Role with Quick Update */}
                <div className="w-full">
                  {currentUserRole === 'owner' && member.role !== 'owner' ? (
                     <select 
                       value={member.role}
                       disabled={loading}
                       onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                       className={cn(
                        "appearance-none border-none outline-none font-black uppercase tracking-widest text-[9px] px-4 py-2 rounded-full cursor-pointer transition-all",
                        roleColors[member.role] || "bg-muted text-muted-foreground"
                       )}
                     >
                       <option value="manager">Manager</option>
                       <option value="staff">Staff</option>
                       <option value="player">Player</option>
                     </select>
                  ) : (
                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm", roleColors[member.role] || "bg-muted text-muted-foreground")}>
                      {member.role}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 w-full">
                  {currentUserRole === 'owner' && member.role !== 'owner' && (
                    <button 
                      onClick={() => setConfirmModal({ isOpen: true, memberId: member.id, type: 'remove' })}
                      className="h-10 w-10 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Artisan Invite Modal */}
      {isInviteOpen && (
         <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setIsInviteOpen(false)}>
            <div className="bg-card w-full max-w-md rounded-[40px] border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
               <div className="p-10 text-center border-b border-border/10">
                  <div className="h-20 w-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-xl mx-auto">
                     <UserPlus className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight italic uppercase mb-2">Invite Staff</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add existing SportBaba members to your hub.</p>
               </div>
               
               <form onSubmit={handleInvite} className="p-10 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Member Email</label>
                     <input 
                       name="email"
                       type="email"
                       required
                       placeholder="user@example.com"
                       className="w-full bg-muted/30 border border-border/50 rounded-2xl h-14 px-5 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">Access Role</label>
                     <div className="relative">
                       <select 
                         name="role"
                         className="w-full bg-muted/30 border border-border/50 rounded-2xl h-14 px-5 pr-10 text-sm font-bold appearance-none outline-none focus:border-primary transition-all cursor-pointer"
                       >
                         <option value="manager">Manager</option>
                         <option value="staff">Staff</option>
                         <option value="player">Player</option>
                       </select>
                       <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-40" />
                     </div>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] bg-primary shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {loading ? "Adding Representative..." : "Add to Hub"}
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setIsInviteOpen(false)}
                      className="w-full h-12 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Discard
                    </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Artisan Overlays */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, memberId: null, type: 'remove' })}
        onConfirm={() => confirmModal.memberId && handleRemove(confirmModal.memberId)}
        title="Revoke Access?"
        message="This will immediately terminate the user's access to the facility dashboard. This action can be undone by re-inviting them."
        confirmLabel="Revoke Access"
        type="danger"
        isLoading={loading}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
