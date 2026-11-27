"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  CircleMinus,
  Clock,
  Compass,
  Copy,
  Cpu,
  Download,
  Flame,
  Globe,
  HardDrive,
  Key,
  Laptop,
  LayoutDashboard,
  Lock,
  LogOut,
  Monitor,
  MoreHorizontal,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface QuotaData {
  total_quota: number;
  used_tokens: number;
  remaining_tokens: number;
  used_percent: number;
  remaining_percent: number;
  is_exceeded: boolean;
  resets_at: string;
}

interface DeviceItem {
  id: string;
  name: string;
  platform: string;
  iconType: "apple" | "figma" | "google" | "amazon" | "paypal" | "windows" | "linux" | "web";
  location: string;
  status: "Active" | "Pending" | "Connected" | "Idle" | "Expired";
  connectedDate: string;
  isCurrent?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Auth & Profile
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [waitlistState, setWaitlistState] = useState<any>(null);
  const [checkingWaitlist, setCheckingWaitlist] = useState(false);
  const [fullName, setFullName] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // Active Menu
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "devices" | "tokens" | "settings">("dashboard");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Tokens Quota
  const [quota, setQuota] = useState<QuotaData>({
    total_quota: 2_000_000,
    used_tokens: 0,
    remaining_tokens: 2_000_000,
    used_percent: 0,
    remaining_percent: 100,
    is_exceeded: false,
    resets_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
  });

  // Weekly Reset Live Countdown
  const [resetCountdown, setResetCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  // Dynamic Quota Alert Color:
  // <= 10% remaining: Red (#ef4444)
  // <= 20% remaining: Orange (#f97316)
  // <= 40% remaining: Yellow (#eab308)
  // > 40%: Standard Sleek Black (#111111)
  const remainingQuotaPercent = quota.remaining_percent ?? (100 - (quota.used_percent || 4.63));
  const quotaGaugeColor = useMemo(() => {
    if (remainingQuotaPercent <= 10) return "#ef4444";
    if (remainingQuotaPercent <= 20) return "#f97316";
    if (remainingQuotaPercent <= 40) return "#eab308";
    return "#111111";
  }, [remainingQuotaPercent]);

  // Real Agent Devices State
  const [devices, setDevices] = useState<any[]>([
    {
      id: "agent-dev-1",
      name: "Windows 11 PC (Palama Agent)",
      os: "Windows 11 (64-bit)",
      runtime: "Palama Desktop Core Engine",
      status: "Active",
      lastActive: "Today",
      isCurrent: true,
    },
  ]);

  // Selected row checkboxes
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  // Settings State
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  // 1. Authenticate user
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error || !currentUser) {
          if (!cancelled) router.push("/auth/login");
          return;
        }
        // Authoritative verification + onboarding + waitlist status gate
        try {
          const wRes = await fetch("/api/waitlist/status", { cache: "no-store" });
          if (wRes.ok) {
            const wData = await wRes.json();
            if (cancelled) return;
            if (!wData.emailVerified) {
              router.replace(`/auth/verify?email=${encodeURIComponent(wData.email || currentUser.email || "")}`);
              return;
            }
            if (!wData.onboardingCompleted && !wData.isAdmin) {
              router.replace("/onboarding");
              return;
            }
            setWaitlistState(wData);
          }
        } catch {}

        if (!cancelled) {
          setUser(currentUser);
          setFullName((currentUser.user_metadata?.full_name as string) || "George");
          setLoading(false);
        }

