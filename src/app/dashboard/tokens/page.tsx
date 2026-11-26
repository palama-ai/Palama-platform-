"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Cpu,
  Settings,
  Clock,
  Flame,
  Zap,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Copy
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function TokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Live Countdown State (Weekly Reset: Monday 00:00 UTC)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Settings Modal State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Load Tokens Analytics
  const loadData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      setProfileName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Developer");

      const res = await fetch("/api/usage/analytics", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setAnalytics(json);
      }
    } catch (err) {
      console.warn("Failed to load tokens analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Live Timer Effect for Weekly Reset
  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();

      // Weekly Reset: Monday 00:00 UTC
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const sinceMonday = (d.getUTCDay() + 6) % 7;
      d.setUTCDate(d.getUTCDate() - sinceMonday);
      const nextReset = new Date(d.getTime() + 7 * 24 * 3600 * 1000);
      const msLeft = Math.max(0, nextReset.getTime() - now.getTime());

      const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((msLeft % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds });
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCompact = (num: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + "M";
    if (num >= 1_000) return Math.round(num / 1_000) + "K";
    return String(num);
  };

  const handleExportTokens = () => {
    const data = {
      user: user?.email,
      timestamp: new Date().toISOString(),
      quota: analytics?.quota,
      peak: analytics?.peak,
      hourlyDistribution: analytics?.hourlyDistribution,
      breakdownByEngine: analytics?.breakdownByEngine,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palama-tokens-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "Passwords do not match." });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const supabase = createClient();
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f2f3f5" }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: "#4b5563" }} />
      </div>
    );
  }

  const quota = analytics?.quota || {
    total_quota: 2000000,
    used_tokens: 0,
    remaining_tokens: 2000000,
    used_percent: 0,
    remaining_percent: 100,
  };

  // Dynamic Quota Alert Color:
  // <= 10% remaining: Red (#ef4444)
  // <= 20% remaining: Orange (#f97316)
  // <= 40% remaining: Yellow (#eab308)
  // > 40%: Standard Sleek Black (#111111)
  const remainingQuotaPercent = quota.remaining_percent ?? (100 - (quota.used_percent || 4.64));
  const getQuotaColor = (rem: number) => {
    if (rem <= 10) return "#ef4444";
    if (rem <= 20) return "#f97316";
    if (rem <= 40) return "#eab308";
    return "#111111";
  };
  const quotaGaugeColor = getQuotaColor(remainingQuotaPercent);

  const hourly = analytics?.hourlyDistribution || [];
  const engineBreakdown = analytics?.breakdownByEngine || [];

  return (
    <div className="jobgio-page">
      <style>{`
        * { box-sizing: border-box; }
        .jobgio-page {
          min-height: 100vh;
          width: 100%;
          background: #f2f3f5;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #111111;
          position: relative;
        }

        /* Sidebar */
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
          .jobgio-page { flex-direction: column; }
          .jobgio-sidebar {
            width: 100%;
            min-height: auto;
            position: relative;
            flex-direction: row;
            flex-wrap: wrap;
            padding: 16px 20px;
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
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-decoration: none;
        }

        .jobgio-nav-btn:hover {
          color: #111;
          background: rgba(0, 0, 0, 0.04);
        }

        .jobgio-nav-btn.active {
          background: #111111;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
        }

        .jobgio-nav-icon-circle {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .jobgio-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #ffffff;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .jobgio-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        /* Main Content */
        .jobgio-main {
          flex: 1;
          padding: 32px 36px 60px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          max-width: 1440px;
          margin: 0 auto;
          width: 100%;
        }

        /* Top 4 Quick Stats */
        .capsules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .capsule-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.8);
          position: relative;
        }

        .capsule-card.highlighted {
          border: 1.5px solid #111111;
        }

        .capsule-icon-bubble {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111;
        }

        .capsule-icon-bubble.dark {
          background: #111;
          color: #fff;
        }

        .capsule-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #111;
          line-height: 1.1;
        }

        .capsule-label {
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 500;
          margin-top: 3px;
        }

        .capsule-corner-arrow {
          position: absolute;
          top: 14px;
          right: 16px;
          font-size: 0.95rem;
          font-weight: 800;
          color: #111;
        }

        /* White Cards */
        .white-card {
          background: #ffffff;
          border-radius: 26px;
          padding: 26px 28px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }

        .card-header-flex {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .card-heading {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #111;
          margin: 0;
        }

        .grid-two-cols {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .grid-two-cols { grid-template-columns: 1fr; }
        }

        /* Hourly Bar Chart */
        .hourly-chart-wrap {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 180px;
          padding-top: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f3f4f6;
          overflow-x: auto;
        }

        .hourly-bar-col {
          flex: 1;
          min-width: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: flex-end;
          position: relative;
        }

        .hourly-bar-fill {
          width: 100%;
          max-width: 14px;
          border-radius: 999px;
          transition: height 0.3s ease;
          background: #e5e7eb;
        }

        .hourly-bar-fill.peak {
          background: #111111;
        }

        .hourly-label {
          font-size: 0.65rem;
          color: #9ca3af;
          font-weight: 600;
          white-space: nowrap;
        }

        .pill-badge {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        .pill-badge.active-green { background: #e8f9ef; color: #10b981; }
        .pill-badge.peak-active { background: #fef2f2; color: #ef4444; }

        .btn-action-primary {
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .btn-action-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* Modal */
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

        .modal-box {
          width: 100%;
          max-width: 580px;
          background: #ffffff;
          border-radius: 28px;
          padding: 32px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
        }
      `}</style>

      {/* LEFT SIDEBAR */}
      <aside className="jobgio-sidebar">
        <div>
          <Link href="/" className="jobgio-logo">
            <img src="/logo.png" alt="Palama" width={32} height={32} style={{ objectFit: "contain", display: "block" }} />
            <span>Palama</span>
          </Link>

          <nav className="jobgio-nav">
            <Link href="/dashboard" className="jobgio-nav-btn">
              <div className="jobgio-nav-icon-circle"><LayoutDashboard size={15} /></div>
              <span>Dashboard</span>
            </Link>

            <Link href="/dashboard/devices" className="jobgio-nav-btn">
              <div className="jobgio-nav-icon-circle"><Briefcase size={15} /></div>
              <span>Devices</span>
            </Link>

            <Link href="/dashboard/tokens" className="jobgio-nav-btn active">
              <div className="jobgio-nav-icon-circle"><Cpu size={15} /></div>
              <span>Tokens</span>
            </Link>

            <button
              className="jobgio-nav-btn"
              onClick={() => setShowSettingsModal(true)}
            >
              <div className="jobgio-nav-icon-circle"><Settings size={15} /></div>
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User Pill */}
        <div className="jobgio-user-card">
          <div className="jobgio-user-avatar">
            {profileName.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profileName}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="jobgio-main">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#111", margin: 0 }}>
              Tokens Analytics & Quota
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#6b7280" }}>
              Live weekly limits, real-time consumption, and automated quota renewal
            </p>
          </div>
          <button className="btn-action-primary" onClick={handleExportTokens}>
            <Download size={14} />
            <span>Export Tokens Report</span>
          </button>
        </div>

        {/* Top 4 Quick Stats */}
        <div className="capsules-grid">
          {/* 1. Total Quota */}
          <div className="capsule-card">
            <div className="capsule-icon-bubble"><Layers size={18} /></div>
            <div>
              <div className="capsule-value">{formatCompact(quota.total_quota)}</div>
              <div className="capsule-label">Weekly Quota</div>
            </div>
          </div>

          {/* 2. Used Tokens */}
          <div className="capsule-card">
            <div className="capsule-icon-bubble"><TrendingUp size={18} /></div>
            <div>
              <div className="capsule-value">{formatCompact(quota.used_tokens)}</div>
              <div className="capsule-label">Used Tokens</div>
            </div>
          </div>

          {/* 3. Available Tokens */}
          <div className="capsule-card highlighted">
            <div className="capsule-icon-bubble dark"><Cpu size={18} /></div>
            <div>
              <div className="capsule-value">{formatCompact(quota.remaining_tokens)}</div>
              <div className="capsule-label">Available Tokens</div>
            </div>
            <div className="capsule-corner-arrow">↗</div>
          </div>

          {/* 4. Reset Countdown */}
          <div className="capsule-card">
            <div className="capsule-icon-bubble" style={{ color: "#4f46e5" }}><Calendar size={18} /></div>
            <div>
              <div className="capsule-value" style={{ fontSize: "1.1rem" }}>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </div>
              <div className="capsule-label">Weekly Reset</div>
            </div>
          </div>
        </div>

        {/* Weekly Quota Consumption - Circular Gauge */}
        <section className="white-card">
          <div className="card-header-flex" style={{ marginBottom: 12 }}>
            <h3 className="card-heading">Weekly Quota Consumption</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, padding: "12px 16px" }}>
            {/* The SVG Donut Gauge with Dynamic Alert Color */}
            <div style={{ position: "relative", width: 140, height: 140, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: "0 auto" }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="transparent"
                  stroke="#f3f4f6"
                  strokeWidth="12"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="transparent"
                  stroke={quotaGaugeColor}
                  strokeWidth="12"
                  strokeDasharray={339.29}
                  strokeDashoffset={339.29 - ((quota.used_percent || 4.63) / 100) * 339.29}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: quotaGaugeColor, lineHeight: 1, transition: "color 0.4s ease" }}>
                  {quota.used_percent ?? 4.6}%
                </div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>
                  Consumed
                </div>
              </div>
            </div>

            {/* Symmetrical Stats Column - Clean Without Dots or Clock */}
            <div style={{ flex: 1, maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ padding: "10px 16px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #f0f1f3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>Available Quota</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#111" }}>
                  {quota.remaining_percent ?? 95.4}%
                </span>
              </div>

              <div style={{ padding: "10px 16px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #f0f1f3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>Consumed Quota</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#111" }}>
                  {quota.used_percent ?? 4.6}%
                </span>
              </div>

              <div style={{ padding: "10px 16px", background: "#f8f9fa", borderRadius: 12, border: "1px solid #f0f1f3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>Weekly Reset In</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#111" }}>
                  {countdown.days}d {countdown.hours}h {countdown.minutes}m
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Hourly Distribution Section */}
        <section className="white-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">24-Hour Usage Distribution</h3>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                Hourly breakdown of token consumption across development and automated agent tasks
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "#6b7280", background: "#f8f9fa", padding: "6px 14px", borderRadius: 999 }}>
              <Clock size={13} />
              <span>UTC Timezone</span>
            </div>
          </div>

          {/* 24-Hour Bars */}
          <div className="hourly-chart-wrap">
            {hourly.map((h: any, idx: number) => {
              const maxPct = 15;
              const barH = Math.max(12, Math.round((h.pct / maxPct) * 110));
              return (
                <div key={idx} className="hourly-bar-col" title={`${h.hour}: ~${h.tokens.toLocaleString()} tokens (${h.pct}%)`}>
                  <div
                    className="hourly-bar-fill"
                    style={{ height: `${barH}px`, background: "#111111" }}
                  />
                  <span className="hourly-label" style={{ color: "#6b7280" }}>
                    {h.hour.slice(0, 2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary Insight */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, padding: "12px 16px", background: "#f8f9fa", borderRadius: 14 }}>
            <TrendingUp size={16} style={{ color: "#111" }} />
            <div style={{ fontSize: "0.82rem", color: "#374151" }}>
              <strong>Usage Throughput:</strong> Steady token allocation across active agent execution, coding subagents, and reasoning tasks.
            </div>
          </div>
        </section>

        {/* Tokens Consumption by Engine / Task */}
        <section className="white-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">Token Consumption by Engine Type</h3>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                Distribution of tokens across Palama coding subagents, deep reasoning, and OS automation
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {engineBreakdown.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "18px",
                  borderRadius: 18,
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111" }}>{item.name}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: item.color }}>{item.pct}%</span>
                </div>
                <div style={{ height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                  ~{formatCompact(item.tokens)} Tokens consumed
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
            <motion.div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Account & Security Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#9ca3af" }}>✕</button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4b5563" }}>User ID</label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    readOnly
                    value={user?.id || ""}
                    style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "0.85rem", color: "#6b7280" }}
                  />
                  <button
                    onClick={() => {
                      if (user?.id) {
                        navigator.clipboard.writeText(user.id);
                        setCopiedId(true);
                        setTimeout(() => setCopiedId(false), 2000);
                      }
                    }}
                    style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "8px 14px", borderRadius: 10, fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    <Copy size={13} />
                    <span>{copiedId ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSavePassword}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4b5563" }}>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "0.85rem", marginTop: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4b5563" }}>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: "0.85rem", marginTop: 4 }}
                  />
                </div>

                {passwordMsg && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, fontSize: "0.82rem", marginBottom: 14, background: passwordMsg.type === "ok" ? "#e8f9ef" : "#fef2f2", color: passwordMsg.type === "ok" ? "#10b981" : "#ef4444" }}>
                    {passwordMsg.text}
                  </div>
                )}

                <div style={{ textAlign: "right" }}>
                  <button type="submit" className="btn-action-primary" disabled={savingPassword}>
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

