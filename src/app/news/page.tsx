"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", padding: "calc(var(--nav-height) + 40px) 24px 80px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 500, color: "#fff", marginBottom: 24, letterSpacing: "-0.02em" }}>
        Recent news
      </h1>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24 }}>
        <div style={{ display: "flex", gap: 24, fontSize: "0.85rem", color: "#a1a1aa", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
          {["Company", "Product", "Safety", "Engineering", "Security", "AI Futures", "Global Affairs", "AI Adoption", "Applied AI"].map((c, i) => (
            <span key={c} style={{ color: i === 0 ? "#fff" : "#a1a1aa", fontWeight: i === 0 ? 500 : 400, cursor: "pointer" }}>{c}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#fff", fontSize: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            Filter <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            Sort <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <Link href="/" style={{ color: "#a1a1aa", display: "flex", alignItems: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 24, alignItems: "start" }}>
        <Link href="/news" style={{ textDecoration: "none", color: "#fff" }}>
          <div style={{ borderRadius: 12, overflow: "hidden" }}>
            <div style={{ height: 500, background: "#111", borderRadius: 12 }} />
            <div style={{ paddingTop: 16 }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 600, lineHeight: 1.2, marginBottom: 8, color: "#fff", letterSpacing: "-0.02em" }}>
                Palama 5.6: Frontier intelligence that scales with your ambition
              </h2>
              <div style={{ fontSize: "0.82rem", color: "#a1a1aa", marginTop: 12 }}><span style={{ fontWeight: 600, color: "#fff" }}>Product</span>  Jul 9, 2026</div>
            </div>
          </div>
        </Link>

        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
          {[
            { title: "Expanding Daybreak as the Cyber Defense Window Narrows", tag: "Security", date: "Aug 10, 2026", href: "/news" },
            { title: "Advancing the price-performance frontier with Palama 5.6", tag: "Product", date: "Jul 30, 2026", href: "/news" },
          ].map((card) => (
            <Link key={card.title} href={card.href} style={{ textDecoration: "none", color: "#fff" }}>
              <div>
                <div style={{ width: "100%", height: 210, borderRadius: 10, background: "#111", marginBottom: 12 }} />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6, color: "#fff" }}>{card.title}</h3>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}><span style={{ fontWeight: 600, color: "#fff" }}>{card.tag}</span>  {card.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
