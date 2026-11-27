"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const products = [
  {
    name: "Palama Co-Worker",
    href: "/download",
    desc: "Your AI desktop assistant. It operates your computer directly — files, terminal, browser, and apps — from one prompt.",
    tag: "Desktop App",
    cta: "Download",
  },
  {
    name: "Palama Cloud",
    href: "/dashboard",
    desc: "Your cloud workspace with pre-registration, agent history, and account settings. Sign in to claim your spot.",
    tag: "Cloud",
    cta: "Join the waitlist",
  },
];

export default function ProductsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#ededed", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <section style={{ padding: "calc(var(--nav-height) + 90px) 24px 40px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ color: "#a1a1aa", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.8rem", marginBottom: 20 }}>
            Products
          </div>
          <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 16px", color: "#fff" }}>
            Two ways to work with Palama
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#a1a1aa", margin: 0, lineHeight: 1.65 }}>
            On your desktop today, in your cloud workspace tomorrow.
          </p>
        </motion.div>
      </section>

      <section style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px 96px" }}>
        <div className="r-grid-2">
        {products.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 * i }}
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: "32px 26px", display: "flex", flexDirection: "column", gap: 12 }}
          >
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a1a1aa" }}>
              {p.tag}
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#fff" }}>{p.name}</h2>
            <p style={{ fontSize: "0.95rem", color: "#a1a1aa", margin: 0, lineHeight: 1.65, flex: 1 }}>{p.desc}</p>
            <Link
              href={p.href}
              style={{ display: "inline-block", marginTop: 10, padding: "11px 26px", borderRadius: 999, background: "#fff", color: "#000", fontSize: "0.92rem", fontWeight: 650, textDecoration: "none", width: "fit-content" }}
            >
              {p.cta}
            </Link>
          </motion.div>
        ))}
        </div>
      </section>
    </div>
  );
}
