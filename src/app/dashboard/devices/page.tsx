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
  Laptop,
  Check,
  ShieldAlert,
  Ban,
  LogOut,
  Trash2,
  KeyRound,
  RefreshCw,
  Plus,
  AlertTriangle,
  RotateCcw,
  User,
  ShieldCheck,
  Globe,
  Terminal,
  Copy,
  ChevronDown
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface DeviceItem {
  id: string;
  name: string;
  os: string;
  runtime: string;
  status: "Active" | "Connected" | "Disconnected" | "Blocked" | "Idle";
  lastActive: string;
  isCurrent?: boolean;
  ip?: string;
}

interface BlockedItem {
  id: string;
  name: string;
  blocked_at: string;
  reason: string;
}

export default function DevicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [blockedDevices, setBlockedDevices] = useState<BlockedItem[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings Modal State
  const [profileName, setProfileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Load User & Devices Data
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

      const res = await fetch("/api/devices", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.devices)) {
          setDevices(json.devices);
        }
        if (Array.isArray(json.blocked_devices)) {
          setBlockedDevices(json.blocked_devices);
        }
      }
    } catch (err) {
      console.warn("Failed to load devices data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Device Action Handler (Block, Unblock, Disconnect, Delete)
  const handleDeviceAction = async (action: "block" | "unblock" | "disconnect" | "reconnect" | "delete", device: DeviceItem | BlockedItem) => {
    const deviceId = device.id;
    const deviceName = device.name;
    setProcessingAction(`${action}-${deviceId}`);

    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          deviceId,
          deviceName,
          reason: action === "block" ? "Blocked from Devices Security dashboard" : undefined,
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert(`Failed to ${action} device.`);
      }
    } catch {
      alert(`Network error while performing ${action}.`);
    } finally {
      setProcessingAction(null);
    }
  };

  // Generate Pairing Code for New Device
  const handleGeneratePairingCode = async () => {
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_pairing_code" }),
      });
      if (res.ok) {
        const json = await res.json();
        setPairingCode(json.pairing_code);
        setShowPairModal(true);
      }
    } catch {
      alert("Failed to generate pairing code.");
    }
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

  const activeCount = devices.filter((d) => d.status === "Active" || d.status === "Connected").length;

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
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
          }
          .jobgio-logo { margin-bottom: 10px; }
          .jobgio-nav { flex-direction: row; flex-wrap: wrap; gap: 6px; }
          .jobgio-nav-btn { width: auto; padding: 8px 14px; gap: 8px; }
        }
        @media (max-width: 640px) {
          .jobgio-main { padding: 16px 14px 48px !important; }
          .modal-box { padding: 20px 18px !important; border-radius: 22px !important; }
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

        /* Quick Stats Grid */
        .capsules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .capsule-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        .capsule-icon-bubble {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f4f5f7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111;
        }

        .capsule-value {
          font-size: 1.35rem;
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

        /* Table Card */
        .bottom-table-card {
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

        .manage-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
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

        .pill-badge {
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
        }

        .pill-badge.active-green { background: #e8f9ef; color: #10b981; }
        .pill-badge.connected-blue { background: #eef2ff; color: #4f46e5; }
        .pill-badge.disconnected-gray { background: #f3f4f6; color: #6b7280; }
        .pill-badge.blocked-red { background: #fef2f2; color: #ef4444; }

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

        .btn-action-secondary {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s;
        }

        .btn-action-secondary:hover {
          background: #f9fafb;
        }

        .btn-action-danger {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #ef4444;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s;
        }

        .btn-action-danger:hover {
          background: #fee2e2;
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

            <Link href="/dashboard/devices" className="jobgio-nav-btn active">
              <div className="jobgio-nav-icon-circle"><Briefcase size={15} /></div>
              <span>Devices</span>
            </Link>

            <Link href="/dashboard/tokens" className="jobgio-nav-btn">
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
        {/* Title & Quick Add Device */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#111", margin: 0 }}>
              Device & Agent Security
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#6b7280" }}>
              Manage authenticated computers, sign out remote instances, or block unauthorized devices
            </p>
          </div>
          <button className="btn-action-primary" onClick={handleGeneratePairingCode}>
            <Plus size={15} />
            <span>Connect New Device</span>
          </button>
        </div>

        {/* Top 4 Quick Stats */}
        <div className="capsules-grid">
          <div className="capsule-card">
            <div className="capsule-icon-bubble"><Laptop size={18} /></div>
            <div>
              <div className="capsule-value">{devices.length}</div>
              <div className="capsule-label">Registered Devices</div>
            </div>
          </div>

          <div className="capsule-card">
            <div className="capsule-icon-bubble" style={{ color: "#10b981" }}><ShieldCheck size={18} /></div>
            <div>
              <div className="capsule-value">{activeCount}</div>
              <div className="capsule-label">Active Agents</div>
            </div>
          </div>

          <div className="capsule-card">
            <div className="capsule-icon-bubble" style={{ color: "#ef4444" }}><Ban size={18} /></div>
            <div>
              <div className="capsule-value">{blockedDevices.length}</div>
              <div className="capsule-label">Blocked Devices</div>
            </div>
          </div>

          <div className="capsule-card">
            <div className="capsule-icon-bubble" style={{ color: "#4f46e5" }}><KeyRound size={18} /></div>
            <div>
              <div className="capsule-value">Secured</div>
              <div className="capsule-label">Account Guard</div>
            </div>
          </div>
        </div>

        {/* 1. Main Connected Devices Table */}
        <section className="bottom-table-card">
          <div className="card-header-flex">
            <div>
              <h3 className="card-heading">Authenticated Computers & Devices</h3>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                Actual hardware machines running Palama Desktop Engine
              </p>
            </div>
            <button className="btn-action-secondary" onClick={loadData}>
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="manage-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <div
                      className={`custom-checkbox ${Object.keys(selectedRows).length === devices.length && devices.length > 0 ? "checked" : ""}`}
                      onClick={() => {
                        if (Object.keys(selectedRows).length === devices.length) setSelectedRows({});
                        else {
                          const all: Record<string, boolean> = {};
                          devices.forEach((d) => (all[d.id] = true));
                          setSelectedRows(all);
                        }
                      }}
                    >
                      {Object.keys(selectedRows).length === devices.length && devices.length > 0 && <Check size={11} />}
                    </div>
                  </th>
                  <th>Device / Hardware</th>
                  <th>Operating System</th>
                  <th>Runtime Engine</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: "right" }}>Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "#9ca3af" }}>
                      No active devices connected. Click "Connect New Device" to pair an agent.
                    </td>
                  </tr>
                ) : (
                  devices.map((dev) => (
                    <tr key={dev.id}>
                      <td>
                        <div
                          className={`custom-checkbox ${selectedRows[dev.id] ? "checked" : ""}`}
                          onClick={() => toggleRow(dev.id)}
                        >
                          {selectedRows[dev.id] && <Check size={11} />}
                        </div>
                      </td>

                      {/* Device Name */}
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 10, background: "#f3f4f6", color: "#111" }}>
                            <Laptop size={16} />
                          </span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span>{dev.name}</span>
                              {dev.isCurrent && (
                                <span style={{ fontSize: "0.68rem", background: "#e8f9ef", color: "#10b981", padding: "1px 7px", borderRadius: 999, fontWeight: 700 }}>
                                  This Machine
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 400 }}>ID: {dev.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* OS */}
                      <td>
                        <span style={{ fontWeight: 500, color: "#374151" }}>{dev.os}</span>
                      </td>

                      {/* Runtime */}
                      <td>
                        <span style={{ color: "#4b5563", fontSize: "0.85rem", fontWeight: 500 }}>
                          {dev.runtime}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`pill-badge ${
                          dev.status === "Active" ? "active-green" :
                          dev.status === "Connected" ? "connected-blue" : "disconnected-gray"
                        }`}>
                          {dev.status}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td style={{ color: "#6b7280" }}>{dev.lastActive}</td>

                      {/* Security Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {dev.status === "Disconnected" ? (
                            <button
                              className="btn-action-secondary"
                              onClick={() => handleDeviceAction("reconnect", dev)}
                              disabled={processingAction === `reconnect-${dev.id}`}
                              title="Reconnect device session"
                            >
                              <RotateCcw size={12} />
                              <span>Reconnect</span>
                            </button>
                          ) : (
                            <button
                              className="btn-action-secondary"
                              onClick={() => handleDeviceAction("disconnect", dev)}
                              disabled={processingAction === `disconnect-${dev.id}`}
                              title="Sign out this device session"
                            >
                              <LogOut size={12} />
                              <span>Sign Out</span>
                            </button>
                          )}

                          <button
                            className="btn-action-danger"
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently BLOCK "${dev.name}"? It will be banned from signing in again.`)) {
                                handleDeviceAction("block", dev);
                              }
                            }}
                            disabled={processingAction === `block-${dev.id}`}
                            title="Block this device permanently"
                          >
                            <Ban size={12} />
                            <span>Block Device</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove "${dev.name}" from your devices list?`)) {
                                handleDeviceAction("delete", dev);
                              }
                            }}
                            style={{ background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", padding: "6px" }}
                            title="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Blocked Devices Blacklist Section */}
        <section className="bottom-table-card">
          <div className="card-header-flex">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={18} style={{ color: "#ef4444" }} />
                <h3 className="card-heading">Blocked Devices Blacklist</h3>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                These hardware devices are strictly forbidden from authenticating or running agents on your account
              </p>
            </div>
          </div>

          {blockedDevices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 20px", background: "#fbfcfd", borderRadius: 16, border: "1px dashed #e5e7eb" }}>
              <ShieldCheck size={28} style={{ color: "#10b981", margin: "0 auto 8px" }} />
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>No Blocked Devices</div>
              <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>
                Your account has zero blocked machines. You can block any suspicious or lost device at any time.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {blockedDevices.map((blocked) => (
                <div
                  key={blocked.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "#fef2f2",
                    borderRadius: 14,
                    border: "1px solid #fee2e2",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                      <Ban size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#991b1b" }}>{blocked.name}</div>
                      <div style={{ fontSize: "0.74rem", color: "#b91c1c" }}>
                        ID: {blocked.id} • Blocked: {new Date(blocked.blocked_at).toLocaleDateString()} • {blocked.reason}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-action-secondary"
                    onClick={() => handleDeviceAction("unblock", blocked)}
                    disabled={processingAction === `unblock-${blocked.id}`}
                    style={{ background: "#ffffff", borderColor: "#fca5a5", color: "#991b1b" }}
                  >
                    <RotateCcw size={12} />
                    <span>Unblock Access</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CONNECT NEW DEVICE MODAL */}
      <AnimatePresence>
        {showPairModal && (
          <div className="modal-overlay" onClick={() => setShowPairModal(false)}>
            <motion.div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>Connect a New Device</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#6b7280" }}>
                    Authorize a new computer or server to run your Palama Agent
                  </p>
                </div>
              </div>

              {/* Pairing Code Box */}
              <div style={{ background: "#f8f9fa", borderRadius: 16, padding: "20px", border: "1px solid #e5e7eb", textAlign: "center", margin: "20px 0" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  One-Time Device Pairing Code (Valid 15m)
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "0.15em", color: "#111", margin: "8px 0" }}>
                  {pairingCode}
                </div>
                <button
                  className="btn-action-secondary"
                  onClick={() => handleCopy(`palama login --code ${pairingCode}`)}
                  style={{ margin: "6px auto 0" }}
                >
                  <Copy size={13} />
                  <span>{copiedCode ? "Copied Terminal Command!" : "Copy Command"}</span>
                </button>
              </div>

              {/* Instructions */}
              <div style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.5 }}>
                <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#111" }}>Terminal Instructions:</p>
                <code style={{ display: "block", background: "#111", color: "#00ff88", padding: "10px 14px", borderRadius: 10, fontSize: "0.82rem", fontFamily: "monospace" }}>
                  palama login --code {pairingCode}
                </code>
                <p style={{ margin: "10px 0 0", fontSize: "0.78rem", color: "#9ca3af" }}>
                  Once executed on the new machine, it will instantly verify and appear under your Authenticated Devices.
                </p>
              </div>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <button className="btn-action-primary" onClick={() => setShowPairModal(false)}>
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <button className="btn-action-secondary" onClick={() => handleCopy(user?.id || "")}>
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

