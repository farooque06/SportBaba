"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Cookies from "js-cookie"
import { useSport } from "@/components/providers/SportProvider"
import { fetchFacility, updateFacilitySettings } from "@/lib/actions/facility"
import { getCurrentUserRole } from "@/lib/actions/auth"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Settings, Palette, Clock, Globe, Bell, Shield, Loader2, BellRing, Timer, TimerOff, Lock } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { facilityId } = useSport()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("22:00")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  // Notification reminder toggles
  const [reminder30, setReminder30] = useState(true)
  const [reminder15, setReminder15] = useState(true)
  const [reminder5end, setReminder5end] = useState(true)

  useEffect(() => {
    if (!facilityId) {
      setLoading(false)
      return
    }
    async function loadData() {
      const userRole = await getCurrentUserRole(facilityId as string)
      setRole(userRole || 'staff')
      const facility = await fetchFacility(facilityId as string)
      if (facility) {
        setName(facility.name || "")
        setEmail(facility.config?.contact_email || "")
        setPhone(facility.config?.contact_phone || "")
        setOpenTime(facility.config?.open_time || "08:00")
        setCloseTime(facility.config?.close_time || "22:00")
        setLatitude(facility.config?.latitude || "")
        setLongitude(facility.config?.longitude || "")
        // Load reminder preferences (default to true if not set)
        const reminders = facility.config?.reminders
        if (reminders) {
          setReminder30(reminders.before_30m !== false)
          setReminder15(reminders.before_15m !== false)
          setReminder5end(reminders.before_end_5m !== false)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [facilityId])

  const handleSave = async () => {
    if (!facilityId) return
    setSaving(true)
    const result = await updateFacilitySettings(facilityId, {
      name,
      config: {
        contact_email: email,
        contact_phone: phone,
        open_time: openTime,
        close_time: closeTime,
        latitude: latitude,
        longitude: longitude,
        setup_completed: true,
        reminders: {
          before_30m: reminder30,
          before_15m: reminder15,
          before_end_5m: reminder5end,
        }
      }
    })
    setSaving(false)
    if (result.success) {
      alert("Settings updated successfully!")
    } else {
      alert("Failed to update settings: " + result.error)
    }
  }

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  const activeRole = role || 'staff'
  if (activeRole !== 'owner' && activeRole !== 'manager' && activeRole !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 mesh-gradient rounded-[48px] border border-border/20">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto font-bold uppercase tracking-widest opacity-60">Facility settings are only accessible by owners and managers.</p>
        </div>
        <Button onClick={() => window.location.href = '/dashboard'} className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all">
          Return to Dashboard
        </Button>
      </div>
    )
  }


  const reminderToggles = [
    {
      label: "30 Min Before Start",
      desc: "Get alerted 30 minutes before a booking begins",
      icon: BellRing,
      value: reminder30,
      onChange: setReminder30,
    },
    {
      label: "15 Min Before Start",
      desc: "Get alerted 15 minutes before a booking begins",
      icon: Timer,
      value: reminder15,
      onChange: setReminder15,
    },
    {
      label: "5 Min Before End",
      desc: "Get alerted 5 minutes before a booking ends",
      icon: TimerOff,
      value: reminder5end,
      onChange: setReminder5end,
    },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-500 px-4 md:px-0 mb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Settings</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">Facility Configuration Center</p>
        </div>
        <Button
          variant="primary"
          className="rounded-[24px] px-10 h-16 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 w-full md:w-auto"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* General Settings */}
        <Card className="p-6 md:p-10 bg-card border-border rounded-[40px] space-y-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Settings className="h-32 w-32 -rotate-12" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20">
              <Settings className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">General</h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Facility Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/40 focus:ring-2 transition-all placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/40 focus:ring-2 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/40 focus:ring-2 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Latitude</label>
                <input
                  placeholder="27.7172"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/40 focus:ring-2 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Longitude</label>
                <input
                  placeholder="85.3240"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/40 focus:ring-2 transition-all"
                />
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground/60 italic px-1">
              Coordinates are used to send precise Google Maps links via WhatsApp.
            </p>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="p-6 md:p-10 bg-card border-border rounded-[40px] space-y-8 shadow-xl group">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20">
              <Clock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Working Hours</h2>
          </div>

          <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex flex-col gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1 opacity-70">Opening Time</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full bg-background border border-primary/10 p-5 rounded-2xl text-2xl font-black outline-none ring-primary focus:ring-2 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1 opacity-70">Closing Time</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full bg-background border border-primary/10 p-5 rounded-2xl text-2xl font-black outline-none ring-primary focus:ring-2 [color-scheme:dark]"
              />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground italic uppercase leading-relaxed text-center opacity-40">Global availability for all pitch resources will be synchronized to these hours.</p>
          </div>
        </Card>

        {/* Notification Reminders */}
        <Card className="p-6 md:p-10 bg-card border-border rounded-[40px] space-y-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Bell className="h-32 w-32 -rotate-12" />
          </div>

          <div className="flex items-center gap-4 mb-2 relative z-10">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">Reminders</h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Booking Alert Timing</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            {reminderToggles.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${item.value ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground/40'} transition-colors`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight mb-1">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground font-bold italic">{item.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => item.onChange(!item.value)}
                  className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${item.value ? 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]' : 'bg-muted-foreground/20'}`}
                >
                  <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-medium text-muted-foreground/50 italic px-2 relative z-10">
            Toggle which booking reminders are sent automatically. Changes apply to all future bookings for this facility.
          </p>
        </Card>

        {/* Account Security */}
        <Card className="p-6 md:p-10 bg-card border-border rounded-[40px] space-y-8 shadow-xl group">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">Security</h2>
          </div>
          <div className="space-y-4">
            <a href="/dashboard/settings/security" className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors cursor-pointer group/link">
              <div>
                <p className="text-xs font-black uppercase tracking-tight mb-1">Two-Factor Authentication</p>
                <p className="text-[10px] text-muted-foreground font-medium">Protect your account with Google Authenticator.</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/link:translate-x-1 transition-transform">
                →
              </div>
            </a>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 md:p-10 bg-card border-red-500/10 rounded-[40px] space-y-8 shadow-xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-3xl bg-red-500/10 text-red-500 border border-red-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-red-500 uppercase italic">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-red-500/5 border border-red-500/10 group cursor-pointer hover:bg-red-500/10 transition-colors">
              <div>
                <p className="text-xs font-black uppercase text-red-500 mb-1">Delete Facility</p>
                <p className="text-[10px] text-red-500/60 font-medium leading-tight">Remove all pitches, bookings, and analytics permanently.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

