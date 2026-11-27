"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Target, Layers, AudioLines, Plus } from "lucide-react";

function FourPointStar({ size = 14, color = "#0c0c0f" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
    </svg>
  );
}

export default function PalamaHero() {
  return (
    <section
      className="palama-editorial-hero"
      style={{
        position: "relative",
        width: "100%",
        background: "radial-gradient(ellipse 85% 75% at 50% 38%, #ffffff 0%, #f6f5f2 56%, #ecebe6 100%)",
        color: "#0c0c0f",
        paddingTop: "calc(var(--nav-height) + 40px)",
        paddingBottom: 0,
        overflow: "hidden",
        borderRadius: "0 0 36px 36px",
        boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
      }}
    >
      {/* Top-Right Rotating Editorial Stamp */}
      <div
        className="hero-stamp-badge"
        style={{
          position: "absolute",
          top: "calc(var(--nav-height) + 28px)",
          right: "clamp(20px, 5vw, 72px)",
          width: 78,
          height: 78,
          zIndex: 20,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={78}
          height={78}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <path
              id="palama-stamp-circle"
              d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
            />
          </defs>
          <text
            fill="#18181b"
            fontSize="7.4"
            fontWeight="600"
            letterSpacing="2.3"
            style={{ textTransform: "uppercase" }}
          >
            <textPath href="#palama-stamp-circle" startOffset="0%">
              • A MORE FOCUSED YOU • PALAMA AI
            </textPath>
          </text>
        </svg>
        <FourPointStar size={14} color="#18181b" />
      </div>

      {/* Main Content Container */}
      <div
        style={{
          maxWidth: 1260,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
        }}
      >
        {/* Editorial Header Block */}
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-serif), Georgia, 'Times New Roman', serif",
              fontSize: "clamp(3.15rem, 6.2vw, 5.25rem)",
              fontWeight: 400,
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
              color: "#0c0c0f",
              maxWidth: 780,
              margin: "0 0 18px",
            }}
          >
            A clearer workflow
            <br />
            for <span style={{ fontStyle: "italic" }}>everything</span> you build.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "0.98rem",
              lineHeight: 1.55,
              color: "#52525b",
              maxWidth: 460,
              margin: "0 0 26px",
              fontWeight: 400,
            }}
          >
            Palama unites your browser, apps, code, and files into one calm
            autonomous co-worker — right on your screen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
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
                fontWeight: 500,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(12, 12, 15, 0.18)",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "#1c1c21";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "#0c0c0f";
              }}
            >
              <span>Get started free</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/demo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255, 255, 255, 0.86)",
                color: "#0c0c0f",
                padding: "11px 20px",
                borderRadius: 9999,
                fontSize: "0.88rem",
                fontWeight: 500,
                textDecoration: "none",
                border: "1px solid rgba(12, 12, 15, 0.12)",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.86)";
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#0c0c0f",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Play size={8} fill="#fff" style={{ marginLeft: 1 }} />
              </span>
              <span>Watch video</span>
            </Link>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* CENTERPIECE STAGE: Portrait + Orbiting 3D Cards + Threads */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div
          className="hero-stage"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1120,
            height: "clamp(480px, 56vw, 620px)",
            margin: "14px auto 0",
          }}
        >
          {/* Curved Hairline Orbit Connectors (Desktop) */}
          <svg
            className="hero-orbit-lines"
            viewBox="0 0 1120 540"
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
            {/* Left outer card to portrait orbit */}
            <path
              d="M 105 70 C 115 215, 240 275, 360 285"
              stroke="rgba(12, 12, 15, 0.14)"
              strokeWidth="1"
            />
            {/* Right outer card to portrait orbit */}
            <path
              d="M 995 160 C 960 285, 845 325, 735 315"
              stroke="rgba(12, 12, 15, 0.14)"
              strokeWidth="1"
            />
            {/* Subtle orbital ellipse ring */}
            <ellipse
              cx="560"
              cy="315"
              rx="295"
              ry="108"
              stroke="rgba(12, 12, 15, 0.05)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </svg>

          {/* Soft ambient spotlight behind the portrait */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              transform: "translateX(-50%)",
              width: "min(560px, 85vw)",
              height: "min(480px, 90%)",
              background: "radial-gradient(circle at 50% 52%, rgba(255,255,255,0.95) 0%, rgba(246,245,242,0) 72%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* Center Editorial Monochrome Portrait — outer static wrapper keeps X centered cleanly */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -6,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              zIndex: 12,
              pointerEvents: "none",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: "clamp(420px, 56vw, 660px)",
                height: "clamp(470px, 60vw, 650px)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <img
                src="/hero-portrait.png"
                alt="Calm focus with Palama"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  display: "block",
                  filter: "contrast(1.04)",
                }}
              />
            </motion.div>
          </div>

          {/* ── 1. OUTER TOP-LEFT FLOATING CARD ── */}
          <motion.div
            className="hero-card-outer-left"
            initial={{ opacity: 0, y: 14, rotate: -5.5 }}
            animate={{ opacity: 1, y: 0, rotate: -5.5 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              left: "clamp(4px, 3vw, 42px)",
              top: -42,
              width: 158,
              padding: "16px 15px",
              borderRadius: 18,
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(12, 12, 15, 0.06)",
              boxShadow: "0 18px 42px rgba(12, 12, 15, 0.08)",
              zIndex: 18,
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "#f4f4f5",
                border: "1px solid rgba(12,12,15,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <AudioLines size={14} color="#18181b" />
            </div>
            <div style={{ fontSize: "0.84rem", fontWeight: 600, lineHeight: 1.25, color: "#0c0c0f", marginBottom: 6 }}>
              Turn thoughts
              <br />
              into progress.
            </div>
            <div style={{ fontSize: "0.7rem", lineHeight: 1.4, color: "#71717a" }}>
              Plan, automate and finish more.
            </div>
          </motion.div>

          {/* ── 2. INNER LEFT BACKGROUND CURVED LANDSCAPE CARD ── */}
          <div
            className="hero-card-horizon"
            style={{
              position: "absolute",
              left: "calc(50% - 355px)",
              top: 235,
              zIndex: 9,
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 146,
                height: 92,
                borderRadius: 14,
                padding: 4,
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(255,255,255,0.92)",
                boxShadow: "0 16px 36px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <img
                src="/hero-card-horizon.jpg"
                alt="Deep perspective"
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

          {/* ── 3. INNER LEFT-UPPER FROSTED GLASS PILL (Focus) ── */}
          <div
            className="hero-card-focus"
            style={{
              position: "absolute",
              left: "calc(50% - 290px)",
              top: 138,
              zIndex: 18,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: -2.5 }}
              animate={{ opacity: 1, scale: 1, rotate: -2.5 }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 174,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.76)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.88)",
                boxShadow: "0 14px 36px rgba(12, 12, 15, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "#e7f8c3",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={14} color="#4d7c0f" />
              </span>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0c0c0f" }}>Focus</div>
                <div style={{ fontSize: "0.66rem", color: "#52525b", lineHeight: 1.3 }}>
                  Deep work, real results.
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── 4. INNER LEFT-LOWER FROSTED GLASS PILL (Memory) ── */}
          <div
            className="hero-card-memory"
            style={{
              position: "absolute",
              left: "calc(50% - 252px)",
              top: 296,
              zIndex: 22,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: 1.5 }}
              animate={{ opacity: 1, scale: 1, rotate: 1.5 }}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 174,
                padding: "13px 14px",
                borderRadius: 15,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(255, 255, 255, 0.92)",
                boxShadow: "0 18px 40px rgba(12, 12, 15, 0.11)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "#ede9fe",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={14} color="#7c3aed" />
              </span>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0c0c0f" }}>Memory</div>
                <div style={{ fontSize: "0.66rem", color: "#52525b", lineHeight: 1.3 }}>
                  Context that stays yours.
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── 5. INNER RIGHT-UPPER FROSTED GLASS PILL (Plan) ── */}
          <div
            className="hero-card-execute"
            style={{
              position: "absolute",
              left: "calc(50% + 128px)",
              top: 192,
              zIndex: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, rotate: -1.5 }}
              animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 174,
                padding: "13px 14px",
                borderRadius: 15,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(255, 255, 255, 0.92)",
                boxShadow: "0 16px 38px rgba(12, 12, 15, 0.09)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "#ffedd5",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Layers size={14} color="#ea580c" />
              </span>
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#0c0c0f" }}>Plan</div>
                <div style={{ fontSize: "0.66rem", color: "#52525b", lineHeight: 1.3 }}>
                  Turn prompts into action.
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── 6. INNER RIGHT-LOWER DARK ECLIPSE ORB CARD ── */}
          <div
            className="hero-card-orb"
            style={{
              position: "absolute",
              left: "calc(50% + 145px)",
              top: 324,
              zIndex: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 16, rotate: 3.5 }}
              animate={{ opacity: 1, x: 0, rotate: 3.5 }}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 142,
                height: 96,
                borderRadius: 15,
                padding: 3,
                background: "#0a0a0c",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: "0 20px 44px rgba(0, 0, 0, 0.28)",
                overflow: "hidden",
              }}
            >
              <img
                src="/hero-card-orb.jpg"
                alt="Autonomous intelligence core"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                }}
              />
            </motion.div>
          </div>

          {/* ── 7. OUTER TOP-RIGHT FLOATING SYNC CARD ── */}
          <motion.div
            className="hero-card-outer-right"
            initial={{ opacity: 0, y: 14, rotate: 4.5 }}
            animate={{ opacity: 1, y: 0, rotate: 4.5 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              right: "clamp(4px, 3vw, 38px)",
              top: 38,
              width: 170,
              padding: "16px 15px",
              borderRadius: 18,
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(12, 12, 15, 0.06)",
              boxShadow: "0 18px 42px rgba(12, 12, 15, 0.08)",
              zIndex: 18,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              {["/hero-avatar-1.jpg", "/hero-avatar-2.jpg", "/hero-avatar-3.jpg"].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #ffffff",
                    marginLeft: i === 0 ? 0 : -7,
                    filter: "grayscale(0.25)",
                  }}
                />
              ))}
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#f4f4f5",
                  border: "2px solid #ffffff",
                  marginLeft: -7,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={11} color="#18181b" />
              </span>
            </div>
            <div style={{ fontSize: "0.84rem", fontWeight: 600, lineHeight: 1.25, color: "#0c0c0f", marginBottom: 6 }}>
              Actions, anytime,
              <br />
              anywhere.
            </div>
            <div style={{ fontSize: "0.7rem", lineHeight: 1.4, color: "#71717a" }}>
              Sync across desktop & cloud.
            </div>
          </motion.div>

          {/* ── BOTTOM-LEFT SOCIAL PROOF CORNER ── */}
          <motion.div
            className="hero-corner-left"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{
              position: "absolute",
              left: 8,
              bottom: 36,
              textAlign: "left",
              zIndex: 20,
            }}
          >
            <div style={{ width: 14, height: 1, background: "rgba(12,12,15,0.35)", marginBottom: 10 }} />
            <div style={{ fontSize: "0.74rem", lineHeight: 1.4, color: "#52525b", marginBottom: 10, maxWidth: 165 }}>
              Trusted by builders &
              <br />
              creators worldwide.
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {["/hero-avatar-1.jpg", "/hero-avatar-2.jpg", "/hero-avatar-3.jpg"].map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #f6f5f2",
                    marginLeft: i === 0 ? 0 : -8,
                    filter: "grayscale(0.2)",
                  }}
                />
              ))}
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid rgba(12,12,15,0.1)",
                  marginLeft: -8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={11} color="#18181b" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Responsive adjustments for smaller screens */}
      <style jsx>{`
        @media (max-width: 960px) {
          .hero-stamp-badge,
          .hero-orbit-lines,
          .hero-card-outer-left,
          .hero-card-outer-right,
          .hero-card-horizon,
          .hero-corner-left {
            display: none !important;
          }
          .hero-card-focus {
            left: 12px !important;
            top: 90px !important;
            width: 148px !important;
          }
          .hero-card-memory {
            left: 14px !important;
            top: 230px !important;
            width: 148px !important;
          }
          .hero-card-execute {
            left: auto !important;
            right: 12px !important;
            top: 130px !important;
            width: 148px !important;
          }
          .hero-card-orb {
            left: auto !important;
            right: 14px !important;
            top: 265px !important;
            width: 120px !important;
            height: 82px !important;
          }
        }
      `}</style>
    </section>
  );
}
