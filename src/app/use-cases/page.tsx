"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const CASES = [
  {
    id: "business",
    title: "For Business",
    desc: "Automate repetitive operations, reports, and back-office workflows. Palama operates your existing tools — no migration needed.",
    video: "/videos/use-case-automation.mp4",
    cta: "Join the waitlist",
    href: "/dashboard",
  },
  {
    id: "developers",
    title: "For Developers",
    desc: "Generate code, run commands, manage packages, and debug projects from one prompt. Works with your stack and your terminal.",
    video: "/videos/use-case-developers.mp4",
    cta: "Join the waitlist",
    href: "/dashboard",
  },
  {
    id: "personal",
    title: "For Personal Use",
    desc: "Organize files, research the web, draft documents, and handle daily computer chores while you focus on what matters.",
    video: "/videos/use-case-automation.mp4",
    cta: "Download the app",
    href: "/download",
  },
  {
    id: "teams",
    title: "For Teams",
    desc: "Share skills, standardize workflows, and give every teammate an assistant that knows your tools and processes.",
    video: "/videos/use-case-research.mp4",
    cta: "Join the waitlist",
    href: "/dashboard",
  },
];

export default function UseCasesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#ededed", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        .uc-hero { padding: calc(var(--nav-height) + 90px) 24px 60px; text-align: center; max-width: 820px; margin: 0 auto; }
        .uc-kicker { color: #a1a1aa; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 20px; }
        .uc-title { font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 16px; color: #fff; }
        .uc-sub { font-size: 1.05rem; color: #a1a1aa; margin: 0 auto; max-width: 620px; line-height: 1.65; }
        .uc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 960px; margin: 0 auto; padding: 0 24px 110px; }
        .uc-card { background: #111; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 34px 30px; display: flex; flex-direction: column; gap: 12px; scroll-margin-top: 110px; }
        .uc-card h2 { font-size: 1.4rem; font-weight: 700; margin: 0; color: #fff; }
        .uc-card p { font-size: 0.95rem; color: #a1a1aa; margin: 0; line-height: 1.65; flex: 1; }
        .uc-card a { display: inline-block; margin-top: 8px; padding: 10px 22px; border-radius: 999px; background: #fff; color: #000; font-size: 0.9rem; font-weight: 650; text-decoration: none; width: fit-content; }
        .uc-card a:hover { background: #e4e4e7; }
        @media (max-width: 720px) {
          .uc-grid { grid-template-columns: 1fr; padding: 0 16px 72px; }
          .uc-hero { padding: calc(var(--nav-height) + 40px) 16px 36px; }
          .uc-card { padding: 22px 18px; }
        }
      `}</style>

      <section className="uc-hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="uc-kicker">Use Cases</div>
          <h1 className="uc-title">One assistant, every workflow</h1>
          <p className="uc-sub">Palama Co-Worker operates your computer directly — in business, in code, at home, and in teams.</p>
        </motion.div>
      </section>

      <section className="uc-grid">
        {CASES.map((c, i) => (
          <motion.div
            key={c.id}
            id={c.id}
            className="uc-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * i }}
          >
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#08080a", marginBottom: 6, aspectRatio: "16 / 9" }}>
              <video
                src={c.video}
                autoPlay
                loop
                muted
                playsInline
                controls
                preload="metadata"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <h2>{c.title}</h2>
            <p>{c.desc}</p>
            <Link href={c.href}>{c.cta}</Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
