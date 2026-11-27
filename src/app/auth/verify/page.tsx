"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("@")) return "/dashboard";
  return raw;
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            width: "100%",
            background: "#000",
            alignItems: "center",
            justifyContent: "center",
            color: "#71717a",
            fontFamily: "var(--font-geist-sans), 'Inter', sans-serif",
            fontSize: "0.9rem",
          }}
        >
          Checking session...
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim();
  const nextPath = safeNext(searchParams.get("next"));
  const onboardingDest =
    nextPath !== "/dashboard" ? `/onboarding?next=${encodeURIComponent(nextPath)}` : "/onboarding";

  const supabase = createClient();

  const checkVerificationStatus = useCallback(
    async (manual = false) => {
      if (manual) {
        setChecking(true);
        setNotice(null);
        setError(null);
      }
      try {
        const res = await fetch("/api/waitlist/status", { cache: "no-store" });
        if (res.ok) {
          const st = await res.json();
          if (st.emailVerified) {
            setVerified(true);
            const target = st.onboardingCompleted || st.isAdmin ? nextPath : onboardingDest;
            router.replace(target);
            return;
          }
        }
        const { data } = await supabase.auth.getUser();
        if (data?.user && (data.user.email_confirmed_at || (data.user as any).confirmed_at)) {
          setVerified(true);
          router.replace(onboardingDest);
          return;
        }
        if (manual) {
          setNotice("Awaiting link confirmation — check your inbox or spam folder, or sign in if you verified from another browser.");
        }
      } catch {
        if (manual) {
          setError("Could not check verification right now. Please try again.");
        }
      } finally {
        if (manual) setChecking(false);
      }
    },
    [nextPath, onboardingDest, router, supabase]
  );

  // Poll automatically every 3 seconds + on window focus (catches link clicked in another tab)
  useEffect(() => {
    checkVerificationStatus(false);
    const id = setInterval(() => checkVerificationStatus(false), 3000);
    const onFocus = () => checkVerificationStatus(false);
    window.addEventListener("focus", onFocus);

    const { data: authSub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (sess?.user && (sess.user.email_confirmed_at || (sess.user as any).confirmed_at)) {
        setVerified(true);
        router.replace(onboardingDest);
      }
    });

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      authSub.subscription.unsubscribe();
    };
  }, [checkVerificationStatus, onboardingDest, router, supabase]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setError(null);
    setNotice(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(onboardingDest)}`,
        },
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setResent(true);
      setCooldown(30);
    } catch (err: any) {
      setError(err?.message || "Could not resend verification link.");
    }
  };

  const loginUrl = `/auth/login?next=${encodeURIComponent(onboardingDest)}`;

  return (
    <div className="palama-verify-split">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .palama-verify-split {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #000;
          font-family: var(--font-geist-sans), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
        }
        .pv-brand-top {
          position: fixed;
          top: 24px;
          left: 28px;
          z-index: 30;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.04em;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        .pv-brand-top:hover { opacity: 1; }
        .pv-left {
          display: none;
          flex: 1.15;
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
          align-items: center;
          justify-content: flex-start;
          padding-left: 8vw;
          background: #000;
        }
        @media (min-width: 992px) { .pv-left { display: flex; } }
        .pv-glow {
          position: absolute;
          top: -15%;
          left: -12%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 62%);
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .pv-massive {
          font-size: clamp(5rem, 11.5vw, 13.5rem);
          font-weight: 800;
          line-height: 0.86;
          letter-spacing: -0.045em;
          color: transparent;
          background: linear-gradient(180deg, #52525b 0%, #141417 100%);
          -webkit-background-clip: text;
          background-clip: text;
          user-select: none;
          pointer-events: none;
          position: relative;
          z-index: 2;
        }
        .pv-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 28px;
          background: #000;
        }
        .pv-panel {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .pv-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #71717a;
        }
        .pv-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 0 0 rgba(255,255,255,0.45);
          animation: pv-pulse 2s infinite;
        }
        @keyframes pv-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); opacity: 1; }
          70% { box-shadow: 0 0 0 6px rgba(255,255,255,0); opacity: 0.6; }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); opacity: 1; }
        }
        .pv-title {
          font-size: clamp(1.75rem, 3vw, 2.15rem);
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.035em;
          line-height: 1.12;
          margin: 10px 0 10px;
        }
        .pv-sub {
          font-size: 0.94rem;
          color: #a1a1aa;
          line-height: 1.6;
          margin: 0;
        }
        .pv-dossier {
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pv-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 0.84rem;
        }
        .pv-row-label { color: #71717a; }
        .pv-row-val {
          color: #f4f4f5;
          font-weight: 500;
          text-align: right;
          word-break: break-all;
        }
        .pv-btn-primary {
          width: 100%;
          padding: 13px 20px;
          border-radius: 9999px;
          border: none;
          background: #fff;
          color: #000;
          font-size: 0.92rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }
        .pv-btn-primary:hover:not(:disabled) { background: #e4e4e7; transform: translateY(-1px); }
        .pv-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .pv-btn-outline {
          width: 100%;
          padding: 12px 18px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: transparent;
          color: #e4e4e7;
          font-size: 0.88rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
        }
        .pv-btn-outline:hover:not(:disabled) {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.3);
          color: #fff;
        }
        .pv-btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
        .pv-msg { font-size: 0.84rem; color: #a1a1aa; line-height: 1.5; }
        .pv-msg-err { font-size: 0.84rem; color: #f87171; line-height: 1.5; }
        .pv-msg-ok { font-size: 0.84rem; color: #f4f4f5; line-height: 1.5; }
      `}</style>

      <Link href="/" className="pv-brand-top">
        <img src="/logo.png" alt="Palama" width={22} height={22} style={{ objectFit: "contain" }} />
        <span>PALAMA</span>
      </Link>

      <div className="pv-left">
        <div className="pv-glow" />
        <motion.div
          className="pv-massive"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          Palama
          <br />
          Co-Worker
        </motion.div>
      </div>

      <div className="pv-right">
        <motion.div
          className="pv-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="pv-eyebrow">
              <span className="pv-pulse-dot" />
              <span>{verified ? "Identity Confirmed" : "Step 01 — Confirmation"}</span>
            </div>
            <h1 className="pv-title">{verified ? "Email confirmed." : "Confirm your email."}</h1>
            <p className="pv-sub">
              {verified
                ? "Continuing to your workspace setup..."
                : "Open the confirmation link sent to your inbox. This window advances automatically the moment you verify."}
            </p>
          </div>

          <div className="pv-dossier">
            <div className="pv-row">
              <span className="pv-row-label">Destination</span>
              <span className="pv-row-val">{email || "Your registered email"}</span>
            </div>
            <div className="pv-row">
              <span className="pv-row-label">Method</span>
              <span className="pv-row-val">Confirmation link (no code)</span>
            </div>
            <div className="pv-row">
              <span className="pv-row-label">Status</span>
              <span className="pv-row-val">{verified ? "Confirmed" : "Listening for confirmation"}</span>
            </div>
          </div>

          {error && <div className="pv-msg-err">{error}</div>}
          {resent && <div className="pv-msg-ok">A fresh confirmation link has been dispatched.</div>}
          {notice && <div className="pv-msg">{notice}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              className="pv-btn-primary"
              onClick={() => checkVerificationStatus(true)}
              disabled={checking || verified}
            >
              {checking ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Checking confirmation...</span>
                </>
              ) : verified ? (
                <span>Redirecting...</span>
              ) : (
                <>
                  <span>I clicked the link — Continue</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {email && (
              <button
                type="button"
                className="pv-btn-outline"
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend confirmation link"}
              </button>
            )}

            <div style={{ textAlign: "center", paddingTop: 6 }}>
              <Link
                href={loginUrl}
                style={{
                  fontSize: "0.84rem",
                  color: "#71717a",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                Verified on another device? <span style={{ color: "#e4e4e7", textDecoration: "underline" }}>Sign in</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
