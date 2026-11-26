"use client";
import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#000", alignItems: "center", justifyContent: "center", color: "#a1a1aa", fontFamily: "sans-serif" }}>
        Loading...
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}

function VerifyPageContent() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const supabase = createClient();

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) v = v[v.length - 1];
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = code.join("");
      if (token.length < 6) {
        setError("Please enter the 6-digit verification code.");
        setLoading(false);
        return;
      }

      // Try verifying via OTP signup type
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      if (verifyError) {
        // Fallback to "email" type
        const { error: verifyError2 } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });

        if (verifyError2) {
          setError(verifyError2.message);
          setLoading(false);
          return;
        }
      }

      // Success - Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setResent(true);
    } catch (err: any) {
      setError(err.message || "Could not resend code.");
    }
  };

  useEffect(() => { refs.current[0]?.focus(); }, []);

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
        .massive-sub-text { font-size: 0.6em; margin-left: 16px; background: linear-gradient(180deg, #27272a 0%, #000000 90%); -webkit-background-clip: text; background-clip: text; display: block; }
        
        .auth-card { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 24px; position: relative; z-index: 10; align-items: center; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; justify-content: center; text-decoration: none; color: #fff; font-weight: 600; font-size: 1.15rem; }
        .auth-logo img { width: 28px; height: 28px; }
        .auth-title { font-size: 1.75rem; font-weight: 600; color: #fff; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em; }
        .auth-sub { font-size: 0.95rem; color: #a1a1aa; text-align: center; margin: 0; line-height: 1.5; }
        .auth-note { font-size: 0.85rem; color: #71717a; text-align: center; margin: 0; line-height: 1.4; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; width: 100%; }
        
        .code-inputs { display: flex; gap: 12px; margin: 12px 0 24px; }
        .code-box { width: 48px; height: 56px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #fff; font-size: 1.25rem; font-weight: 500; text-align: center; font-family: 'Space Mono', monospace; outline: none; transition: all 0.2s; }
        .code-box:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        
        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; font-size: 0.95rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-btn:hover:not(:disabled) { background: #e4e4e7; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .auth-link { color: #a1a1aa; text-decoration: none; transition: color 0.2s; background: none; border: none; font-size: 0.9rem; font-family: inherit; cursor: pointer; padding: 0; }
        .auth-link:hover { color: #fff; text-decoration: underline; }
        
        .error-banner { width: 100%; padding: 4px 0; color: #f87171; font-size: 0.85rem; text-align: center; }

        .ambient-glow-1 { position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(46,123,255,0.05) 0%, transparent 60%); border-radius: 50%; filter: blur(60px); pointer-events: none; }
        .ambient-glow-2 { position: absolute; bottom: -10%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(0,212,136,0.03) 0%, transparent 60%); border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      {/* Left Panel - Brand */}
      <div className="auth-left">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <motion.div 
          className="massive-brand-text"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Palama<br />Persona
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-sub">
              We sent a verification link & code to<br />
              <strong style={{ color: "#fff", fontWeight: 500 }}>{email}</strong>
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="code-inputs">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el; }}
                className="code-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                disabled={loading}
              />
            ))}
          </div>

          <button className="auth-btn" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          <p className="auth-note">
            💡 <strong>Direct Access:</strong> You can also just click the verification link in the email we sent you, then refresh or return here.
          </p>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            {resent ? (
              <span style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>Verification email resent</span>
            ) : (
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#a1a1aa" }}>
                Didn&apos;t receive the code? <button className="auth-link" onClick={handleResend}>Resend email</button>
              </p>
            )}
          </div>

          <Link href="/auth/login" className="auth-link" style={{ marginTop: 24 }}>
            ← Back to sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
