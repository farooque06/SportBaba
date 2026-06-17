"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  ShieldCheck, ShieldOff, QrCode, Loader2, Check, X, 
  AlertTriangle, Copy, CheckCheck, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setup2FA, confirm2FASetup, disable2FA, get2FAStatus } from "@/lib/actions/auth";

export default function SecurityPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Setup flow state
  const [setupMode, setSetupMode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Disable flow state
  const [disableMode, setDisableMode] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  // Fetch current 2FA status
  useEffect(() => {
    get2FAStatus().then(res => setIs2FAEnabled(res.enabled));
  }, []);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    const result = await setup2FA();
    if (result.success && result.uri) {
      // Generate QR code on client side
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(result.uri, {
        width: 256,
        margin: 2,
        color: { dark: "#ffffff", light: "#00000000" }
      });
      setQrDataUrl(dataUrl);
      setManualSecret(result.secret!);
      setSetupMode(true);
    } else {
      setError(result.error || "Failed to start 2FA setup");
    }
    setLoading(false);
  };

  const handleConfirmSetup = async () => {
    if (confirmCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await confirm2FASetup(confirmCode);
    if (result.success) {
      setIs2FAEnabled(true);
      setSetupMode(false);
      setQrDataUrl(null);
      setManualSecret(null);
      setConfirmCode("");
      setSuccess("2FA has been enabled successfully! Your account is now protected.");
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(result.error || "Failed to confirm 2FA");
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      setError("Please enter a 6-digit code to disable 2FA");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await disable2FA(disableCode);
    if (result.success) {
      setIs2FAEnabled(false);
      setDisableMode(false);
      setDisableCode("");
      setSuccess("2FA has been disabled.");
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(result.error || "Failed to disable 2FA");
    }
    setLoading(false);
  };

  const copySecret = () => {
    if (manualSecret) {
      navigator.clipboard.writeText(manualSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (is2FAEnabled === null) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto pb-32">
      <div>
        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Security</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70 flex items-center gap-2">
          <Lock className="h-3 w-3 text-primary" /> Two-Factor Authentication
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="h-4 w-4 inline mr-2" />{success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="h-4 w-4 inline mr-2" />{error}
        </div>
      )}

      {/* ─── Current Status Card ─── */}
      <Card className="p-8 rounded-[32px] border-border bg-card shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
              is2FAEnabled 
                ? "bg-emerald-500 shadow-emerald-500/20" 
                : "bg-muted shadow-none"
            )}>
              {is2FAEnabled 
                ? <ShieldCheck className="h-7 w-7 text-white" /> 
                : <ShieldOff className="h-7 w-7 text-muted-foreground" />
              }
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                Google Authenticator
              </h2>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                {is2FAEnabled 
                  ? "Your account is protected with two-factor authentication"
                  : "Add an extra layer of security to your superadmin account"
                }
              </p>
            </div>
          </div>
          <span className={cn(
            "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0",
            is2FAEnabled 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
          )}>
            {is2FAEnabled ? "Active" : "Not Set Up"}
          </span>
        </div>
      </Card>

      {/* ─── Setup Flow ─── */}
      {!is2FAEnabled && !setupMode && (
        <Button
          onClick={handleStartSetup}
          disabled={loading}
          variant="primary"
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <span className="flex items-center gap-2">
              <QrCode className="h-5 w-5" /> Enable Two-Factor Authentication
            </span>
          )}
        </Button>
      )}

      {setupMode && (
        <Card className="p-8 rounded-[32px] border-primary/20 bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-black italic uppercase tracking-tighter mb-6 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" /> Scan QR Code
          </h3>

          <div className="flex flex-col items-center gap-6">
            {/* QR Code */}
            {qrDataUrl && (
              <div className="p-4 bg-white rounded-3xl shadow-lg">
                <img src={qrDataUrl} alt="2FA QR Code" className="w-56 h-56" />
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Scan this QR code with your <strong>Google Authenticator</strong> app. 
              If you can't scan, manually enter the secret key below.
            </p>

            {/* Manual Secret Key */}
            {manualSecret && (
              <div className="w-full">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Manual Secret Key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted/50 border border-border/50 rounded-xl text-xs font-mono tracking-widest break-all">
                    {manualSecret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="h-10 w-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                    title="Copy secret"
                  >
                    {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Code Input */}
            <div className="w-full space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Enter the 6-digit code from your app to confirm
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full h-14 bg-muted/50 border border-border/50 px-4 rounded-xl text-2xl font-black text-center tracking-[0.5em] outline-none focus:ring-2 ring-primary/30 transition-all placeholder:text-muted-foreground/20"
              />
            </div>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => { setSetupMode(false); setError(null); }}
                variant="outline"
                className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSetup}
                disabled={loading || confirmCode.length !== 6}
                variant="primary"
                className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Confirm & Enable</span>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Disable Flow ─── */}
      {is2FAEnabled && !disableMode && (
        <button
          onClick={() => setDisableMode(true)}
          className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all text-center"
        >
          <ShieldOff className="h-4 w-4 inline mr-2" /> Disable Two-Factor Authentication
        </button>
      )}

      {disableMode && (
        <Card className="p-8 rounded-[32px] border-red-500/20 bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-black italic uppercase tracking-tighter mb-2 text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Disable 2FA
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your current authenticator code to disable two-factor authentication.
          </p>

          <div className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full h-14 bg-muted/50 border border-red-500/20 px-4 rounded-xl text-2xl font-black text-center tracking-[0.5em] outline-none focus:ring-2 ring-red-500/30 transition-all placeholder:text-muted-foreground/20"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => { setDisableMode(false); setError(null); setDisableCode(""); }}
                variant="outline"
                className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisable}
                disabled={loading || disableCode.length !== 6}
                variant="outline"
                className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] text-red-500 border-red-500/20 hover:bg-red-500/10"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Disable"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
