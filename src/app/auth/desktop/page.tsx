"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

/**
 * Palama Desktop authorize page (Codex-style browser login).
 * Logged-in users approve here; the page hands the Supabase session
 * to the desktop app via the palama:// custom protocol.
 */
export default function DesktopAuthPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "sent" | "login">("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [coworkerKey, setCoworkerKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const supabase = createClient();

  const ensureCoworkerKey = async () => {
    // Every desktop user gets one "Co-Worker" API key (created once, shown here).
    try {
      const list = await fetch("/api/keys", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}));
      if (Array.isArray(list.keys) && list.keys.some((k: any) => !k.revoked)) return;
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Co-Worker" }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.key) setCoworkerKey(j.key);
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session?.user) {
        setEmail(data.session.user.email || null);
        setStatus("ready");
        ensureCoworkerKey();
      } else {
        setStatus("login");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const authorize = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      setStatus("login");
      return;
    }
    const params = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    const reqState = new URLSearchParams(window.location.search).get("state");
    if (reqState && /^[a-zA-Z0-9._-]{8,128}$/.test(reqState)) {
      params.set("state", reqState);
    }
    setStatus("sent");
    window.location.href = `palama://auth?${params.toString()}`;
  };

  return (
    <div className="auth-split">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .auth-split { display: flex; min-height: 100vh; width: 100%; background: #000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .auth-left { display: none; flex: 1.2; position: relative; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.05); align-items: center; justify-content: flex-start; padding-left: 8vw; background: #000; }
        @media (min-width: 992px) { .auth-left { display: flex; } }
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px; position: relative; background: #000; }
        .massive-brand-text { font-size: clamp(5rem, 12vw, 14rem); font-weight: 800; line-height: 0.85; letter-spacing: -0.04em; color: transparent; background: linear-gradient(180deg, #52525b 0%, #18181b 100%); -webkit-background-clip: text; background-clip: text; user-select: none; pointer-events: none; }
        .auth-card { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 24px; }
        .auth-title { font-size: 1.75rem; font-weight: 600; color: #fff; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em; }
        .auth-sub { font-size: 0.95rem; color: #a1a1aa; text-align: center; margin: 0; }
        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; font-size: 0.95rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-btn:hover { background: #e4e4e7; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-btn-outline { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #fff; font-size: 0.95rem; font-weight: 500; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; text-decoration: none; }
        .auth-btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.3); }
        .auth-note { font-size: 0.85rem; color: #71717a; text-align: center; margin: 0; line-height: 1.5; }
      `}</style>

      <div className="auth-left">
        <img src="/logo.png" alt="Palama" width={80} height={80} style={{ objectFit: "contain", marginBottom: 24 }} />
        <div className="massive-brand-text">Palama<br />Desktop</div>
      </div>

      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 className="auth-title">Connect desktop app</h1>
            <p className="auth-sub">
              {status === "login"
                ? "Sign in first, then authorize Palama Desktop."
                : "Authorize Palama Desktop to use your account."}
            </p>
          </div>

          {status === "checking" && (
            <p className="auth-note">Checking your session...</p>
          )}

          {status === "login" && (
            <Link href="/auth/login?next=/auth/desktop" className="auth-btn-outline">
              Go to sign in
            </Link>
          )}

          {status === "ready" && (
            <>
              <p className="auth-note">Signed in as {email}</p>
              <button className="auth-btn" onClick={authorize}>
                Authorize Palama Desktop
              </button>
              <p className="auth-note">You will be sent back to the app automatically.</p>
              {coworkerKey && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, padding: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10 }}>
                  <p className="auth-note" style={{ margin: 0, textAlign: "left" }}>
                    Your Co-Worker API key (save it — shown once):
                  </p>
                  <code style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#fff", wordBreak: "break-all", userSelect: "all" }}>
                    {coworkerKey}
                  </code>
                  <button
                    className="auth-btn-outline"
                    style={{ width: "auto", padding: "8px 12px" }}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(coworkerKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      } catch {}
                    }}
                  >
                    {copiedKey ? "Copied" : "Copy key"}
                  </button>
                </div>
              )}
            </>
          )}

          {status === "sent" && (
            <>
              <p className="auth-note">Opening Palama Desktop...</p>
              <button className="auth-btn-outline" onClick={authorize}>
                Click here if the app did not open
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
