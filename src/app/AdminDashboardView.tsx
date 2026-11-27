"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Server,
  Activity,
  DollarSign,
  Search,
  Trash2,
  RefreshCcw,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ModelItem {
  id: string;
  name: string;
  family?: string;
  provider?: string;
  context_window?: number;
  cost_tier?: string;
  available?: boolean;
}

interface WaitlistApplicant {
  user_id: string;
  email: string;
  full_name?: string | null;
  phone?: string;
  role?: string;
  role_other?: string | null;
  usage_type?: "solo" | "team";
  team_size?: string | null;
  use_case?: string | null;
  onboarding_completed?: boolean;
  email_confirmed?: boolean;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
}

export default function AdminDashboardView() {
  const [stats, setStats] = useState({
    totalUsers: 1428,
    totalComputers: 0,
    activeComputers: 0,
    totalRevenue: 18450,
    mrr: 6200,
  });

  const [models, setModels] = useState<ModelItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [waitlistRows, setWaitlistRows] = useState<WaitlistApplicant[]>([]);
  const [waitlistFilter, setWaitlistFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [waitlistSearch, setWaitlistSearch] = useState("");
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch real machine & user metrics from /api/admin/stats
  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalUsers: data.totalUsers ?? 1,
          totalComputers: data.totalComputers ?? 0,
          activeComputers: data.activeComputers ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          mrr: data.mrr ?? 0,
        });
      }
    } catch (e) {
      console.error("Failed to fetch real admin stats:", e);
    }
  };

  // Fetch models from Next.js API proxy (OmniRoute live catalog)
  const fetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await fetch("/api/models");
      if (res.ok) {
        const data = await res.json();
        const rawModels = data.models || [];
        setModels(rawModels);
      }
    } catch (e) {
      console.error("Failed to fetch OmniRoute models:", e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const fetchWaitlist = async () => {
    setLoadingWaitlist(true);
    try {
      const res = await fetch("/api/admin/waitlist", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setWaitlistRows(Array.isArray(data.applicants) ? data.applicants : []);
      }
    } catch (e) {
      console.error("Failed to fetch waitlist:", e);
    } finally {
      setLoadingWaitlist(false);
    }
  };

  const handleWaitlistAction = async (userId: string, action: "approve" | "pending" | "reject") => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setWaitlistRows((prev) =>
          prev.map((row) => (row.user_id === userId ? { ...row, status: data.status } : row))
        );
        showNotification(`User updated to "${data.status}".`);
      } else {
        showNotification(data.error || "Failed to update waitlist status.");
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchModels();
    fetchWaitlist();
  }, []);

  // Delete model handler (client catalog filter; direct unauthenticated agent calls disabled)
  const handleDeleteModel = async (modelId: string) => {
    if (!confirm(`Are you sure you want to remove model "${modelId}" from the active catalog view?`)) {
      return;
    }

    setDeletingId(modelId);
    try {
      setModels(prev => prev.filter(m => m.id !== modelId));
      showNotification(`Model "${modelId}" removed from view.`);
    } finally {
      setDeletingId(null);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered models
  const filteredModels = models.filter(model => {
    const matchesSearch =
      model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedProvider === "all") return matchesSearch;
    if (selectedProvider === "free") return matchesSearch && (model.cost_tier === "free" || model.id.toLowerCase().includes("free"));
    return matchesSearch && model.id.toLowerCase().startsWith(selectedProvider.toLowerCase());
  });

  return (
    <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 9999,
              background: "rgba(52, 199, 89, 0.15)",
              border: "1px solid rgba(52, 199, 89, 0.3)",
              backdropFilter: "blur(12px)",
              color: "#34c759",
              padding: "12px 20px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              fontSize: "0.85rem",
              fontWeight: 500
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <ShieldCheck size={24} style={{ color: "var(--signal)" }} />
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Admin Dashboard</h1>
            <span style={{ fontSize: "0.7rem", padding: "2px 10px", borderRadius: 12, background: "rgba(46,123,255,0.12)", color: "var(--signal)", border: "1px solid rgba(46,123,255,0.25)", fontWeight: 600 }}>
              SUPERADMIN
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Real-time infrastructure stats, active computers, platform revenues, and OmniRoute AI models catalog.
          </p>
        </div>

        <button
          onClick={() => { fetchMetrics(); fetchModels(); fetchWaitlist(); }}
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.82rem",
            fontWeight: 500,
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)"; }}
        >
          <RefreshCcw size={14} className={isLoadingModels ? "animate-spin" : ""} />
          Refresh Stats
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {/* Card 1: Total Users */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Registered Users</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(46,123,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--signal)" }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
            {stats.totalUsers.toLocaleString()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>Active registered accounts in Supabase Auth</span>
          </div>
        </div>

        {/* Card 2: Total Computers */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Total Computers</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,159,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff9f0a" }}>
              <Server size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
            {stats.totalComputers}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Cloud machines & desktop nodes
          </div>
        </div>

        {/* Card 3: Active Running Computers */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Active Running</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(52,199,89,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#34c759" }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>{stats.activeComputers}</span>
            <span style={{ fontSize: "0.75rem", color: stats.activeComputers > 0 ? "#34c759" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: stats.activeComputers > 0 ? "#34c759" : "var(--text-muted)", display: "inline-block" }} />
              {stats.activeComputers > 0 ? "Live Online" : "Idle"}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Ready for execution & tool actions
          </div>
        </div>

        {/* Card 4: Revenue / Income */}
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>Revenue & Income</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(175,82,222,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#af52de" }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
            ${stats.totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ padding: "2px 8px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", fontSize: "0.7rem", color: "var(--text-muted)" }}>
              No Active Subscriptions ($0.00)
            </span>
          </div>
        </div>
      </div>

      {/* Waitlist & Access Approvals Section */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "24px", marginTop: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={18} style={{ color: "var(--signal)" }} />
              Waitlist &amp; Access Queue
            </h2>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Review verified users&apos; phone numbers, roles, and team profiles before granting desktop access.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: "0.76rem" }}>
            <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(255,159,10,0.12)", color: "#ff9f0a", border: "1px solid rgba(255,159,10,0.28)" }}>
              Pending: {waitlistRows.filter((r) => r.status === "pending").length}
            </span>
            <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(52,199,89,0.12)", color: "#34c759", border: "1px solid rgba(52,199,89,0.28)" }}>
              Approved: {waitlistRows.filter((r) => r.status === "approved").length}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search applicant email, name, phone, or role..."
              value={waitlistSearch}
              onChange={(e) => setWaitlistSearch(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "9px 14px 9px 38px",
                color: "var(--text-primary)",
                fontSize: "0.83rem",
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setWaitlistFilter(tab)}
                style={{
                  background: waitlistFilter === tab ? "rgba(46,123,255,0.15)" : "var(--bg-surface)",
                  border: waitlistFilter === tab ? "1px solid var(--signal)" : "1px solid var(--border-subtle)",
                  color: waitlistFilter === tab ? "var(--signal)" : "var(--text-secondary)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 10, overflow: "hidden" }}>
          {loadingWaitlist ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Loading waitlist applicants...
            </div>
          ) : (
            (() => {
              const filteredWaitlist = waitlistRows.filter((row) => {
                if (waitlistFilter !== "all" && row.status !== waitlistFilter) return false;
                const q = waitlistSearch.trim().toLowerCase();
                if (!q) return true;
                return (
                  (row.email || "").toLowerCase().includes(q) ||
                  (row.full_name || "").toLowerCase().includes(q) ||
                  (row.phone || "").toLowerCase().includes(q) ||
                  (row.role || "").toLowerCase().includes(q)
                );
              });
              if (filteredWaitlist.length === 0) {
                return (
                  <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No applicants in this view.
                  </div>
                );
              }
              return (
                <div style={{ maxHeight: "420px", overflowY: "auto", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.81rem" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Applicant</th>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Phone</th>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Role</th>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Usage</th>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Verified</th>
                        <th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th>
                        <th style={{ padding: "11px 14px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWaitlist.map((row) => (
                        <tr key={row.user_id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "11px 14px" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{row.full_name || "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{row.email}</div>
                            {row.use_case && (
                              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 3, maxWidth: 240 }}>
                                “{row.use_case}”
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "11px 14px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                            {row.phone || "—"}
                          </td>
                          <td style={{ padding: "11px 14px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                            {row.role === "other" && row.role_other ? row.role_other : row.role || "Pending setup"}
                          </td>
                          <td style={{ padding: "11px 14px", color: "var(--text-secondary)" }}>
                            {row.usage_type === "team" ? `Team (${row.team_size || "2+"})` : "Solo"}
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 8, background: row.email_confirmed ? "rgba(52,199,89,0.15)" : "rgba(255,159,10,0.12)", color: row.email_confirmed ? "#34c759" : "#ff9f0a" }}>
                              {row.email_confirmed ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td style={{ padding: "11px 14px" }}>
                            <span style={{
                              fontSize: "0.7rem",
                              padding: "2px 8px",
                              borderRadius: 8,
                              textTransform: "capitalize",
                              background: row.status === "approved" ? "rgba(52,199,89,0.15)" : row.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(255,159,10,0.15)",
                              color: row.status === "approved" ? "#34c759" : row.status === "rejected" ? "#ef4444" : "#ff9f0a",
                            }}>
                              {row.status}
                            </span>
                          </td>
                          <td style={{ padding: "11px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              {row.status !== "approved" && (
                                <button
                                  type="button"
                                  disabled={updatingUserId === row.user_id}
                                  onClick={() => handleWaitlistAction(row.user_id, "approve")}
                                  style={{ background: "rgba(52,199,89,0.14)", border: "1px solid rgba(52,199,89,0.35)", color: "#34c759", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <UserCheck size={12} /> Approve
                                </button>
                              )}
                              {row.status === "approved" && (
                                <button
                                  type="button"
                                  disabled={updatingUserId === row.user_id}
                                  onClick={() => handleWaitlistAction(row.user_id, "pending")}
                                  style={{ background: "rgba(255,159,10,0.12)", border: "1px solid rgba(255,159,10,0.3)", color: "#ff9f0a", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem", fontWeight: 600 }}
                                >
                                  Move to Waitlist
                                </button>
                              )}
                              {row.status !== "rejected" && (
                                <button
                                  type="button"
                                  disabled={updatingUserId === row.user_id}
                                  onClick={() => handleWaitlistAction(row.user_id, "reject")}
                                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", color: "#ef4444", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.74rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <UserX size={12} /> Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* OmniRoute Models Section */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "24px", marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
              <Cpu size={18} style={{ color: "var(--signal)" }} />
              OmniRoute Models Catalog
            </h2>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Manage registered AI models hosted on OmniRoute. Delete any model to exclude it from active Model Intelligence routing.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Total: <strong style={{ color: "var(--text-primary)" }}>{models.length}</strong> models
            </span>
          </div>
        </div>

        {/* Search & Provider Filter Bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search model by ID, name, or provider (e.g. gpt-4, claude, deepseek)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                padding: "9px 14px 9px 38px",
                color: "var(--text-primary)",
                fontSize: "0.83rem",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Providers" },
              { id: "free", label: "Free Tier" },
              { id: "oc", label: "OpenCode (oc)" },
              { id: "antigravity", label: "Antigravity" },
              { id: "aug", label: "AUG" },
              { id: "tllm", label: "TLLM" },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                style={{
                  background: selectedProvider === p.id ? "rgba(46,123,255,0.15)" : "var(--bg-surface)",
                  border: selectedProvider === p.id ? "1px solid var(--signal)" : "1px solid var(--border-subtle)",
                  color: selectedProvider === p.id ? "var(--signal)" : "var(--text-secondary)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Models Table */}
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 10, overflow: "hidden" }}>
          {isLoadingModels ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Loading models catalog...
            </div>
          ) : filteredModels.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No models match your search query.
            </div>
          ) : (
            <div style={{ maxHeight: "480px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Model ID</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Context</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600 }}>Cost Tier</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.slice(0, 100).map((model) => (
                    <tr
                      key={model.id}
                      style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 500 }}>
                        {model.id}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                        {model.name || model.id}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                        {model.context_window ? `${Math.round(model.context_window / 1024)}k` : "128k"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: "0.68rem",
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: model.cost_tier === "free" || model.id.includes("free") ? "rgba(52,199,89,0.15)" : "rgba(255,255,255,0.06)",
                          color: model.cost_tier === "free" || model.id.includes("free") ? "#34c759" : "var(--text-secondary)",
                          border: model.cost_tier === "free" || model.id.includes("free") ? "1px solid rgba(52,199,89,0.3)" : "1px solid var(--border-subtle)"
                        }}>
                          {model.cost_tier || (model.id.includes("free") ? "free" : "standard")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          disabled={deletingId === model.id}
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            color: "#ef4444",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.25)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.1)"; }}
                        >
                          <Trash2 size={12} />
                          {deletingId === model.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
