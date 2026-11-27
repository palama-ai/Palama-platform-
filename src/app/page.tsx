"use client";
import Link from "next/link";
import PalamaHero from "./components/ui/PalamaHero";
import UseCaseVideos from "./components/ui/UseCaseVideos";

export default function Home() {
  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 01 — HERO */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <PalamaHero />

      {/* Content wrapper */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RECENT NEWS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Recent news</h2>
            <Link href="/news" style={{ fontSize: "0.82rem", color: "#777", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
            <Link href="/news" style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 420, background: "#111", borderRadius: 12 }} />
                <div style={{ paddingTop: 16 }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 8, color: "#fff", letterSpacing: "-0.02em" }}>
                    Palama 2.0: Frontier intelligence that scales with your ambition
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#a1a1aa" }}><span style={{ fontWeight: 600, color: "#fff" }}>Product</span>  Jul 9, 2026</div>
                </div>
              </div>
            </Link>

            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
              {[
                { title: "Expanding Daybreak as the Cyber Defense Window Narrows", tag: "Security", date: "Aug 10, 2026", href: "/news" },
                { title: "Advancing the price-performance frontier with Palama 2.0", tag: "Product", date: "Jul 30, 2026", href: "/products/release-notes" },
              ].map((card) => (
                <Link key={card.title} href={card.href} style={{ textDecoration: "none", color: "#fff" }}>
                  <div>
                    <div style={{ width: "100%", height: 160, borderRadius: 10, background: "#111", marginBottom: 12 }} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6, color: "#fff" }}>{card.title}</h3>
                    <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}><span style={{ fontWeight: 600, color: "#fff" }}>{card.tag}</span>  {card.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════ */}
        {/* USE CASES (VIDEOS) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <UseCaseVideos />


      </div>
    </div>
  );
}
