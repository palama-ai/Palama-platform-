"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, ShieldCheck, User, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const ROLES = [
  { id: "creator", label: "Content Creator", desc: "Video, writing & media" },
  { id: "developer", label: "Developer / Engineer", desc: "Code, DevOps & builds" },
  { id: "designer", label: "Designer / Creative", desc: "UI/UX & visual workflows" },
  { id: "researcher", label: "Researcher / Analyst", desc: "Synthesis & deep analysis" },
  { id: "founder", label: "Founder / Business", desc: "Strategy & operations" },
  { id: "marketing", label: "Marketing / Growth", desc: "Campaigns & outreach" },
  { id: "operations", label: "Product / Operations", desc: "Coordination & execution" },
  { id: "student", label: "Student / Educator", desc: "Learning & teaching" },
  { id: "other", label: "Other", desc: "Different role" },
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
        <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#000", alignItems: "center", justifyContent: "center", color: "#a1a1aa", fontFamily: "sans-serif" }}>
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
          const qs = nextPath !== "/dashboard" ? `?next=${encodeURIComponent(`/onboarding?next=${encodeURIComponent(nextPath)}`)}` : "?next=/onboarding";
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
          router.replace(`/auth/verify${nextPath !== "/dashboard" ? `?next=${encodeURIComponent(nextPath)}` : ""}`);
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

  if (checking) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", width: "100%", background: "#000", alignItems: "center", justifyContent: "center", color: "#a1a1aa", fontFamily: "Inter, sans-serif", gap: 10 }}>
        <Loader2 size={18} className="animate-spin" />
        <span>Verifying account status...</span>
      </div>
    );
  }

  return (
    <div className="onb-page">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .onb-page { min-height: 100vh; width: 100%; background: #000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; padding: 36px 20px; position: relative; overflow-x: hidden; }
        .onb-glow-1 { position: fixed; top: -15%; left: -10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%); border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .onb-card { width: 100%; max-width: 660px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 34px 30px; position: relative; z-index: 2; }
        @media (max-width: 600px) { .onb-card { padding: 24px 18px; } }
        .onb-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: rgba(52,199,89,0.12); border: 1px solid rgba(52,199,89,0.28); color: #34d399; font-size: 0.76rem; font-weight: 600; margin-bottom: 12px; }
        .onb-title { font-size: 1.65rem; font-weight: 700; color: #fff; margin: 0 0 8px; letter-spacing: -0.025em; }
        .onb-sub { font-size: 0.92rem; color: #a1a1aa; margin: 0 0 26px; line-height: 1.5; }
        .onb-section { margin-bottom: 22px; }
        .onb-label { display: block; font-size: 0.86rem; font-weight: 600; color: #e4e4e7; margin-bottom: 8px; }
        .onb-hint { font-size: 0.78rem; color: #71717a; font-weight: 400; margin-left: 6px; }
        .onb-input { width: 100%; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.95rem; font-family: inherit; outline: none; transition: border-color 0.2s, background 0.2s; }
        .onb-input:focus { border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.06); }
        .onb-input::placeholder { color: #52525b; }
        .role-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
        @media (max-width: 640px) { .role-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .role-card { text-align: left; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 12px; cursor: pointer; transition: all 0.16s; color: #e4e4e7; position: relative; font-family: inherit; }
        .role-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); }
        .role-card.active { background: rgba(255,255,255,0.11); border-color: #fff; color: #fff; }
        .role-card-title { font-size: 0.83rem; font-weight: 600; margin-bottom: 2px; display: block; }
        .role-card-desc { font-size: 0.72rem; color: #8b8b95; display: block; line-height: 1.3; }
        .usage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 500px) { .usage-grid { grid-template-columns: 1fr; } }
        .usage-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px; cursor: pointer; text-align: left; color: #e4e4e7; transition: all 0.16s; font-family: inherit; }
        .usage-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.25); }
        .usage-card.active { background: rgba(255,255,255,0.11); border-color: #fff; color: #fff; }
        .size-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .size-pill { padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: transparent; color: #d4d4d8; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .size-pill.active { background: #fff; color: #000; border-color: #fff; }
        .onb-submit { width: 100%; padding: 13px 18px; border-radius: 10px; border: none; background: #fff; color: #000; font-size: 0.96rem; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.18s; margin-top: 8px; }
        .onb-submit:hover { background: #e4e4e7; transform: translateY(-1px); }
        .onb-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .onb-error { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 10px; padding: 10px 14px; font-size: 0.86rem; margin-bottom: 16px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 540px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>

      <div className="onb-glow-1" />

      <motion.div
        className="onb-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="onb-badge">
          <ShieldCheck size={14} /> Email verified
        </div>
        <h1 className="onb-title">Tell us about your work</h1>
        <p className="onb-sub">
          Help us prioritize your spot on the Palama Co-Worker waitlist and tailor your workspace.
        </p>

        {error && <div className="onb-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="two-col onb-section">
            <div>
              <label className="onb-label">Full Name</label>
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
              <label className="onb-label">Phone Number</label>
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
            <label className="onb-label">What describes you best?</label>
            <div className="role-grid">
              {ROLES.map((item) => {
                const active = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`role-card ${active ? "active" : ""}`}
                    onClick={() => setRole(item.id)}
                    disabled={submitting}
                  >
                    <span className="role-card-title">{item.label}</span>
                    <span className="role-card-desc">{item.desc}</span>
                    {active && (
                      <Check size={13} style={{ position: "absolute", top: 9, right: 9, color: "#fff" }} />
                    )}
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
            <label className="onb-label">How will you use Palama Co-Worker?</label>
            <div className="usage-grid">
              <button
                type="button"
                className={`usage-card ${usageType === "solo" ? "active" : ""}`}
                onClick={() => setUsageType("solo")}
                disabled={submitting}
              >
                <User size={20} />
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Just for me (Solo)</div>
                  <div style={{ fontSize: "0.75rem", color: "#8b8b95" }}>Personal desktop co-worker</div>
                </div>
              </button>

              <button
                type="button"
                className={`usage-card ${usageType === "team" ? "active" : ""}`}
                onClick={() => setUsageType("team")}
                disabled={submitting}
              >
                <Users size={20} />
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>With my team</div>
                  <div style={{ fontSize: "0.75rem", color: "#8b8b95" }}>Organization or team rollout</div>
                </div>
              </button>
            </div>

            {usageType === "team" && (
              <div style={{ marginTop: 12 }}>
                <span className="onb-label" style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>
                  Team size
                </span>
                <div className="size-pills">
                  {TEAM_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`size-pill ${teamSize === sz ? "active" : ""}`}
                      onClick={() => setTeamSize(sz)}
                      disabled={submitting}
                    >
                      {sz} people
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="onb-section">
            <label className="onb-label">
              What do you want to automate first?
              <span className="onb-hint">(Optional)</span>
            </label>
            <textarea
              className="onb-input"
              rows={2}
              placeholder="e.g., video editing pipelines, code refactoring, research reports, daily inbox & ops..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              disabled={submitting}
              style={{ resize: "vertical" }}
            />
          </div>

          <button type="submit" className="onb-submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Submitting profile...</span>
              </>
            ) : (
              <>
                <span>Continue to Palama</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
