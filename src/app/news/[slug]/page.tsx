import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar } from "lucide-react";
import { NEWS_ARTICLES, getNewsArticle } from "@/lib/news-articles";

export function generateStaticParams() {
  return NEWS_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getNewsArticle(slug);
  if (!article) {
    notFound();
  }

  return (
    <article
      style={{
        maxWidth: 940,
        margin: "0 auto",
        padding: "calc(var(--nav-height) + 44px) 24px 96px",
        color: "#ffffff",
      }}
    >
      <Link
        href="/news"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: "0.86rem",
          color: "#a1a1aa",
          textDecoration: "none",
          marginBottom: 28,
        }}
      >
        <ArrowLeft size={15} />
        <span>Back to all news</span>
      </Link>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          marginBottom: 18,
          fontSize: "0.84rem",
          color: "#a1a1aa",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        >
          {article.tag}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} />
          Published {article.date}
        </span>
        <span>•</span>
        <span>{article.eventDate}</span>
      </div>

      {/* Headline & Summary */}
      <h1
        style={{
          fontSize: "clamp(1.9rem, 4vw, 3rem)",
          fontWeight: 600,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          color: "#ffffff",
          marginBottom: 18,
        }}
      >
        {article.title}
      </h1>

      <p
        style={{
          fontSize: "1.08rem",
          lineHeight: 1.65,
          color: "#d4d4d8",
          marginBottom: 32,
        }}
      >
        {article.summary}
      </p>

      {/* Primary Verified Press Image */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#09090c",
          marginBottom: 32,
        }}
      >
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: "100%",
            maxHeight: 520,
            objectFit: "cover",
            objectPosition: article.imagePosition || "center center",
            display: "block",
          }}
        />
      </div>

      {/* Key Facts Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 38,
        }}
      >
        {article.highlights.map((h) => (
          <div
            key={h.label}
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: "#0a0a0d",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#71717a",
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              {h.label}
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#ffffff" }}>
              {h.value}
            </div>
          </div>
        ))}
      </div>

      {/* Story Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 44 }}>
        {article.paragraphs.map((p, idx) => (
          <p
            key={idx}
            style={{
              fontSize: "1.02rem",
              lineHeight: 1.75,
              color: "#d4d4d8",
              margin: 0,
            }}
          >
            {p}
          </p>
        ))}
      </div>

      {/* Media Gallery */}
      {article.gallery.length > 1 && (
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Event & Press Photos
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 18,
            }}
          >
            {article.gallery.map((g) => (
              <figure
                key={g.src}
                style={{
                  margin: 0,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#0a0a0d",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <img
                  src={g.src}
                  alt={g.caption}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <figcaption
                  style={{
                    padding: "12px 14px",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                    color: "#a1a1aa",
                  }}
                >
                  {g.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Official Press Links */}
      <section
        style={{
          padding: "28px",
          borderRadius: 16,
          background: "#09090c",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#ffffff", margin: 0 }}>
            Original Press Coverage & Official Links
          </h2>
          <span style={{ fontSize: "0.78rem", color: "#71717a" }}>
            April – May 2026
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {article.sources.map((src) => (
            <a
              key={src.url}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                textDecoration: "none",
                color: "#ffffff",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#a1a1aa",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{src.outlet}</span>
                  <span>•</span>
                  <span>{src.date}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#e4e4e7",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {src.title}
                </div>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.78rem",
                  color: "#d4d4d8",
                }}
              >
                Read <ArrowUpRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}
