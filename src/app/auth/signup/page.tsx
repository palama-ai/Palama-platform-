"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
          // Explicit redirect: never fall back to the dashboard Site URL
          // (localhost) for the confirmation link.
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      // Supabase sends a confirmation email by default
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || `Could not authenticate with ${provider}.`);
      setLoading(false);
    }
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
        
        .massive-brand-text { font-size: clamp(5rem, 12vw, 14rem); font-weight: 800; line-height: 0.85; letter-spacing: -0.04em; color: transparent; background: linear-gradient(180deg, #52525b 0%, #18181b 100%); -webkit-background-clip: text; background-clip: text; user-select: none; pointer-events: none; position: relative; z-index: 10; }
        .massive-sub-text { font-size: 0.6em; margin-left: 16px; background: linear-gradient(180deg, #27272a 0%, #000000 90%); -webkit-background-clip: text; background-clip: text; display: block; }
        
        .auth-card { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 24px; position: relative; z-index: 10; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; justify-content: center; text-decoration: none; color: #fff; font-weight: 600; font-size: 1.15rem; }
        .auth-logo img { width: 28px; height: 28px; }
        .auth-title { font-size: 1.75rem; font-weight: 600; color: #fff; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em; }
        .auth-sub { font-size: 0.95rem; color: #a1a1aa; text-align: center; margin: 0; }
        
        .auth-field { display: flex; flex-direction: column; gap: 8px; }
        .auth-label { font-size: 0.9rem; font-weight: 500; color: #e4e4e7; }
        .auth-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px; color: #fff; font-size: 1rem; font-family: inherit; outline: none; transition: all 0.2s; width: 100%; }
        .auth-input:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        .auth-input::placeholder { color: #52525b; }
        
        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; font-size: 0.95rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-btn:hover { background: #e4e4e7; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        
        .auth-btn-outline { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #fff; font-size: 0.95rem; font-weight: 500; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .auth-btn-outline:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.3); }
        
        .auth-divider { display: flex; align-items: center; gap: 16px; color: #71717a; font-size: 0.85rem; margin: 8px 0; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
        
        .auth-link { color: #a1a1aa; text-decoration: none; transition: color 0.2s; }
        .auth-link:hover { color: #fff; text-decoration: underline; }

        .ambient-glow-1 { position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(46,123,255,0.05) 0%, transparent 60%); border-radius: 50%; filter: blur(60px); pointer-events: none; }
        .ambient-glow-2 { position: absolute; bottom: -10%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(0,212,136,0.03) 0%, transparent 60%); border-radius: 50%; filter: blur(80px); pointer-events: none; }

        .auth-error { color: #f87171; font-size: 0.88rem; text-align: center; padding: 4px 0; }
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
            <h1 className="auth-title">Create an account</h1>
            <p className="auth-sub">Start automating in seconds.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input className="auth-input" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required disabled={loading} />
            </div>
            
            <button type="submit" className="auth-btn" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button className="auth-btn-outline" onClick={() => handleOAuthLogin("google")} disabled={loading}>
            <img src="https://cdn.simpleicons.org/google/ffffff" width={18} height={18} alt="" />
            Continue with Google
          </button>

          <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#a1a1aa", margin: "16px 0 0" }}>
            Already have an account? <Link href="/auth/login" className="auth-link" style={{ color: "#fff", textDecoration: "underline" }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
