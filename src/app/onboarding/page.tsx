"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LogOut, User, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const ROLES = [
  { id: "creator", label: "Content Creator", desc: "Video, media & publishing" },
  { id: "developer", label: "Developer", desc: "Code, terminal & builds" },
  { id: "designer", label: "Designer", desc: "UI systems & visual craft" },
  { id: "researcher", label: "Researcher", desc: "Synthesis & deep analysis" },
  { id: "founder", label: "Founder", desc: "Strategy & operations" },
  { id: "marketing", label: "Marketing", desc: "Growth & campaigns" },
  { id: "operations", label: "Operations", desc: "Coordination & workflows" },
  { id: "student", label: "Student", desc: "Study & academic research" },
  { id: "other", label: "Other", desc: "Custom discipline" },
] as const;

const TEAM_SIZES = ["2-5", "6-20", "21-50", "50+"] as const;

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("@")) return "/dashboard";
  return raw;
}

export default function OnboardingPage() {
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
          Loading...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next"));
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState<string>("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("developer");
  const [roleOther, setRoleOther] = useState("");
  const [usageType, setUsageType] = useState<"solo" | "team">("solo");
  const [teamSize, setTeamSize] = useState<string>("2-5");
  const [useCase, setUseCase] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/waitlist/status", { cache: "no-store" });
        if (res.status === 401) {
          const qs =
            nextPath !== "/dashboard"
              ? `?next=${encodeURIComponent(`/onboarding?next=${encodeURIComponent(nextPath)}`)}`
              : "?next=/onboarding";
          if (!cancelled) router.replace(`/auth/login${qs}`);
          return;
        }
        const st = await res.json();
        if (cancelled) return;

        if (!st.emailVerified) {
          const qs = new URLSearchParams();
          if (st.email) qs.set("email", st.email);
          if (nextPath !== "/dashboard") qs.set("next", nextPath);
          router.replace(`/auth/verify?${qs.toString()}`);
          return;
        }

        if (st.onboardingCompleted || st.isAdmin) {
          router.replace(nextPath);
          return;
        }

        if (st.email) setAccountEmail(st.email);

        const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        if (!cancelled && userData?.user?.user_metadata?.full_name) {
          setFullName(String(userData.user.user_metadata.full_name));
        }
      } catch {
        setError("Could not load your account state. Please refresh.");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nextPath, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/waitlist/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          role,
          roleOther: role === "other" ? roleOther.trim() : "",
          usageType,
          teamSize: usageType === "team" ? teamSize : null,
          useCase: useCase.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          router.replace(
            `/auth/verify${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`
          );
          return;
        }
        setError(data.error || "Please check your details and try again.");
        setSubmitting(false);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    router.replace("/");
    router.refresh();
  };

  if (checking) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          background: "#000",
          alignItems: "center",
          justifyContent: "center",
          color: "#a1a1aa",
          fontFamily: "var(--font-geist-sans), 'Inter', sans-serif",
          gap: 10,
          fontSize: "0.9rem",
        }}
      >
        <Loader2 size={16} className="animate-spin" />
        <span>Verifying account status...</span>
      </div>
    );
  }

  return (
    <div className="onb-split">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .onb-split {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: #000;
          color: #fff;
          font-family: var(--font-geist-sans), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .onb-rail {
          display: none;
          width: 42%;
          min-width: 360px;
          max-width: 540px;
          border-right: 1px solid rgba(255,255,255,0.08);
          padding: 36px 48px;
          flex-direction: column;
          justify-content: space-between;
          position: sticky;
          top: 0;
          height: 100vh;
          background: radial-gradient(circle at 18% 18%, rgba(255,255,255,0.035) 0%, #000 58%);
        }
        @media (min-width: 960px) { .onb-rail { display: flex; } }
        .onb-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          letter-spacing: 0.04em;
        }
        .onb-rail-body {
          max-width: 390px;
        }
        .onb-kicker {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #71717a;
          margin-bottom: 14px;
        }
        .onb-hero-h {
          font-size: clamp(2rem, 3.2vw, 2.75rem);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: #fff;
          margin: 0 0 16px;
        }
        .onb-hero-p {
          font-size: 0.94rem;
          line-height: 1.6;
          color: #8e8e93;
          margin: 0 0 36px;
        }
        .onb-steps {
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
        }
        .onb-step {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 0.82rem;
          color: #52525b;
        }
        .onb-step.done { color: #a1a1aa; }
        .onb-step.active { color: #ffffff; font-weight: 600; }
        .onb-step-num {
          font-family: ui-monospace, monospace;
          font-size: 0.74rem;
          margin-right: 12px;
          opacity: 0.65;
        }
        .onb-rail-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 0.8rem;
          color: #71717a;
        }
        .onb-signout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          color: #a1a1aa;
          font-size: 0.8rem;
          font-family: inherit;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .onb-signout:hover { color: #fff; }
        .onb-canvas {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px 64px;
          background: #000;
        }
        .onb-mobile-top {
          display: flex;
          width: 100%;
          max-width: 560px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        @media (min-width: 960px) { .onb-mobile-top { display: none; } }
        .onb-form-wrap {
          width: 100%;
          max-width: 560px;
        }
        .onb-form-head {
          margin-bottom: 28px;
        }
        .onb-form-title {
          font-size: 1.55rem;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #fff;
          margin: 0 0 6px;
        }
        .onb-form-sub {
          font-size: 0.9rem;
          color: #8e8e93;
          margin: 0;
        }
        .onb-section { margin-bottom: 24px; }
        .onb-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 500;
          color: #d4d4d8;
          margin-bottom: 9px;
        }
        .onb-hint {
          color: #71717a;
          font-weight: 400;
          margin-left: 6px;
        }
        .onb-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 560px) { .onb-two { grid-template-columns: 1fr; } }
        .onb-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-size: 0.94rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .onb-input:focus {
          border-color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.05);
        }
        .onb-input::placeholder { color: #52525b; }
        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 580px) {
          .role-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        .role-tile {
          text-align: left;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 12px 13px;
          cursor: pointer;
          transition: all 0.16s ease;
          color: #d4d4d8;
          font-family: inherit;
          position: relative;
        }
        .role-tile:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.22);
          color: #fff;
        }
        .role-tile.active {
          background: #ffffff;
          border-color: #ffffff;
          color: #09090b;
        }
        .role-tile-title {
          display: block;
          font-size: 0.84rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin-bottom: 2px;
        }
        .role-tile-desc {
          display: block;
          font-size: 0.72rem;
          color: #71717a;
          line-height: 1.3;
        }
        .role-tile.active .role-tile-desc { color: #52525b; }
        .usage-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 500px) { .usage-grid { grid-template-columns: 1fr; } }
        .usage-tile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 13px 14px;
          cursor: pointer;
          text-align: left;
          color: #d4d4d8;
          transition: all 0.16s ease;
          font-family: inherit;
        }
        .usage-tile:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.22);
        }
        .usage-tile.active {
          background: #ffffff;
          border-color: #ffffff;
          color: #09090b;
        }
        .usage-sub {
          font-size: 0.74rem;
          color: #71717a;
          margin-top: 1px;
        }
        .usage-tile.active .usage-sub { color: #52525b; }
        .size-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .size-pill {
          padding: 7px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: #a1a1aa;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .size-pill:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
        .size-pill.active { background: #fff; color: #000; border-color: #fff; font-weight: 600; }
        .onb-submit {
          width: 100%;
          padding: 14px 22px;
          border-radius: 9999px;
          border: none;
          background: #ffffff;
          color: #09090b;
          font-size: 0.94rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.18s, transform 0.18s;
          margin-top: 6px;
        }
        .onb-submit:hover:not(:disabled) { background: #e4e4e7; transform: translateY(-1px); }
        .onb-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .onb-err {
          border-left: 2px solid #f87171;
          padding: 6px 12px;
          color: #fca5a5;
          font-size: 0.85rem;
          margin-bottom: 18px;
          background: rgba(248,113,113,0.06);
        }
      `}</style>

      <aside className="onb-rail">
        <Link href="/" className="onb-brand">
          <img src="/logo.png" alt="Palama" width={22} height={22} style={{ objectFit: "contain" }} />
          <span>PALAMA</span>
        </Link>

        <div className="onb-rail-body">
          <div className="onb-kicker">Palama Co-Worker · Early Access</div>
          <h1 className="onb-hero-h">
            Tailor your
            <br />
            co-worker.
          </h1>
          <p className="onb-hero-p">
            We onboard users in curated waves so every seat launches with full reliability. Tell us
            what you build and how you operate.
          </p>

          <div className="onb-steps">
            <div className="onb-step done">
              <span>
                <span className="onb-step-num">01</span>Email confirmed
              </span>
              <span>Complete</span>
            </div>
            <div className="onb-step active">
              <span>
                <span className="onb-step-num">02</span>Work profile
              </span>
              <span>Active</span>
            </div>
            <div className="onb-step">
              <span>
                <span className="onb-step-num">03</span>Access wave
              </span>
              <span>Pending</span>
            </div>
          </div>
        </div>

        <div className="onb-rail-foot">
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {accountEmail}
          </span>
          <button type="button" className="onb-signout" onClick={handleSignOut}>
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="onb-canvas">
        <div className="onb-mobile-top">
          <Link href="/" className="onb-brand">
            <img src="/logo.png" alt="Palama" width={22} height={22} style={{ objectFit: "contain" }} />
            <span>PALAMA</span>
          </Link>
          <button type="button" className="onb-signout" onClick={handleSignOut}>
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>

        <motion.div
          className="onb-form-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="onb-form-head">
            <h2 className="onb-form-title">Application profile</h2>
            <p className="onb-form-sub">
              Used solely to prioritize early access waves and reach you when your seat opens.
            </p>
          </div>

          {error && <div className="onb-err">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="onb-two onb-section">
              <div>
                <label className="onb-label">Full name</label>
                <input
                  className="onb-input"
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="onb-label">Phone number</label>
                <input
                  className="onb-input"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="onb-section">
              <label className="onb-label">Primary discipline</label>
              <div className="role-grid">
                {ROLES.map((item) => {
                  const active = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`role-tile ${active ? "active" : ""}`}
                      onClick={() => setRole(item.id)}
                      disabled={submitting}
                    >
                      <span className="role-tile-title">{item.label}</span>
                      <span className="role-tile-desc">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
              {role === "other" && (
                <input
                  className="onb-input"
                  style={{ marginTop: 10 }}
                  type="text"
                  placeholder="Specify your role..."
                  value={roleOther}
                  onChange={(e) => setRoleOther(e.target.value)}
                  required
                  disabled={submitting}
                />
              )}
            </div>

            <div className="onb-section">
              <label className="onb-label">Deployment scope</label>
              <div className="usage-grid">
                <button
                  type="button"
                  className={`usage-tile ${usageType === "solo" ? "active" : ""}`}
                  onClick={() => setUsageType("solo")}
                  disabled={submitting}
                >
                  <User size={18} />
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>Individual</div>
                    <div className="usage-sub">Personal desktop co-worker</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`usage-tile ${usageType === "team" ? "active" : ""}`}
                  onClick={() => setUsageType("team")}
                  disabled={submitting}
                >
                  <Users size={18} />
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>Team / Organization</div>
                    <div className="usage-sub">Shared company rollout</div>
                  </div>
                </button>
              </div>

              {usageType === "team" && (
                <div className="size-row">
                  {TEAM_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`size-pill ${teamSize === sz ? "active" : ""}`}
                      onClick={() => setTeamSize(sz)}
                      disabled={submitting}
                    >
                      {sz} seats
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="onb-section">
              <label className="onb-label">
                First workflow
                <span className="onb-hint">(Optional)</span>
              </label>
              <textarea
                className="onb-input"
                rows={2}
                placeholder="e.g., terminal automation, research reports, media production..."
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                disabled={submitting}
                style={{ resize: "vertical" }}
              />
            </div>

            <button type="submit" className="onb-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Submitting profile...</span>
                </>
              ) : (
                <>
                  <span>Enter waitlist</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
