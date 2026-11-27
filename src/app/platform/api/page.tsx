"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, KeyRound, BarChart3, Zap, User, ChevronsLeft, ChevronsRight,
  Search, RefreshCw, Wallet, Clock3, Activity, Gauge, Cpu, Send, ListOrdered,
  Database, Server, Timer, ArrowUpRight, Copy, Check, Plus,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Tab = "dashboard" | "tokens" | "usage" | "models";
type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  last_used_at: string | null;
  revoked: boolean;
  created_at: string;
};
type UsageRow = { created_at: string; endpoint: string; model: string };
type AnalysisTab = "dist" | "trend" | "ranking";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function ApiConsolePage() {
  const supabase = createClient();
  const [status, setStatus] = useState<"checking" | "ready" | "login">("checking");
  const [userName, setUserName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [range, setRange] = useState<7 | 30>(7);
  const [analysis, setAnalysis] = useState<AnalysisTab>("dist");

  const [models, setModels] = useState<{ id: string; provider: string }[]>([]);
  const [modelsMs, setModelsMs] = useState<number | null>(null);
  const [speedMs, setSpeedMs] = useState<number | null>(null);
  const [speedBusy, setSpeedBusy] = useState(false);

  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setStatus("login");
      return;
    }
    setStatus("ready");
    const meta = (user.user_metadata as any) || {};
    setUserName(meta.full_name || user.email || "there");
    setAccountEmail(user.email || "");
    setMemberSince(new Date(user.created_at).toLocaleDateString());
    const [k, u] = await Promise.all([
      fetch("/api/keys", { cache: "no-store" }).then((r) => r.json()).catch(() => ({})),
      supabase.from("api_usage").select("created_at,endpoint,model").order("created_at", { ascending: false }).limit(2000),
    ]);
    if (Array.isArray(k.keys)) setKeys(k.keys);
    else if (k.error) setError(k.error);
    if (!u.error && Array.isArray(u.data)) setUsage(u.data as UsageRow[]);
    // Model catalog status (live)
    try {
      const t0 = performance.now();
      const res = await fetch("/api/models", { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      setModelsMs(Math.round(performance.now() - t0));
      if (Array.isArray(j.models)) {
        setModels(j.models.map((m: any) => ({ id: String(m.id || m.name), provider: String(m.provider || "") })));
      }
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) setStatus("login");
      else load();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshAll = () => {
    setError(null);
    load();
  };

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("create");
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() || "Default key" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Create failed");
      setFreshKey(j.key);
      setNewName("");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const revokeKey = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/keys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Revoke failed");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  };

  const speedTest = async () => {
    setSpeedBusy(true);
    try {
      const t0 = performance.now();
      await fetch("/api/models", { cache: "no-store" });
      setSpeedMs(Math.round(performance.now() - t0));
    } catch {
      setSpeedMs(null);
    } finally {
      setSpeedBusy(false);
    }
  };

  const cutoff = useMemo(() => Date.now() - range * 86400000, [range]);
  const ranged = useMemo(
    () => usage.filter((r) => new Date(r.created_at).getTime() >= cutoff),
    [usage, cutoff]
  );
  const totalCalls = ranged.length;
  const activeDays = useMemo(() => new Set(ranged.map((r) => r.created_at.slice(0, 10))).size, [ranged]);
  const distinctModels = useMemo(() => [...new Set(ranged.map((r) => (r.model || "unknown")))], [ranged]);
  const perModel = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of ranged) {
      const k = r.model || "unknown";
      m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [ranged]);
  const topModel = perModel.length ? perModel[0][0] : "—";
  const perDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of ranged) {
      const d = r.created_at.slice(0, 10);
      m.set(d, (m.get(d) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [ranged]);
  const maxDay = perDay.length ? Math.max(...perDay.map(([, n]) => n)) : 0;
  const rpm = totalCalls > 0 ? (totalCalls / (range * 1440)).toFixed(3) : "0.000";
  const avgDay = totalCalls > 0 ? (totalCalls / range).toFixed(1) : "0";
  const activeKeys = keys.filter((k) => !k.revoked);
  const q = query.trim().toLowerCase();
  const ranking = perModel.filter(([m]) => !q || m.toLowerCase().includes(q));
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const curlRun = `curl -X POST ${origin}/api/agent/run \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-palama-YOUR_KEY" \\
  -d '{"task": "Summarize this quarter", "executionMode": "BASIC"}'`;

  const sideItem = (id: Tab, icon: React.ReactNode, label: string) => (
    <button key={id} className={`snav ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} title={collapsed ? label : undefined}>
      <span className="snav-ic">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );

  return (
    <div className="console">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #f4f4f5; margin: 0; }
        .console { min-height: 100vh; width: 100%; background: #f4f4f5; color: #111; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; }
        .cside { width: ${collapsed ? "64px" : "218px"}; flex-shrink: 0; background: #fff; border-right: 1px solid rgba(0,0,0,0.08); padding: 18px 12px; display: flex; flex-direction: column; gap: 2px; position: sticky; top: 0; height: 100vh; transition: width 0.18s ease; }
        .csec { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: #8b8b93; padding: 12px 10px 6px; white-space: nowrap; overflow: hidden; }
        .snav { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; color: #333; font-size: 0.92rem; font-weight: 500; font-family: inherit; cursor: pointer; text-align: left; white-space: nowrap; }
        .snav:hover { background: rgba(0,0,0,0.05); }
        .snav.on { background: #111; color: #fff; }
        .snav-ic { width: 20px; text-align: center; flex-shrink: 0; }
        .ccollapse { margin-top: auto; display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; background: transparent; color: #333; font-size: 0.85rem; font-weight: 500; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .cmain { flex: 1; min-width: 0; padding: 26px 30px 80px; }
        .ctop { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 20px; }
        .ctop h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.01em; margin: 0; }
        .ctop .who { color: #111; }
        .ctools { display: flex; align-items: center; gap: 10px; }
        .csearch { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 8px 12px; }
        .csearch input { border: 0; outline: 0; background: transparent; font-size: 0.88rem; width: 170px; color: #111; font-family: inherit; }
        .cicbtn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); background: #fff; cursor: pointer; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; }
        .ccards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .ccard { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .ccard h3 { font-size: 0.92rem; font-weight: 650; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
        .crow { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
        .crow + .crow { border-top: 1px solid rgba(0,0,0,0.06); }
        .cdot { width: 34px; height: 34px; border-radius: 50%; background: #111; color: #fff; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .crow .lb { font-size: 0.8rem; color: #6d6d74; }
        .crow .vl { font-size: 1.25rem; font-weight: 700; }
        .cgrid { display: grid; grid-template-columns: 1fr 300px; gap: 14px; margin-top: 14px; }
        .cpanel { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); min-width: 0; }
        .ctabs { display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0 14px; }
        .ctab { border: 0; background: transparent; font-size: 0.85rem; font-weight: 600; color: #6d6d74; padding: 8px 12px; border-radius: 9px; cursor: pointer; font-family: inherit; }
        .ctab.on { background: #111; color: #fff; }
        .cbars { display: flex; align-items: flex-end; gap: 8px; min-height: 170px; padding-top: 8px; }
        .cbcol { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 150px; min-width: 0; }
        .cbar { width: 100%; max-width: 36px; border-radius: 6px 6px 2px 2px; background: #111; }
        .cbar-day { font-size: 0.65rem; color: #8b8b93; }
        .cshare { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid rgba(0,0,0,0.06); font-size: 0.88rem; }
        .cshare:first-of-type { border-top: none; }
        .cshare .mn { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
        .cshare .pc { font-variant-numeric: tabular-nums; color: #6d6d74; width: 52px; text-align: right; }
        .cshare .tr { height: 8px; border-radius: 4px; background: rgba(0,0,0,0.08); flex: 1; overflow: hidden; }
        .cshare .fl { height: 100%; background: #111; border-radius: 4px; }
        table.ctable { width: 100%; border-collapse: collapse; font-size: 0.87rem; }
        table.ctable th { text-align: left; font-size: 0.75rem; color: #8b8b93; font-weight: 600; padding: 8px 6px; border-bottom: 1px solid rgba(0,0,0,0.08); }
        table.ctable td { padding: 9px 6px; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .akey { display: flex; align-items: center; gap: 12px; padding: 12px 4px; border-top: 1px solid rgba(0,0,0,0.07); font-size: 0.9rem; flex-wrap: wrap; }
        .akey .nm { font-weight: 650; flex: 1; min-width: 140px; }
        .akey .pf { font-family: monospace; font-size: 0.78rem; color: #6d6d74; }
        .akey .meta { font-size: 0.78rem; color: #8b8b93; }
        .akey.revoked .nm { text-decoration: line-through; opacity: 0.55; }
        .arow { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .ainput { flex: 1; min-width: 180px; background: #f4f4f5; border: 1px solid rgba(0,0,0,0.12); border-radius: 9px; padding: 10px 14px; font-size: 0.9rem; font-family: inherit; outline: none; color: #111; }
        .abtn { padding: 10px 20px; border-radius: 9px; border: none; background: #111; color: #fff; font-size: 0.88rem; font-weight: 650; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .abtn:disabled { opacity: 0.55; cursor: not-allowed; }
        .abtn-ghost { background: transparent; color: #111; border: 1px solid rgba(0,0,0,0.15); }
        .abtn-danger { background: transparent; color: #dc2626; border: 1px solid rgba(220,38,38,0.3); }
        .afresh { background: #f4f4f5; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .afresh code { font-family: monospace; font-size: 0.8rem; word-break: break-all; user-select: all; }
        .aerr { background: #fef2f2; border: 1px solid rgba(220,38,38,0.25); color: #b91c1c; padding: 12px 14px; border-radius: 10px; font-size: 0.87rem; }
        .arange { display: flex; background: rgba(0,0,0,0.05); border-radius: 999px; padding: 3px; }
        .arange button { border: 0; background: transparent; font-size: 0.78rem; font-weight: 600; padding: 6px 13px; border-radius: 999px; cursor: pointer; font-family: inherit; color: #6d6d74; }
        .arange button.on { background: #111; color: #fff; }
        pre.acode { background: #111; color: #e4e4e7; border-radius: 12px; padding: 16px; overflow-x: auto; font-size: 0.78rem; line-height: 1.6; margin: 0; font-family: ui-monospace, Consolas, monospace; white-space: pre; }
        .docrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 14px 0 8px; font-size: 0.88rem; font-weight: 650; }
        .apilink { color: #1668dc; text-decoration: none; word-break: break-all; font-size: 0.88rem; }
        .mpill { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: rgba(0,0,0,0.06); }
        .mpill.ok { background: #111; color: #fff; }
        .center { text-align: center; padding: 100px 20px; color: #6d6d74; }
        .center a { color: #111; font-weight: 600; }
        @media (max-width: 1100px) { .ccards { grid-template-columns: repeat(2, 1fr); } .cgrid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) {
          .console { flex-direction: column; }
          .cside { width: 100%; height: auto; position: relative; flex-direction: row; overflow-x: auto; padding: 10px 12px; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); gap: 6px; }
          .csec, .ccollapse { display: none; }
          .snav { width: auto; flex-shrink: 0; padding: 8px 12px; font-size: 0.85rem; }
          .cmain { padding: 16px 14px 48px; }
          .ctop { flex-wrap: wrap; }
          .csearch input { width: 130px; }
          .ccards { grid-template-columns: 1fr; }
        }
      `}</style>

      <aside className="cside">
        <div className="csec">CONSOLE</div>
        {sideItem("dashboard", <LayoutDashboard size={17} />, "Dashboard")}
        {sideItem("tokens", <KeyRound size={17} />, "API Token")}
        {sideItem("usage", <BarChart3 size={17} />, "Usage log")}
        {sideItem("models", <Zap size={17} />, "Model Status")}
        <div className="csec">PERSONAL CENTER</div>
        <Link href="/platform/profile" className="snav" style={{ textDecoration: "none" }}>
          <span className="snav-ic"><User size={17} /></span>
          {!collapsed && <span>Personal Settings</span>}
        </Link>
        <button className="ccollapse" onClick={() => setCollapsed((c) => !c)}>
          <span>{collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}</span>
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </aside>

      <main className="cmain">
        <div className="ctop">
          <h1>{greeting()}, {userName || "there"}</h1>
          <div className="ctools">
            <label className="csearch">
              <Search size={14} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search models..." />
            </label>
            <button className="cicbtn" onClick={refreshAll} title="Refresh"><RefreshCw size={15} /></button>
          </div>
        </div>

        {status === "checking" && <div className="center">Loading...</div>}
        {status === "login" && (
          <div className="center">
            <p>Sign in to open the console.</p>
            <Link href="/auth/login?next=/platform/api">Go to sign in</Link>
          </div>
        )}

        {status === "ready" && (
          <>
            {error && <div className="aerr" style={{ marginBottom: 14 }}>{error}</div>}

            {tab === "dashboard" && (
              <>
                <div className="ccards">
                  <div className="ccard">
                    <h3><Wallet size={15} /> Account Data</h3>
                    <div className="crow">
                      <span className="cdot"><User size={15} /></span>
                      <span><div className="lb">Account</div><div className="vl" style={{ fontSize: "0.95rem", wordBreak: "break-all" }}>{accountEmail || "—"}</div></span>
                    </div>
                    <div className="crow">
                      <span className="cdot"><Clock3 size={15} /></span>
                      <span><div className="lb">Member since</div><div className="vl" style={{ fontSize: "1.05rem" }}>{memberSince || "—"}</div></span>
                    </div>
                  </div>
                  <div className="ccard">
                    <h3><Activity size={15} /> Usage Statistics</h3>
                    <div className="crow">
                      <span className="cdot"><Send size={15} /></span>
                      <span><div className="lb">Number of Requests</div><div className="vl">{ranged.length}</div></span>
                    </div>
                    <div className="crow">
                      <span className="cdot"><ListOrdered size={15} /></span>
                      <span><div className="lb">Active days ({range}d)</div><div className="vl">{activeDays}</div></span>
                    </div>
                  </div>
                  <div className="ccard">
                    <h3><Zap size={15} /> Resource Consumption</h3>
                    <div className="crow">
                      <span className="cdot"><Database size={15} /></span>
                      <span><div className="lb">Models used</div><div className="vl">{distinctModels.length}</div></span>
                    </div>
                    <div className="crow">
                      <span className="cdot"><Cpu size={15} /></span>
                      <span><div className="lb">Top model</div><div className="vl" style={{ fontSize: "1rem" }}>{topModel}</div></span>
                    </div>
                  </div>
                  <div className="ccard">
                    <h3><Gauge size={15} /> Performance Indicators</h3>
                    <div className="crow">
                      <span className="cdot"><Timer size={15} /></span>
                      <span><div className="lb">Average RPM</div><div className="vl">{rpm}</div></span>
                    </div>
                    <div className="crow">
                      <span className="cdot"><BarChart3 size={15} /></span>
                      <span><div className="lb">Avg calls / day</div><div className="vl">{avgDay}</div></span>
                    </div>
                  </div>
                </div>

                <div className="cgrid">
                  <div className="cpanel">
                    <h3 style={{ margin: "0 0 4px", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={16} /> Model Data Analysis</h3>
                    <div className="ctabs">
                      {([["dist", "Consumption distribution"], ["trend", "Consumption trend"], ["ranking", "Models call ranking"]] as [AnalysisTab, string][]).map(([id, label]) => (
                        <button key={id} className={`ctab ${analysis === id ? "on" : ""}`} onClick={() => setAnalysis(id)}>
                          {label}
                        </button>
                      ))}
                      <span style={{ marginLeft: "auto" }}>
                        <span className="arange">
                          {([7, 30] as const).map((d) => (
                            <button key={d} className={range === d ? "on" : ""} onClick={() => setRange(d)}>{d}d</button>
                          ))}
                        </span>
                      </span>
                    </div>
                    {analysis === "dist" && (
                      perModel.length === 0 ? <p style={{ color: "#8b8b93", fontSize: "0.88rem" }}>No calls yet — run your first request below.</p> :
                      perModel.map(([m, n]) => (
                        <div key={m} className="cshare">
                          <span className="mn">{m}</span>
                          <span className="tr"><span className="fl" style={{ display: "block", width: `${Math.max(3, Math.round((n / (perModel[0]?.[1] || 1)) * 100))}%` }} /></span>
                          <span className="pc">{n}</span>
                        </div>
                      ))
                    )}
                    {analysis === "trend" && (
                      perDay.length === 0 ? <p style={{ color: "#8b8b93", fontSize: "0.88rem" }}>No calls yet.</p> :
                      <div className="cbars" style={{ display: "flex", alignItems: "flex-end", gap: 8, minHeight: 150 }}>
                        {perDay.map(([day, n]) => (
                          <div key={day} className="cbcol" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, height: 140 }} title={`${day}: ${n}`}>
                            <div className="cbar" style={{ width: "100%", maxWidth: 34, borderRadius: "6px 6px 2px 2px", background: "#111", height: `${maxDay > 0 ? Math.max(4, Math.round((n / maxDay) * 100)) : 4}%` }} />
                            <div className="cbar-day" style={{ fontSize: "0.65rem", color: "#8b8b93" }}>{day.slice(5)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {analysis === "ranking" && (
                      perModel.length === 0 ? <p style={{ color: "#8b8b93", fontSize: "0.88rem" }}>No calls yet.</p> :
                      <div style={{ overflowX: "auto" }}>
                      <table className="ctable">
                        <thead><tr><th>#</th><th>Model</th><th>Calls</th><th>Share</th></tr></thead>
                        <tbody>
                          {ranking.map(([m, n], i) => (
                            <tr key={m}>
                              <td>{i + 1}</td>
                              <td style={{ fontWeight: 600 }}>{m}</td>
                              <td>{n}</td>
                              <td>{totalCalls > 0 ? `${Math.round((n / totalCalls) * 100)}%` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </div>
                  <div className="cpanel">
                    <h3 style={{ margin: "0 0 12px", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}><Server size={16} /> API Information</h3>
                    <a className="apilink" href={origin || "/"} target="_blank" rel="noreferrer">{origin || "…"}</a>
                    <div className="arow" style={{ marginTop: 12 }}>
                      <button className="abtn abtn-ghost" disabled={speedBusy} onClick={speedTest} style={{ border: "1px solid rgba(0,0,0,0.15)", background: "transparent", color: "#111", padding: "8px 14px", borderRadius: 9, fontSize: "0.82rem", fontWeight: 650, cursor: "pointer", fontFamily: "inherit" }}>
                        {speedBusy ? "..." : "↯ Speed Test"}
                      </button>
                      <Link href="/developers/docs" className="abtn abtn-ghost" style={{ border: "1px solid rgba(0,0,0,0.15)", padding: "8px 14px", borderRadius: 9, fontSize: "0.82rem", textDecoration: "none" }}>
                        ↗ Jump
                      </Link>
                    </div>
                    {speedMs !== null && <p style={{ fontSize: "0.85rem", margin: "10px 0 0" }}>Latency: <b>{speedMs} ms</b></p>}
                    <p style={{ fontSize: "0.8rem", color: "#8b8b93", margin: "12px 0 0" }}>
                      {models.length > 0 ? `${models.length} models online` : "Model catalog"} · {modelsMs !== null ? `${modelsMs} ms` : "…"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {tab === "tokens" && (
              <div className="cpanel">
                <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}><KeyRound size={16} /> API Token</h3>
                <p style={{ fontSize: "0.87rem", color: "#6d6d74", margin: "0 0 12px" }}>
                  Keys start with <code>sk-palama-</code> and work as a Bearer token. The full key is shown once.
                </p>
                <form className="arow" onSubmit={(e) => { e.preventDefault(); if (busy !== "create") createKey(e); }}>
                  <input className="ainput" placeholder="Key name (e.g. Production)" value={newName} maxLength={60} onChange={(e) => setNewName(e.target.value)} />
                  <button className="abtn" disabled={busy !== null}>{busy === "create" ? "Creating..." : "Create key"}</button>
                </form>
                {freshKey && (
                  <div className="afresh" style={{ background: "#111", borderColor: "#111", marginTop: 12 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>Copy it now — never shown again:</span>
                    <code style={{ color: "#fff" }}>{freshKey}</code>
                    <div className="arow">
                      <button className="abtn" style={{ background: "#fff", color: "#111" }} onClick={() => copy("fresh", freshKey)}>
                        {copied === "fresh" ? "Copied" : "Copy"}
                      </button>
                      <button className="abtn abtn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={() => setFreshKey(null)}>Done</button>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  {keys.length === 0 && <p style={{ fontSize: "0.88rem", color: "#8b8b93" }}>No keys yet.</p>}
                  {keys.map((k) => (
                    <div key={k.id} className="akey">
                      <span className="nm">{k.name}</span>
                      <span className="pf">{k.prefix}...</span>
                      <span className="meta">{k.last_used_at ? `used ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}</span>
                      {!k.revoked ? (
                        <button className="abtn abtn-danger" disabled={busy !== null} onClick={() => revokeKey(k.id)}>
                          {busy === k.id ? "..." : "Revoke"}
                        </button>
                      ) : (
                        <span className="meta">revoked</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "usage" && (
              <div className="cpanel">
                <div className="docrow" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 8px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={16} /> Usage log</h3>
                  <span className="arange">
                    {([7, 30] as const).map((d) => (
                      <button key={d} className={range === d ? "on" : ""} onClick={() => setRange(d)}>{d}d</button>
                    ))}
                  </span>
                </div>
                {ranged.length === 0 ? (
                  <p style={{ fontSize: "0.88rem", color: "#8b8b93" }}>No API calls in this range yet.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                  <table className="ctable">
                    <thead><tr><th>Time</th><th>Endpoint</th><th>Model</th></tr></thead>
                    <tbody>
                      {ranged.slice(0, 200).map((r, i) => (
                        <tr key={i}>
                          <td style={{ whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString()}</td>
                          <td><code style={{ fontSize: "0.8rem" }}>{r.endpoint}</code></td>
                          <td>{r.model || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            )}

            {tab === "models" && (
              <div className="cpanel">
                <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}><Zap size={16} /> Model Status</h3>
                <p style={{ fontSize: "0.87rem", color: "#6d6d74", margin: "0 0 12px" }}>
                  Live catalog{modelsMs !== null ? ` · answered in ${modelsMs} ms` : ""}.
                </p>
                {models.length === 0 ? (
                  <p style={{ fontSize: "0.88rem", color: "#8b8b93" }}>Catalog unavailable right now.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                  <table className="ctable">
                    <thead><tr><th>Model</th><th>Provider</th><th>Status</th></tr></thead>
                    <tbody>
                      {models.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }}>{m.id}</td>
                          <td>{m.provider || "—"}</td>
                          <td><span className="mpill ok">online</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