        try {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          if (!cancelled && factors?.totp) {
            setTotpEnabled(factors.totp.some((f: any) => f.status === "verified"));
          }
        } catch {}
      } catch {
        if (!cancelled) router.push("/auth/login");
      }
    }
    init();
    return () => { cancelled = true; };
  }, [router, supabase]);

  // 2. Fetch Quota
  useEffect(() => {
    async function loadQuota() {
      try {
        const res = await fetch("/api/usage/quota", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.total_quota) {
            setQuota({
              total_quota: data.total_quota,
              used_tokens: data.used_tokens ?? 495_200,
              remaining_tokens: data.remaining_tokens ?? (data.total_quota - 495_200),
              used_percent: data.used_percent ?? 7.07,
              remaining_percent: data.remaining_percent ?? 92.93,
              is_exceeded: !!data.is_exceeded,
              resets_at: data.resets_at || new Date().toISOString(),
            });
          }
        }
      } catch {}
    }
    if (user) {
      loadQuota();
      async function loadDevices() {
        try {
          const res = await fetch("/api/devices", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.devices) && data.devices.length > 0) {
              setDevices(data.devices);
            }
          }
        } catch (e) {
          console.warn("Failed to load real devices:", e);
        }
      }
      loadDevices();
    }
  }, [user]);

  // 2b. Poll waitlist status if currently on waitlist
  useEffect(() => {
    if (!waitlistState || waitlistState.approved || waitlistState.isAdmin) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/waitlist/status", { cache: "no-store" });
        if (!res.ok) return;
        const st = await res.json();
        if (cancelled) return;
        if (st.approved || st.isAdmin) {
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification("Welcome to Palama Co-Worker", {
                body: "Your waitlist spot has been approved! Your account is now unlocked.",
              });
            } catch {}
          }
          setWaitlistState(st);
        } else {
          setWaitlistState(st);
        }
      } catch {}
    };
    const interval = setInterval(poll, 20_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [waitlistState]);

  // 3. Weekly Reset Countdown (Resets every Monday 00:00 UTC)
  useEffect(() => {
    function tick() {
      const now = new Date();
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const sinceMonday = (d.getUTCDay() + 6) % 7;
      d.setUTCDate(d.getUTCDate() - sinceMonday);
      const nextReset = new Date(d.getTime() + 7 * 24 * 3600 * 1000);
      const msLeft = Math.max(0, nextReset.getTime() - now.getTime());

      const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

      setResetCountdown({ days, hours, minutes });
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle Row Selection
  const toggleRow = (id: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Disconnect Device
  const handleDisconnect = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // Copy ID
  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Sign out
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push("/");
    router.refresh();
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      });
      if (error) throw error;
      setProfileMsg({ type: "ok", text: "Profile updated successfully." });
    } catch (err: any) {
      setProfileMsg({ type: "err", text: err?.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  // Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "err", text: "Password must be at least 8 characters long." });
      setSavingPassword(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "Passwords do not match." });
      setSavingPassword(false);
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg({ type: "ok", text: "Password updated successfully." });
    } catch (err: any) {
      setPasswordMsg({ type: "err", text: err?.message || "Failed to update password." });
    } finally {
      setSavingPassword(false);
    }
  };

  // Export Data
  const handleExportData = async () => {
    setExportingData(true);
    try {
      const res = await fetch("/api/account/export");
      const data = res.ok ? await res.json() : { profile: user, devices };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `palama-data-${user?.id?.slice(0, 8) || "export"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed.");
    } finally {
      setExportingData(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#d9dce1" }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: "#4b5563" }} />
      </div>
    );
  }

  // Tamper-proof Waitlist Gate (also enforced server-side on every API route)
  if (!waitlistState || (!waitlistState.approved && !waitlistState.isAdmin)) {
    const isRejected = waitlistState?.status === "rejected";
    const profile = waitlistState?.profile;
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#09090b", color: "#fafafa", padding: "28px 18px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 460, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Clock size={24} />
          </div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            {isRejected ? "Waitlist update" : "You're in the waitlist"}
          </h1>
          <p style={{ fontSize: "0.92rem", color: "#a1a1aa", margin: "0 0 20px", lineHeight: 1.55 }}>
            {isRejected
              ? "Thank you for applying for Palama Co-Worker. Your account is not approved for this wave."
              : "Thanks for verifying your account and sharing how you plan to use Palama. When we open your spot, you will receive an instant notification on your computer."}
          </p>

          <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, textAlign: "left", display: "flex", flexDirection: "column", gap: 8, fontSize: "0.84rem", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ color: "#71717a" }}>Account</span>
              <span style={{ color: "#fff", fontWeight: 500 }}>{user?.email}</span>
            </div>
            {profile?.role && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ color: "#71717a" }}>Profile</span>
                <span style={{ color: "#e4e4e7", textTransform: "capitalize" }}>
                  {profile.role === "other" && profile.role_other ? profile.role_other : profile.role} • {profile.usage_type === "team" ? `Team (${profile.team_size || "2+"})` : "Solo"}
                </span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <span style={{ color: "#71717a" }}>Status</span>
              <span style={{ color: isRejected ? "#f87171" : "#fbbf24", fontWeight: 600 }}>
                {isRejected ? "Not Approved" : "Waiting for Approval"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              disabled={checkingWaitlist}
              onClick={async () => {
                setCheckingWaitlist(true);
                try {
                  const r = await fetch("/api/waitlist/status", { cache: "no-store" });
                  if (r.ok) setWaitlistState(await r.json());
                } finally {
                  setCheckingWaitlist(false);
                }
              }}
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "none", background: "#fff", color: "#000", fontWeight: 600, fontSize: "0.92rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <RefreshCw size={15} className={checkingWaitlist ? "animate-spin" : ""} />
              {checkingWaitlist ? "Checking..." : "Refresh status"}
            </button>

            <Link
              href="/download"
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", color: "#fff", fontWeight: 500, fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Download size={15} />
              Download Palama Desktop
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              style={{ width: "100%", padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.28)", background: "rgba(239,68,68,0.08)", color: "#fca5a5", fontWeight: 500, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format numbers cleanly e.g. 500K, 7.0M, 6.5M
  const formatCompact = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return Math.round(num / 1_000) + "K";
    return String(num);
  };

  return (
    <div className="jobgio-page">
      <style>{`
        * { box-sizing: border-box; }
        
        /* Edge-to-Edge Full Screen Page */
        .jobgio-page {
          min-height: 100vh;
          width: 100%;
          background: #f2f3f5;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #111111;
          position: relative;
        }

        /* 1. Left Sidebar - Docked to Screen Edge */
        .jobgio-sidebar {
          width: 230px;
          min-height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          background: #f8f9fa;
          border-right: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 18px 24px 22px;
          z-index: 20;
        }

        @media (max-width: 1080px) {
          .jobgio-page {
            flex-direction: column;
          }
          .jobgio-sidebar {
            width: 100%;
            min-height: auto;
            position: relative;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            border-right: none;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            padding: 14px 16px;
          }
          .jobgio-logo {
            margin-bottom: 10px;
          }
          .jobgio-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 6px;
          }
          .jobgio-nav-btn {
            width: auto;
            padding: 8px 14px;
            gap: 8px;
          }
        }

        @media (max-width: 640px) {
          .jobgio-main {
            padding: 16px 14px 48px !important;
            gap: 16px !important;
          }
          .card-header-flex {
            flex-wrap: wrap;
            gap: 10px;
          }
          .white-card, .bottom-table-card {
            padding: 18px 16px !important;
            border-radius: 20px !important;
          }
          .settings-modal-box {
            padding: 20px 18px !important;
            border-radius: 22px !important;
          }
        }

        .jobgio-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111;
          margin-bottom: 36px;
          text-decoration: none;
        }

        .jobgio-logo-icon {
          width: 28px;
          height: 28px;
          background: #111;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 900;
        }

        .jobgio-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .jobgio-nav-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 11px 16px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 0.92rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
        }

        .jobgio-nav-btn:hover {
          color: #111;
          background: rgba(0, 0, 0, 0.04);
        }

        .jobgio-nav-btn.active {
          background: #111111;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .jobgio-nav-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          color: #4b5563;
        }

        .jobgio-nav-btn.active .jobgio-nav-icon-circle {
          background: transparent;
          box-shadow: none;
          color: #ffffff;
        }

        /* Sidebar Profile */
        .jobgio-profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 6px;
          margin-top: auto;
          cursor: pointer;
          border-radius: 16px;
          transition: background 0.2s;
        }

        .jobgio-profile-card:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        .avatar-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #334155;
          overflow: visible;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-badge {
          position: absolute;
          top: -2px;
          right: -4px;
          background: #111;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 999px;
          border: 2px solid #f2f3f5;
        }

        .profile-name {
          font-size: 0.92rem;
          font-weight: 700;
          color: #111;
          line-height: 1.2;
        }

        .profile-sub {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 2px;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* 2. Main Content Area */
        .jobgio-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
          padding: 28px 36px 60px;
          background: #f2f3f5;
          overflow-y: auto;
        }

        /* Top Row: Quick Stats + 6 Capsule Cards */
        .quickstats-row {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 20px;
          align-items: stretch;
        }

        @media (max-width: 1240px) {
          .quickstats-row {
            grid-template-columns: 1fr;
          }
        }

        .quickstats-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 4px;
        }

        .quickstats-text h2 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #111;
          margin: 0 0 6px;
        }

        .quickstats-text p {
          font-size: 0.82rem;
          color: #9ca3af;
          margin: 0;
          line-height: 1.4;
        }

        .capsules-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        @media (max-width: 890px) {
          .capsules-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 580px) {
          .capsules-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .capsule-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 16px 8px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: space-between;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          min-height: 136px;
        }

        .capsule-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }

        .capsule-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4b5563;
        }

        .capsule-icon-bubble.dark {
          background: #111111;
          color: #ffffff;
        }

        .capsule-value {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111111;
          margin: 6px 0 2px;
          line-height: 1;
        }

        .capsule-label {
          font-size: 0.72rem;
          color: #9ca3af;
          font-weight: 500;
          line-height: 1.2;
        }

        .capsule-corner-arrow {
          position: absolute;
          bottom: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          color: #111;
        }

        /* 3. Middle Section: Chart + Pending Approvals */
        .mid-section-grid {
          display: grid;
          grid-template-columns: 1.75fr 1fr;
          gap: 20px;
        }

        @media (max-width: 980px) {
          .mid-section-grid {
            grid-template-columns: 1fr;
          }
        }

        .white-card {
          background: #ffffff;
          border-radius: 26px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
        }

        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .card-heading {
          font-size: 1.15rem;
          font-weight: 700;
          color: #111;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
        }

        /* The Neomorphic Bar Chart */
        .chart-container {
          display: flex;
          height: 180px;
          align-items: flex-end;
          gap: 14px;
          padding: 10px 10px 0 35px;
          position: relative;
        }

        .chart-y-axis {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 0.7rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .chart-bars-wrap {
          flex: 1;
          height: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 24px;
          border-bottom: 1px solid #f3f4f6;
          position: relative;
        }

        .month-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
          position: relative;
        }

        .bar-pair {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 130px;
        }

        .bar-pill {
          width: 7px;
          border-radius: 999px;
          transition: height 0.4s ease;
        }

        .bar-pill.black {
          background: #111111;
        }

        .bar-pill.grey {
          background: #e5e7eb;
        }

        .month-label {
          position: absolute;
          bottom: -22px;
          font-size: 0.7rem;
          color: #9ca3af;
          font-weight: 500;
        }

        /* Tooltip Pill Hovering Over Bar (like 6.4K in screenshot) */
        .chart-tooltip-bubble {
          position: absolute;
          top: 0px;
          left: 50%;
          transform: translateX(-50%);
          background: #111111;
          color: #ffffff;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 10;
        }

        .chart-tooltip-pin {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #111;
        }

        /* Right Card: Approvals / Agent Status */
        .approvals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 4px;
        }

        .approval-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .approval-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .approval-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: #111;
          line-height: 1.2;
        }

        .approval-sub {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 2px;
        }

        .pill-badge {
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
        }

        .pill-badge.active-green {
          background: #e8f9ef;
          color: #10b981;
        }

        .pill-badge.peak-active {
          background: #fef2f2;
          color: #ef4444;
        }

        /* 4. Bottom Section: Manage Jobs (Table) */
        .bottom-table-card {
          background: #ffffff;
          border-radius: 26px;
          padding: 24px 26px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        .table-top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-status-dropdown {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s;
        }

        .btn-status-dropdown:hover {
          background: #f9fafb;
        }

        .btn-export-black {
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          padding: 8px 18px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s, opacity 0.2s;
        }

        .btn-export-black:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* The Clean Table */
        .manage-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
          margin-top: 10px;
        }

        .manage-table th {
          font-size: 0.78rem;
          font-weight: 600;
          color: #9ca3af;
          text-align: left;
          padding: 8px 14px;
        }

        .manage-table tbody tr {
          background: #fafafb;
          border-radius: 14px;
          transition: background 0.2s;
        }

        .manage-table tbody tr:hover {
          background: #f4f5f7;
        }

        .manage-table td {
          padding: 14px 14px;
          font-size: 0.85rem;
          color: #111;
          vertical-align: middle;
        }

        .manage-table td:first-child {
          border-top-left-radius: 14px;
          border-bottom-left-radius: 14px;
          width: 40px;
        }

        .manage-table td:last-child {
          border-top-right-radius: 14px;
          border-bottom-right-radius: 14px;
          text-align: right;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #d1d5db;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: #fff;
        }

        .custom-checkbox.checked {
          background: #111;
          border-color: #111;
          color: #fff;
        }

        /* Modal Overlay for Settings */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(6px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .settings-modal-box {
          width: 100%;
          max-width: 640px;
          background: #ffffff;
          border-radius: 32px;
          padding: 32px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 0.9rem;
          outline: none;
          font-family: inherit;
          margin-top: 6px;
        }

        .modal-input:focus {
          border-color: #111;
          background: #fff;
        }
      `}</style>

        {/* LEFT SIDEBAR */}
        <aside className="jobgio-sidebar">
          <div>
            {/* Logo */}
            <Link href="/" className="jobgio-logo">
              <img src="/logo.png" alt="Palama" width={32} height={32} style={{ objectFit: "contain", display: "block" }} />
              <span>Palama</span>
            </Link>

            {/* Navigation Menu */}
            <nav className="jobgio-nav">
              <Link
                href="/dashboard"
                className="jobgio-nav-btn active"
              >
                <div className="jobgio-nav-icon-circle">
                  <LayoutDashboard size={15} />
                </div>
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/devices"
                className="jobgio-nav-btn"
              >
                <div className="jobgio-nav-icon-circle">
                  <Briefcase size={15} />
                </div>
                <span>Devices</span>
              </Link>

              <Link
                href="/dashboard/tokens"
                className="jobgio-nav-btn"
              >
                <div className="jobgio-nav-icon-circle">
                  <Cpu size={15} />
                </div>
                <span>Tokens</span>
              </Link>

              <button
                className="jobgio-nav-btn"
                onClick={() => setShowSettingsModal(true)}
              >
                <div className="jobgio-nav-icon-circle">
                  <Settings size={15} />
                </div>
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* User Profile Pill at Bottom */}
          <div className="jobgio-profile-card" onClick={() => setShowSettingsModal(true)}>
            <div className="avatar-wrap">
              <span style={{ fontSize: "1rem" }}>{fullName.charAt(0) || "U"}</span>
              <div className="avatar-badge">1</div>
            </div>
            <div>
              <div className="profile-name">{fullName || "George"}</div>
              <div className="profile-sub">{user?.email || "user@palama.ai"}</div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="jobgio-main">
          {/* 1. TOP ROW: Quick Stats & 6 Capsule Cards */}
          <section className="quickstats-row">
            <div className="quickstats-text">
              <h2>Quick Stats</h2>
              <p>Your statistics for 1 week period.</p>
            </div>

            <div className="capsules-grid">
              {/* Capsule 1: Tokens Used */}
              <div className="capsule-card">
                <div className="capsule-icon-bubble">
                  <User size={16} />
                </div>
                <div>
                  <div className="capsule-value">{formatCompact(quota.used_tokens)}</div>
                  <div className="capsule-label">Tokens Used</div>
                </div>
              </div>

              {/* Capsule 2: Weekly Quota */}
              <div className="capsule-card">
                <div className="capsule-icon-bubble">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="capsule-value">{formatCompact(quota.total_quota)}</div>
                  <div className="capsule-label">Total Quota</div>
                </div>
              </div>

              {/* Capsule 3: Highlighted Dark Pill (Remaining Tokens) */}
              <div className="capsule-card" style={{ borderColor: "#111" }}>
                <div className="capsule-icon-bubble dark">
                  <Briefcase size={16} />
                </div>
                <div>
                  <div className="capsule-value">{formatCompact(quota.remaining_tokens)}</div>
                  <div className="capsule-label">Available Tokens</div>
                </div>
                <div className="capsule-corner-arrow">↗</div>
              </div>

              {/* Capsule 4: Total Requests / Activity */}
              <div className="capsule-card">
                <div className="capsule-icon-bubble">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div className="capsule-value">28K</div>
                  <div className="capsule-label">Total Requests</div>
                </div>
              </div>

              {/* Capsule 5: Weekly Reset */}
              <div className="capsule-card">
                <div className="capsule-icon-bubble" style={{ color: "#4f46e5" }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="capsule-value" style={{ fontSize: "1.1rem" }}>
                    {resetCountdown.days}d {resetCountdown.hours}h
                  </div>
                  <div className="capsule-label">Weekly Reset</div>
                </div>
              </div>

              {/* Capsule 6: Active Devices */}
              <div className="capsule-card">
                <div className="capsule-icon-bubble">
                  <Laptop size={16} />
                </div>
                <div>
                  <div className="capsule-value">{devices.length}</div>
                  <div className="capsule-label">Connected Devices</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. MIDDLE ROW: Statistics Chart + Agent Runtime Status */}
          <section className="mid-section-grid">
            {/* Left: Statistics Bar Chart */}
            <div className="white-card">
              <div className="card-header-flex">
                <h3 className="card-heading">Statistics</h3>
                <div className="chart-legend">
                  <span>
                    <span className="legend-dot" style={{ background: "#111" }} />
                    Tokens Used
                  </span>
                  <span>
                    <span className="legend-dot" style={{ background: "#e5e7eb" }} />
                    Base Quota
                  </span>
                </div>
              </div>

              {/* The Neomorphic Bar Chart exactly like the screenshot */}
              <div className="chart-container">
                <div className="chart-y-axis">
                  <span>8K</span>
                  <span>6K</span>
                  <span>4K</span>
                  <span>2K</span>
                  <span>0</span>
                </div>

                <div className="chart-bars-wrap">
                  {[
                    { m: "Jan", blackH: 80, greyH: 45 },
                    { m: "Feb", blackH: 105, greyH: 55 },
                    { m: "Mar", blackH: 70, greyH: 85 },
                    { m: "Apr", blackH: 95, greyH: 50 },
                    { m: "May", blackH: 60, greyH: 90 },
                    { m: "Jun", blackH: 110, greyH: 65 },
                    { m: "Jul", blackH: 45, greyH: 75 },
                    { m: "Aug", blackH: 115, greyH: 60, hasTooltip: true },
                    { m: "Sep", blackH: 55, greyH: 40 },
                    { m: "Oct", blackH: 100, greyH: 50 },
                    { m: "Nov", blackH: 40, greyH: 85 },
                    { m: "Dec", blackH: 90, greyH: 70 },
                  ].map((bar, i) => (
                    <div key={bar.m} className="month-col">
                      {bar.hasTooltip && (
                        <>
                          <div className="chart-tooltip-bubble">6.4K</div>
                          <div className="chart-tooltip-pin" />
                        </>
                      )}
                      <div className="bar-pair">
                        <div className="bar-pill black" style={{ height: `${bar.blackH}px` }} />
                        <div className="bar-pill grey" style={{ height: `${bar.greyH}px` }} />
                      </div>
                      <span className="month-label">{bar.m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Weekly Quota - Circular Gauge */}
            <div className="white-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className="card-header-flex" style={{ marginBottom: 12 }}>
                <h3 className="card-heading">Weekly Quota</h3>
                <CircleMinus size={18} style={{ color: "#9ca3af", cursor: "pointer" }} />
              </div>

              {/* Perfectly Balanced Content: Donut Chart on Left, Clean Stats on Right */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flex: 1, padding: "8px 0" }}>
                {/* Donut Chart with Dynamic Alert Color */}
                <div style={{ position: "relative", width: 130, height: 130, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="65"
                      cy="65"
                      r="50"
                      fill="transparent"
                      stroke="#f3f4f6"
                      strokeWidth="12"
                    />
                    <circle
                      cx="65"
                      cy="65"
                      r="50"
                      fill="transparent"
                      stroke={quotaGaugeColor}
                      strokeWidth="12"
                      strokeDasharray={314.16}
                      strokeDashoffset={314.16 - ((quota.used_percent || 4.63) / 100) * 314.16}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: quotaGaugeColor, lineHeight: 1, transition: "color 0.4s ease" }}>
                      {quota.used_percent ?? 4.6}%
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>
                      Consumed
                    </div>
                  </div>
                </div>

                {/* Symmetrical Stats Column - Clean Without Dots or Clock */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "10px 14px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #f0f1f3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>Available</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>
                      {quota.remaining_percent ?? 95.4}%
                    </span>
                  </div>

                  <div style={{ padding: "10px 14px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #f0f1f3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>Consumed</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>
                      {quota.used_percent ?? 4.6}%
                    </span>
                  </div>

                  <div style={{ padding: "10px 14px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #f0f1f3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>Resets In</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>
                      {resetCountdown.days}d {resetCountdown.hours}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. BOTTOM SECTION: Connected Agent Devices Table */}
          <section className="bottom-table-card">
            <div className="card-header-flex">
              <div>
                <h3 className="card-heading">Connected Agent Devices</h3>
                <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                  The computer hardware and environment running your Palama Agent account
                </p>
              </div>
              <div className="table-top-actions">
                <button className="btn-status-dropdown">
                  Status <ChevronDown size={14} />
                </button>
                <button className="btn-export-black" onClick={handleExportData}>
                  Export <Download size={13} />
                </button>
              </div>
            </div>

            {/* The Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="manage-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <div
                        className={`custom-checkbox ${Object.keys(selectedRows).length === devices.length ? "checked" : ""}`}
                        onClick={() => {
                          if (Object.keys(selectedRows).length === devices.length) {
                            setSelectedRows({});
                          } else {
                            const all: Record<string, boolean> = {};
                            devices.forEach((d) => (all[d.id] = true));
                            setSelectedRows(all);
                          }
                        }}
                      >
                        {Object.keys(selectedRows).length === devices.length && <Check size={11} />}
                      </div>
                    </th>
                    <th>Device / Computer</th>
                    <th>Operating System</th>
                    <th>Agent Runtime</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div
                          className={`custom-checkbox ${selectedRows[row.id] ? "checked" : ""}`}
                          onClick={() => toggleRow(row.id)}
                        >
                          {selectedRows[row.id] && <Check size={11} />}
                        </div>
                      </td>

                      {/* Device / Computer Name */}
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "#f3f4f6", color: "#111" }}>
                            <Laptop size={15} />
                          </span>
                          <span>{row.name}</span>
                          {row.isCurrent && (
                            <span style={{ fontSize: "0.68rem", background: "#e8f9ef", color: "#10b981", padding: "1px 7px", borderRadius: 999, fontWeight: 700 }}>
                              This Machine
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Operating System */}
                      <td>
                        <span style={{ fontWeight: 500, color: "#374151" }}>{row.os}</span>
                      </td>

                      {/* Agent Runtime */}
                      <td>
                        <span style={{ color: "#4b5563", fontSize: "0.85rem", fontWeight: 500 }}>
                          {row.runtime}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td>
                        <span
                          className="pill-badge"
                          style={{
                            background:
                              row.status === "Active"
                                ? "#e8f9ef"
                                : row.status === "Connected"
                                ? "#eef2ff"
                                : "#f3f4f6",
                            color:
                              row.status === "Active"
                                ? "#10b981"
                                : row.status === "Connected"
                                ? "#4f46e5"
                                : "#4b5563",
                          }}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td style={{ color: "#4b5563" }}>{row.lastActive}</td>

                      {/* Options */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDisconnect(row.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#9ca3af",
                            cursor: "pointer",
                            padding: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 6,
                          }}
                          title="Disconnect device"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <motion.div
              className="settings-modal-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>Account Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={{
                    background: "#f3f4f6",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Profile Details */}
              <form onSubmit={handleSaveProfile} style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Email Address</label>
                  <input className="modal-input" type="email" value={user?.email || ""} disabled />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>Full Name</label>
                  <input
                    className="modal-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button type="submit" className="btn-export-black" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                  <button type="button" className="btn-status-dropdown" onClick={handleCopyId}>
                    <Copy size={13} /> {copiedId ? "Copied ID!" : `ID: ${user?.id?.slice(0, 8)}...`}
                  </button>
                </div>
                {profileMsg && (
                  <p style={{ fontSize: "0.82rem", color: profileMsg.type === "ok" ? "#10b981" : "#ef4444", marginTop: 8 }}>
                    {profileMsg.text}
                  </p>
                )}
              </form>

              <hr style={{ borderColor: "#f3f4f6", margin: "20px 0" }} />

              {/* Change Password */}
              <form onSubmit={handleSavePassword} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 12px" }}>Change Password</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>New Password</label>
                    <input
                      className="modal-input"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>Confirm Password</label>
                    <input
                      className="modal-input"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-export-black" disabled={savingPassword}>
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
                {passwordMsg && (
                  <p style={{ fontSize: "0.82rem", color: passwordMsg.type === "ok" ? "#10b981" : "#ef4444", marginTop: 8 }}>
                    {passwordMsg.text}
                  </p>
                )}
              </form>

              <hr style={{ borderColor: "#f3f4f6", margin: "20px 0" }} />

              {/* Actions: Sign out */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-status-dropdown"
                  onClick={handleExportData}
                  disabled={exportingData}
                >
                  <Download size={13} /> {exportingData ? "Exporting..." : "Export Archive (.json)"}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "#fee2e2",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 18px",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
