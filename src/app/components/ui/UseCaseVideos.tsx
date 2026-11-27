"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

type UseCaseVideo = {
  id: string;
  tag: string;
  title: string;
  desc: string;
  duration: string;
  src: string;
  href: string;
};

const VIDEOS: UseCaseVideo[] = [
  {
    id: "operations",
    tag: "For Business",
    title: "Automate inbox-to-ledger operations directly across your desktop apps",
    desc: "Palama reads PDF invoices, reconciles spreadsheets, and generates clean reports without switching tools.",
    duration: "0:08",
    src: "/videos/use-case-automation.mp4",
    href: "/use-cases#business",
  },
  {
    id: "developers",
    tag: "For Developers",
    title: "Scaffold endpoints, run terminal tests & verify fixes autonomously",
    duration: "0:08",
    desc: "Direct workspace edits paired with live shell execution.",
    src: "/videos/use-case-developers.mp4",
    href: "/use-cases#developers",
  },
  {
    id: "research",
    tag: "For Teams",
    title: "Multi-source autonomous research & structured synthesis",
    duration: "0:07",
    desc: "Gather filings, verify sources, and draft cited briefs in one flow.",
    src: "/videos/use-case-research.mp4",
    href: "/use-cases#teams",
  },
];

export default function UseCaseVideos() {
  const [activeVideo, setActiveVideo] = useState<UseCaseVideo | null>(null);
  const featured = VIDEOS[0];
  const secondary = VIDEOS.slice(1);

  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideo]);

  return (
    <section className="ucv-section" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Use cases</h2>
        <Link href="/use-cases" style={{ fontSize: "0.82rem", color: "#a1a1aa", textDecoration: "none" }}>
          View all
        </Link>
      </div>

      <div
        className="ucv-grid"
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}
      >
        {/* Featured Video */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveVideo(featured)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveVideo(featured);
            }
          }}
          style={{ cursor: "pointer", borderRadius: 12, overflow: "hidden" }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio: "16 / 9.33",
              background: "#09090c",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.09)",
              overflow: "hidden",
            }}
          >
            <video
              src={featured.src}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(9,9,12,0.75)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {featured.tag}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(9,9,12,0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.14)",
                fontSize: "0.72rem",
                color: "#e4e4e7",
              }}
            >
              <span>{featured.duration}</span>
              <Maximize2 size={12} />
            </div>
          </div>

          <div style={{ paddingTop: 16 }}>
            <h3
              style={{
                fontSize: "1.32rem",
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: 8,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {featured.title}
            </h3>
            <p style={{ fontSize: "0.86rem", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
              {featured.desc}
            </p>
          </div>
        </div>

        {/* Right Stacked Videos */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
          {secondary.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveVideo(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveVideo(item);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: 10,
                  background: "#09090c",
                  border: "1px solid rgba(255,255,255,0.09)",
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <video
                  src={item.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 8px",
                    borderRadius: 999,
                    background: "rgba(9,9,12,0.8)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    fontSize: "0.68rem",
                    color: "#e4e4e7",
                  }}
                >
                  <span>{item.duration}</span>
                  <Maximize2 size={11} />
                </div>
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 4, color: "#fff" }}>
                {item.title}
              </h3>
              <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>{item.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Lightbox Player */}
      {activeVideo && (
        <div
          className="ucv-modal-backdrop"
          onClick={() => setActiveVideo(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 920,
              background: "#0c0c0f",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {activeVideo.tag}
                </div>
                <div style={{ fontSize: "0.98rem", fontWeight: 600, color: "#fff" }}>{activeVideo.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <video
              src={activeVideo.src}
              controls
              autoPlay
              loop
              playsInline
              style={{ width: "100%", maxHeight: "72vh", display: "block", background: "#000" }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 820px) {
          .ucv-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .ucv-section {
            padding-top: 20px !important;
            padding-bottom: 44px !important;
          }
          .ucv-modal-backdrop {
            padding: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}
