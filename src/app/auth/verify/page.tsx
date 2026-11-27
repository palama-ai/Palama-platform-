"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("@")) return "/dashboard";
  return raw;
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#000", alignItems: "center", justifyContent: "center", color: "#a1a1aa", fontFamily: "sans-serif" }}>
          Loading...
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
        // Refresh / read authoritative server user state
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
          setNotice("Still waiting for confirmation — open the verification link in your inbox, or click Sign in if you confirmed on another device.");
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

  // Poll automatically every 3 seconds + on window focus (catches confirmation opened in another browser tab)
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
    <div className="auth-split">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .auth-split { display: flex; min-height: 100vh; width: 100%; background: #000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .auth-left { display: none; flex: 1.2; position: relative; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.05); align-items: center; justify-content: flex-start; padding-left: 8vw; background: #000; }
        @media (min-width: 992px) { .auth-left { display: flex; } }
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px; position: relative; background: #000; }
        .massive-brand-text { font-size: clamp(5rem, 12vw, 14rem); font-weight: 800; line-height: 0.85; letter-spacing: -0.04em; color: transparent; background: linear-gradient(180deg, #52525b 0%, #18181b 100%); -webkit-background-clip: text; background-clip: text; user-select: none; pointer-events: none; position: relative; z-index: 10; }
        .auth-card { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 20px; position: relative; z-index: 10; }
        .verify-icon-badge { width: 52px; height: 52px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; color: #fff; }
        .auth-title { font-size: 1.7rem; font-weight: 600; color: #fff; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em; }
        .auth-sub { font-size: 0.94rem; color: #a1a1aa; text-align: center; margin: 0; line-height: 1.55; }
        .email-pill { display: inline-block; margin-top: 6px; padding: 4px 12px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; font-weight: 600; font-size: 0.86rem; word-break: break-all; }
        .steps-box { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.025); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; font-size: 0.86rem; color: #d4d4d8; }
        .step-row { display: flex; align-items: flex-start; gap: 10px; line-height: 1.45; }
        .step-num { width: 20px; height: 20px; border-radius: 999px; background: rgba(255,255,255,0.12); color: #fff; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; font-size: 0.94rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
        .auth-btn:hover { background: #e4e4e7; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .auth-btn-outline { width: 100%; padding: 11px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #fff; font-size: 0.9rem; font-weight: 500; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
        .auth-btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.3); }
        .auth-btn-outline:disabled { opacity: 0.55; cursor: not-allowed; }
        .auth-error { color: #f87171; font-size: 0.86rem; text-align: center; }
        .auth-notice { color: #a1a1aa; font-size: 0.84rem; text-align: center; line-height: 1.45; }
        .auth-success { color: #34d399; font-size: 0.86rem; text-align: center; }
        .ambient-glow-1 { position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(46,123,255,0.05) 0%, transparent 60%); border-radius: 50%; filter: blur(60px); pointer-events: none; }
        .ambient-glow-2 { position: absolute; bottom: -10%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(0,212,136,0.03) 0%, transparent 60%); border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      <div className="auth-left">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <motion.div
          className="massive-brand-text"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Confirm<br />Account
        </motion.div>
      </div>

      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div style={{ textAlign: "center" }}>
            <div className="verify-icon-badge">
              {verified ? <CheckCircle2 size={24} color="#34d399" /> : <Mail size={24} />}
            </div>
            <h1 className="auth-title">{verified ? "Email confirmed!" : "Check your email"}</h1>
            <p className="auth-sub">
              We sent a confirmation <strong>link</strong> to
            </p>
            {email ? <span className="email-pill">{email}</span> : <span className="email-pill">your email address</span>}
          </div>

          <div className="steps-box">
            <div className="step-row">
              <span className="step-num">1</span>
              <span>Open the verification email from Palama in your inbox (check spam/promotions if needed).</span>
            </div>
            <div className="step-row">
              <span className="step-num">2</span>
              <span>Click the <strong>Confirm your email</strong> link inside the message — no code needed.</span>
            </div>
            <div className="step-row">
              <span className="step-num">3</span>
              <span>Once confirmed, you will continue automatically to complete your quick waitlist profile.</span>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {resent && <div className="auth-success">A new verification link has been sent!</div>}
          {notice && <div className="auth-notice">{notice}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              className="auth-btn"
              onClick={() => checkVerificationStatus(true)}
              disabled={checking || verified}
            >
              <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
              {verified ? "Redirecting..." : checking ? "Checking confirmation..." : "I clicked the link — Continue"}
            </button>

            {email && (
              <button
                type="button"
                className="auth-btn-outline"
                onClick={handleResend}
                disabled={cooldown > 0}
              >
                {cooldown > 0 ? `Resend link in ${cooldown}s` : "Resend verification link"}
              </button>
            )}

            <Link href={loginUrl} className="auth-btn-outline">
              Verified on another device? Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
