"use client";
import Link from "next/link";
import PalamaHero from "./components/ui/PalamaHero";
import UseCaseVideos from "./components/ui/UseCaseVideos";
import { NEWS_ARTICLES } from "@/lib/news-articles";

export default function Home() {
  const featuredNews = NEWS_ARTICLES[0];
  const secondaryNews = NEWS_ARTICLES.slice(1, 3);

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "hidden" }}>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 01 — HERO */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <PalamaHero />

      {/* Content wrapper */}
      <div className="home-content-wrap" style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RECENT NEWS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="home-news-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Recent news</h2>
            <Link href="/news" style={{ fontSize: "0.84rem", color: "#a1a1aa", textDecoration: "none" }}>View all</Link>
          </div>
          <div className="home-news-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
            <Link href={`/news/${featuredNews.slug}`} style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <div className="home-news-featured-media" style={{ height: 420, background: "#111", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: featuredNews.imagePosition || "center center", display: "block" }}
                  />
                </div>
                <div style={{ paddingTop: 14 }}>
                  <h2 style={{ fontSize: "clamp(1.18rem, 2.2vw, 1.4rem)", fontWeight: 600, lineHeight: 1.3, marginBottom: 8, color: "#fff", letterSpacing: "-0.02em" }}>
                    {featuredNews.title}
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{featuredNews.tag}</span> · {featuredNews.date}
                  </div>
                </div>
              </div>
            </Link>

            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 20 }}>
              {secondaryNews.map((card) => (
                <Link key={card.slug} href={`/news/${card.slug}`} style={{ textDecoration: "none", color: "#fff" }}>
                  <div>
                    <div className="home-news-secondary-media" style={{ width: "100%", height: 160, borderRadius: 10, background: "#111", marginBottom: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <img
                        src={card.image}
                        alt={card.title}
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: card.imagePosition || "center center", display: "block" }}
                      />
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6, color: "#fff" }}>{card.title}</h3>
                    <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>
                      <span style={{ fontWeight: 600, color: "#fff" }}>{card.tag}</span> · {card.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <style jsx>{`
            @media (max-width: 820px) {
              .home-news-grid {
                grid-template-columns: 1fr !important;
              }
            }
            @media (max-width: 640px) {
              .home-content-wrap {
                padding: 0 16px !important;
              }
              .home-news-section {
                padding-top: 32px !important;
                padding-bottom: 32px !important;
              }
              .home-news-featured-media {
                height: 220px !important;
              }
              .home-news-secondary-media {
                height: 175px !important;
              }
            }
          `}</style>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* USE CASES (VIDEOS) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <UseCaseVideos />

      </div>
    </div>
  );
}
