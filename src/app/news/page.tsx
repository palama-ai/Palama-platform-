"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { NEWS_ARTICLES, PRESS_SOURCES } from "@/lib/news-articles";

const CATEGORIES = ["All", "Company", "Product", "Press"] as const;

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered =
    activeCategory === "All"
      ? NEWS_ARTICLES
      : NEWS_ARTICLES.filter((a) => a.tag === activeCategory);

  const featured = filtered[0] ?? NEWS_ARTICLES[0];
  const secondary = filtered.slice(1);

  return (
    <div className="news-page-wrap" style={{ maxWidth: 1060, margin: "0 auto", padding: "calc(var(--nav-height) + 40px) 24px 88px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 500, color: "#fff", marginBottom: 24, letterSpacing: "-0.02em" }}>
        Recent news
      </h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 22, fontSize: "0.85rem", color: "#a1a1aa", overflowX: "auto", whiteSpace: "nowrap", scrollbarWidth: "none" }}>
          {CATEGORIES.map((c) => {
            const active = activeCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  color: active ? "#fff" : "#a1a1aa",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: "0.82rem", color: "#71717a" }}>
          {filtered.length} {filtered.length === 1 ? "article" : "articles"}
        </div>
      </div>

      {/* Main Grid */}
      <div
        className="news-main-grid"
        style={{
          display: "grid",
          gridTemplateColumns: secondary.length > 0 ? "1.65fr 1fr" : "1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <Link href={`/news/${featured.slug}`} style={{ textDecoration: "none", color: "#fff" }}>
          <div style={{ borderRadius: 12, overflow: "hidden" }}>
            <div
              className="news-featured-media"
              style={{
                height: 460,
                background: "#111",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <img
                src={featured.image}
                alt={featured.title}
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: featured.imagePosition || "center center",
                  display: "block",
                }}
              />
            </div>
            <div style={{ paddingTop: 16 }}>
              <h2 style={{ fontSize: "1.65rem", fontWeight: 600, lineHeight: 1.25, marginBottom: 10, color: "#fff", letterSpacing: "-0.02em" }}>
                {featured.title}
              </h2>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.55, color: "#a1a1aa", marginBottom: 12 }}>
                {featured.summary}
              </p>
              <div style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>{featured.tag}</span> · {featured.date}
              </div>
            </div>
          </div>
        </Link>

        {secondary.length > 0 && (
          <div style={{ display: "grid", gridTemplateRows: "auto auto", gap: 24 }}>
            {secondary.map((card) => (
              <Link key={card.slug} href={`/news/${card.slug}`} style={{ textDecoration: "none", color: "#fff" }}>
                <div>
                  <div
                    style={{
                      width: "100%",
                      height: 205,
                      borderRadius: 10,
                      background: "#111",
                      marginBottom: 12,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: card.imagePosition || "center center",
                        display: "block",
                      }}
                    />
                  </div>
                  <h3 style={{ fontSize: "0.98rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6, color: "#fff" }}>
                    {card.title}
                  </h3>
                  <div style={{ fontSize: "0.76rem", color: "#a1a1aa" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{card.tag}</span> · {card.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Press Coverage Archive Strip */}
      <section style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#fff" }}>
            Press coverage & links (Palama Persona → Palama Co-Worker)
          </h2>
          <span style={{ fontSize: "0.8rem", color: "#71717a" }}>Ventures Adventure 2026 • AUI Ifrane</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
          {PRESS_SOURCES.map((src) => (
            <a
              key={src.url}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "16px 18px",
                borderRadius: 12,
                background: "#08080a",
                border: "1px solid rgba(255,255,255,0.08)",
                textDecoration: "none",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginBottom: 6 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{src.outlet}</span> · {src.date}
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500, lineHeight: 1.45, color: "#e4e4e7" }}>
                  {src.title}
                </div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "#a1a1aa" }}>
                <span>Open original article</span>
                <ArrowUpRight size={13} />
              </div>
            </a>
          ))}
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 820px) {
          .news-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .news-page-wrap {
            padding: calc(var(--nav-height) + 24px) 16px 64px !important;
          }
          .news-featured-media {
            height: 230px !important;
          }
        }
      `}</style>
    </div>
  );
}
