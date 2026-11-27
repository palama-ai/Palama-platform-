"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

/**
 * Public download page for Palama Co-Worker.
 * Windows button activates via NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL
 * (upload the installer and set the URL when ready — no app build here).
 * macOS visitors join the waitlist instead.
 */
const WINDOWS_URL = process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL || "";

export default function DownloadPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user?.email) setEmail((e) => e || data.user.email!);
    });
    return () => { cancelled = true; };
  }, []);

  const joinMac = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setMsg("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("sending");
    setMsg("");
    const { error } = await supabase.from("waitlist").insert({ email: clean, platform: "macos" });
    if (error) {
      if ((error as any).code === "23505") {
        setMsg("You're already on the macOS waitlist.");
        setState("done");
      } else {
        setMsg("Could not join right now. Please try again later.");
        setState("error");
      }
      return;
    }
    setState("done");
    setMsg("You're on the macOS waitlist. We'll email you at launch.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#ededed", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .dl-hero { padding: calc(var(--nav-height) + 90px) 24px 40px; text-align: center; max-width: 720px; margin: 0 auto; }
        .dl-kicker { color: #a1a1aa; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 20px; }
        .dl-title { font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 16px; color: #fff; }
        .dl-sub { font-size: 1.05rem; color: #a1a1aa; margin: 0 auto; max-width: 560px; line-height: 1.65; }
        .dl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 880px; margin: 0 auto; padding: 0 24px 110px; }
        .dl-card { background: #111; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 36px 30px; display: flex; flex-direction: column; gap: 12px; align-items: stretch; text-align: center; }
        .dl-card h2 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #fff; }
        .dl-card p { font-size: 0.92rem; color: #a1a1aa; margin: 0; line-height: 1.6; }
        .dl-os { display: flex; justify-content: center; color: #fff; }
        .dl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; margin-top: 8px; padding: 14px; border-radius: 12px; border: none; background: #fff; color: #000; font-size: 1rem; font-weight: 650; font-family: inherit; cursor: pointer; text-decoration: none; }
        .dl-btn.disabled { opacity: 0.45; cursor: not-allowed; }
        .dl-form { display: flex; gap: 8px; margin-top: 8px; }
        .dl-input { flex: 1; min-width: 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 13px 16px; color: #fff; font-size: 0.92rem; font-family: inherit; outline: none; }
        .dl-input:focus { border-color: rgba(255,255,255,0.35); }
        .dl-join { padding: 13px 22px; border-radius: 12px; border: none; background: #fff; color: #000; font-size: 0.92rem; font-weight: 650; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .dl-join:disabled { opacity: 0.6; cursor: not-allowed; }
        .dl-ok { color: #4ade80; font-size: 0.9rem; }
        .dl-err { color: #f87171; font-size: 0.9rem; }
        @media (max-width: 720px) {
          .dl-grid { grid-template-columns: 1fr; padding: 0 16px 72px; }
          .dl-hero { padding: calc(var(--nav-height) + 40px) 16px 28px; }
          .dl-card { padding: 26px 20px; }
          .dl-form { flex-direction: column; }
        }
      `}</style>

      <section className="dl-hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <img src="/logo.png" alt="Palama Co-Worker" width={72} height={72} style={{ objectFit: "contain", margin: "0 auto 20px", display: "block" }} />
          <div className="dl-kicker">Download</div>
          <h1 className="dl-title">Palama Co-Worker</h1>
          <p className="dl-sub">Your AI desktop assistant. Available now for Windows — macOS is on the way.</p>
        </motion.div>
      </section>

      <section className="dl-grid">
        <motion.div className="dl-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="dl-os"><img src="/window.png" alt="Windows" width={44} height={44} style={{ borderRadius: 10 }} /></div>
          <h2>Windows</h2>
          <p>Windows 10 and 11 (64-bit). Free during early access.</p>
          {WINDOWS_URL ? (
            <a className="dl-btn" href={WINDOWS_URL}>Download for Windows</a>
          ) : (
            <button className="dl-btn disabled" disabled title="The installer will be uploaded here when ready">
              Coming soon
            </button>
          )}
        </motion.div>

        <motion.div className="dl-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <div className="dl-os"><img src="/apple.png" alt="macOS" width={44} height={44} style={{ borderRadius: 10 }} /></div>
          <h2>macOS</h2>
          <p>Join the waitlist and get notified at launch.</p>
          {state === "done" ? (
            <p className="dl-ok">{msg || "You're on the macOS waitlist."}</p>
          ) : (
            <form className="dl-form" onSubmit={joinMac}>
              <input
                className="dl-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "sending"}
              />
              <button className="dl-join" disabled={state === "sending"}>
                {state === "sending" ? "..." : "Join"}
              </button>
            </form>
          )}
          {state === "error" && <p className="dl-err">{msg}</p>}
        </motion.div>
      </section>
    </div>
  );
}
