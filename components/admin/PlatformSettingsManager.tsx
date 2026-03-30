"use client";

import { useState } from "react";
import { updatePlatformSettings } from "@/lib/actions/admin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Settings, Save, AlertTriangle, Mail, Globe, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsProps = {
  maintenance_mode: boolean;
  support_email: string;
  default_currency: string;
  nexi_live_mode: boolean;
};

export function PlatformSettingsManager({ initialSettings }: { initialSettings: SettingsProps }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // We use client state to do optimistic updates, while actual save goes through FormData action
  const [settings, setSettings] = useState(initialSettings);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updatePlatformSettings(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Failed to update settings: " + result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Settings</h1>
          <p className="text-muted-foreground font-medium text-sm tracking-tight opacity-80 uppercase flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Global Platform Configuration
          </p>
        </div>

        <Button type="submit" disabled={loading} variant="primary" className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] transition-all">
          {loading ? "Saving..." : success ? "Saved!" : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-card border-border rounded-[32px] hover:border-primary/50 transition-all shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Globe className="h-6 w-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Localization</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Regional Platform Defaults</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Currency</label>
                <select 
                  name="default_currency" 
                  value={settings.default_currency}
                  onChange={(e) => setSettings({...settings, default_currency: e.target.value})}
                  className="w-full h-14 bg-background border border-border/50 px-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 uppercase tracking-widest transition-all"
                >
                  <option value="NRS">NRS - Nepalese Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Support Email Address
                </label>
                <input 
                  type="email" 
                  name="support_email" 
                  value={settings.support_email}
                  onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                  className="w-full h-14 bg-background border border-border/50 px-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 placeholder:italic transition-all" 
                  placeholder="support@sportbaba.com" 
                />
                <p className="text-[10px] text-muted-foreground/60 font-medium italic mt-1">This email will be displayed to clients for platform-level support.</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card border-border rounded-[32px] hover:border-emerald-500/50 transition-all shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                 <CreditCard className="h-6 w-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Payment Gateway</h2>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nexi Integration Settings</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-background rounded-2xl border border-border/50 relative z-10">
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1">Nexi Live Mode</h3>
                  <p className="text-xs text-muted-foreground italic">Toggle between Sandbox testing and Live transactions.</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                     type="checkbox" 
                     name="nexi_live_mode" 
                     checked={settings.nexi_live_mode}
                     onChange={(e) => setSettings({...settings, nexi_live_mode: e.target.checked})}
                     className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
               </label>
            </div>
          </Card>
        </div>

        {/* Danger Zone Column */}
        <div className="space-y-6">
          <Card className="p-8 bg-red-500/5 border-red-500/20 rounded-[32px] hover:border-red-500/50 transition-all shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="h-12 w-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
                 <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Danger Zone</h2>
                 <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-wider">Critical Platform Controls</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
               <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 text-center space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Maintenance Mode</h3>
                  <p className="text-xs text-red-500/80 italic">Activating this will lock out all Client Hubs and display a maintenance screen across the entire SportBaba platform.</p>
                  
                  <label className="relative inline-flex items-center cursor-pointer justify-center w-full mt-4">
                     <input 
                        type="checkbox" 
                        name="maintenance_mode" 
                        checked={settings.maintenance_mode}
                        onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                        className="sr-only peer" 
                     />
                     <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[calc(50%-26px)] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
