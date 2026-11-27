"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Globe, ShieldCheck, Command, Plus } from "lucide-react";

export default function PalamaHero() {
  return (
    <section
      className="palama-editorial-hero"
      style={{
        position: "relative",
        width: "100%",
        background: "radial-gradient(ellipse 85% 75% at 50% 38%, #ffffff 0%, #f6f5f2 58%, #ecebe6 100%)",
        color: "#0c0c0f",
        paddingTop: "calc(var(--nav-height) + 28px)",
        paddingBottom: 0,
        overflow: "hidden",
        borderRadius: "0 0 36px 36px",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Main Content Container */}
      <div
        className="hero-inner-container"
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
        }}
      >
        {/* Header Block — Pure Palama Geometric Identity */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 25,
          }}
        >
          <motion.h1
            className="hero-headline"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-geist-sans), 'Inter', system-ui, sans-serif",
              fontSize: "clamp(2.15rem, 4.9vw, 4.15rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
              color: "#0c0c0f",
              maxWidth: 740,
              margin: "0 0 14px",
            }}
          >
            One quiet co-worker
            <br />
            for everything you build.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.55,
              color: "#52525b",
              maxWidth: 480,
              margin: "0 0 22px",
              fontWeight: 400,
            }}
          >
            Palama operates your browser, apps, terminal, and files — cleanly
            from a single workspace built for deep execution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/download"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0c0c0f",
                color: "#ffffff",
                padding: "11px 22px",
                borderRadius: 9999,
                fontSize: "0.88rem",
                fontWeight: 550,
                textDecoration: "none",
                letterSpacing: "-0.01em",
                boxShadow: "0 8px 24px rgba(12, 12, 15, 0.16)",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "#1e1e24";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "#0c0c0f";
              }}
            >
              <span>Download free</span>
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CENTERPIECE STAGE: Orbiting Desktop + 2x2 Mobile Grid     */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          className="hero-stage"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1120,
            height: "clamp(410px, 43vw, 480px)",
            margin: "12px auto 0",
          }}
        >
          {/* Symmetrical Hairline SVG Orbit Connectors (desktop only) */}
          <svg
            className="hero-orbit-lines"
            viewBox="0 0 1120 480"
            fill="none"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 6,
            }}
          >
            <path d="M 110 85 C 125 210, 235 260, 355 268" stroke="rgba(12, 12, 15, 0.12)" strokeWidth="1" />
            <path d="M 1010 85 C 995 210, 885 260, 765 268" stroke="rgba(12, 12, 15, 0.12)" strokeWidth="1" />
            <ellipse cx="560" cy="280" rx="315" ry="105" stroke="rgba(12, 12, 15, 0.055)" strokeWidth="1" strokeDasharray="3 5" />
          </svg>

          {/* Soft ambient halo behind portrait */}
          <div
            className="hero-ambient-halo"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              transform: "translateX(-50%)",
              width: "min(560px, 85vw)",
              height: "92%",
              background: "radial-gradient(circle at 50% 52%, rgba(255,255,255,0.95) 0%, rgba(246,245,242,0) 72%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Center Editorial Monochrome Portrait */}
          <div
            className="hero-portrait-wrap"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -4,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              zIndex: 12,
              pointerEvents: "none",
            }}
          >
            <motion.div
              className="hero-portrait-box"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: "clamp(260px, 46vw, 520px)",
                height: "clamp(270px, 47vw, 505px)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <picture style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <source srcSet="/hero-portrait.webp" type="image/webp" />
                <img
                  src="/hero-portrait.png"
                  alt="Calm focus with Palama"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center bottom",
                    display: "block",
                    filter: "contrast(1.04)",
                  }}
                />
              </picture>
            </motion.div>
          </div>

          {/* ── 1. TOP-LEFT SYMMETRIC OUTER CARD (desktop) ── */}
          <motion.div
            className="hero-card-outer-left"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              left: "clamp(8px, 2.5vw, 32px)",
              top: -28,
              width: 176,
              padding: "14px 15px",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(12, 12, 15, 0.08)",
              boxShadow: "0 14px 34px rgba(12, 12, 15, 0.06)",
              zIndex: 18,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#0c0c0f",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Command size={13} color="#ffffff" />
              </span>
              <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.08em", color: "#71717a", textTransform: "uppercase" }}>
                Workflow
              </span>
            </div>
            <div style={{ fontSize: "0.84rem", fontWeight: 600, lineHeight: 1.25, color: "#0c0c0f", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Direct execution.
            </div>
            <div style={{ fontSize: "0.7rem", lineHeight: 1.4, color: "#52525b" }}>
              Terminal, apps, files & browser in one command.
            </div>
          </motion.div>

          {/* ── 2. TOP-RIGHT SYMMETRIC OUTER CARD (desktop) ── */}
          <motion.div
            className="hero-card-outer-right"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              right: "clamp(8px, 2.5vw, 32px)",
              top: -28,
              width: 176,
              padding: "14px 15px",
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(12, 12, 15, 0.08)",
              boxShadow: "0 14px 34px rgba(12, 12, 15, 0.06)",
              zIndex: 18,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {["/hero-avatar-1.jpg", "/hero-avatar-2.jpg", "/hero-avatar-3.jpg"].map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    width={22}
                    height={22}
                    decoding="async"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #ffffff",
                      marginLeft: i === 0 ? 0 : -6,
                      filter: "grayscale(0.35)",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.08em", color: "#71717a", textTransform: "uppercase" }}>
                Sync
              </span>
            </div>
            <div style={{ fontSize: "0.84rem", fontWeight: 600, lineHeight: 1.25, color: "#0c0c0f", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Desktop & cloud.
            </div>
            <div style={{ fontSize: "0.7rem", lineHeight: 1.4, color: "#52525b" }}>
              Work seamlessly across devices with live state.
            </div>
          </motion.div>

          {/* ── 3. LEFT BACKGROUND VISUAL CARD (desktop) ── */}
          <div
            className="hero-card-horizon"
            style={{
              position: "absolute",
              left: "calc(50% - 375px)",
              top: 150,
              zIndex: 9,
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 150,
                height: 94,
                borderRadius: 14,
                padding: 4,
                background: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(12,12,15,0.08)",
                boxShadow: "0 14px 32px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <img
                src="/hero-card-horizon.jpg"
                alt="Deep clarity"
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 10,
                  display: "block",
                }}
              />
            </motion.div>
          </div>

          {/* ── 4. INNER LEFT-UPPER ORDERED CAPABILITY CARD ── */}
          <div
            className="hero-card-focus hero-tile"
            style={{
              position: "absolute",
              left: "calc(50% - 310px)",
              top: 74,
              zIndex: 18,
            }}
          >
            <motion.div
              className="hero-card-panel hero-rot-focus"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(12, 12, 15, 0.08)",
                boxShadow: "0 14px 34px rgba(12, 12, 15, 0.07)",
                display: "flex",
                alignItems: "center",
                gap: 11,
                textAlign: "left",
                height: "100%",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "#0c0c0f",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Globe size={14} color="#ffffff" />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0c0c0f", letterSpacing: "-0.015em" }}>
                  Browser & Apps
                </div>
                <div style={{ fontSize: "0.68rem", color: "#52525b", lineHeight: 1.35 }}>
                  Autonomous web navigation.
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── 5. INNER LEFT-LOWER ORDERED CAPABILITY CARD ── */}
          <div
            className="hero-card-memory hero-tile"
            style={{
              position: "absolute",
              left: "calc(50% - 285px)",
              top: 232,
              zIndex: 22,
            }}
          >
            <motion.div
              className="hero-card-panel hero-rot-memory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(12, 12, 15, 0.08)",
                boxShadow: "0 16px 38px rgba(12, 12, 15, 0.09)",
                display: "flex",
                alignItems: "center",
                gap: 11,
                textAlign: "left",
                height: "100%",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "#f4f4f5",
                  border: "1px solid rgba(12,12,15,0.08)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={14} color="#0c0c0f" />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0c0c0f", letterSpacing: "-0.015em" }}>
                  Private Memory
                </div>
                <div style={{ fontSize: "0.68rem", color: "#52525b", lineHeight: 1.35 }}>
                  Local context, stays yours.
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── 6. INNER RIGHT-UPPER ORDERED CAPABILITY CARD ── */}
          <div
            className="hero-card-execute hero-tile"
            style={{
              position: "absolute",
              left: "calc(50% + 114px)",
              top: 96,
              zIndex: 20,
            }}
          >
            <motion.div
              className="hero-card-panel hero-rot-execute"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(12, 12, 15, 0.08)",
                boxShadow: "0 16px 36px rgba(12, 12, 15, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: 11,
                textAlign: "left",
                height: "100%",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: "#0c0c0f",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Cpu size={14} color="#ffffff" />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0c0c0f", letterSpacing: "-0.015em" }}>
                  Multi-Model Core
                </div>
                <div style={{ fontSize: "0.68rem", color: "#52525b", lineHeight: 1.35 }}>
                  Smart routing per task.
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── 7. INNER RIGHT-LOWER DARK ECLIPSE SHOWCASE CARD ── */}
          <div
            className="hero-card-orb hero-tile"
            style={{
              position: "absolute",
              left: "calc(50% + 130px)",
              top: 222,
              zIndex: 16,
            }}
          >
            <motion.div
              className="hero-orb-panel hero-rot-orb"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: 15,
                padding: 3,
                background: "#0a0a0c",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: "0 20px 44px rgba(0, 0, 0, 0.24)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src="/hero-card-orb.jpg"
                alt="Palama Engine"
                decoding="async"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  bottom: 8,
                  fontSize: "0.64rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                Palama 2.0
              </div>
            </motion.div>
          </div>

          {/* ── BOTTOM-LEFT SOCIAL PROOF CORNER (desktop) ── */}
          <motion.div
            className="hero-corner-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            style={{
              position: "absolute",
              left: 10,
              bottom: 28,
              textAlign: "left",
              zIndex: 20,
            }}
          >
            <div style={{ width: 14, height: 1, background: "rgba(12,12,15,0.35)", marginBottom: 8 }} />
            <div style={{ fontSize: "0.73rem", lineHeight: 1.4, color: "#52525b", marginBottom: 8, maxWidth: 165 }}>
              Built for makers, teams
              <br />
              & autonomous work.
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {["/hero-avatar-1.jpg", "/hero-avatar-2.jpg", "/hero-avatar-3.jpg"].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={24}
                  height={24}
                  decoding="async"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #f6f5f2",
                    marginLeft: i === 0 ? 0 : -7,
                    filter: "grayscale(0.35)",
                  }}
                />
              ))}
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid rgba(12,12,15,0.1)",
                  marginLeft: -7,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={10} color="#18181b" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Desktop tilts + Tablet scaling + Mobile clean stacked stage + 2x2 cards */}
      <style jsx global>{`
        .hero-card-panel {
          width: 196px;
        }
        .hero-orb-panel {
          width: 166px;
          height: 110px;
        }

        @media (min-width: 768px) {
          .hero-card-outer-left {
            transform: rotate(-3deg);
          }
          .hero-card-outer-right {
            transform: rotate(3deg);
          }
          .hero-rot-focus {
            transform: rotate(-1.5deg);
          }
          .hero-rot-memory {
            transform: rotate(1deg);
          }
          .hero-rot-execute {
            transform: rotate(1.5deg);
          }
          .hero-rot-orb {
            transform: rotate(-1.5deg);
          }
        }

        @media (max-width: 960px) and (min-width: 768px) {
          .hero-orbit-lines,
          .hero-card-outer-left,
          .hero-card-outer-right,
          .hero-card-horizon,
          .hero-corner-left {
            display: none !important;
          }
          .hero-portrait-box {
            width: 340px !important;
            height: 360px !important;
          }
          .hero-card-panel {
            width: 168px !important;
          }
          .hero-orb-panel {
            width: 140px !important;
            height: 92px !important;
          }
          .hero-card-focus {
            left: 16px !important;
            top: 68px !important;
          }
          .hero-card-memory {
            left: 16px !important;
            top: 214px !important;
          }
          .hero-card-execute {
            left: auto !important;
            right: 16px !important;
            top: 86px !important;
          }
          .hero-card-orb {
            left: auto !important;
            right: 20px !important;
            top: 224px !important;
          }
        }

        @media (max-width: 767px) {
          .palama-editorial-hero {
            border-radius: 0 0 24px 24px !important;
            padding-top: calc(var(--nav-height) + 18px) !important;
          }
          .hero-inner-container {
            padding: 0 16px !important;
          }
          .hero-orbit-lines,
          .hero-ambient-halo,
          .hero-card-outer-left,
          .hero-card-outer-right,
          .hero-card-horizon,
          .hero-corner-left {
            display: none !important;
          }
          .hero-stage {
            height: auto !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            margin-top: 14px !important;
            padding-bottom: 22px !important;
          }
          .hero-portrait-wrap {
            grid-column: 1 / -1 !important;
            position: relative !important;
            bottom: 0 !important;
            left: auto !important;
            right: auto !important;
            order: 1 !important;
            margin-bottom: -4px !important;
          }
          .hero-portrait-box {
            width: min(260px, 74vw) !important;
            height: min(270px, 76vw) !important;
          }
          .hero-tile {
            position: static !important;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
            order: 2 !important;
            width: 100% !important;
          }
          .hero-card-panel {
            width: 100% !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: rgba(255, 255, 255, 0.96) !important;
            padding: 11px 12px !important;
          }
          .hero-orb-panel {
            width: 100% !important;
            height: 100% !important;
            min-height: 76px !important;
          }
        }

        @media (max-width: 359px) {
          .hero-stage {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
