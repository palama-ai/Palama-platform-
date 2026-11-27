"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowCard, GlowRow } from "../components/ui/glow-card";

export default function PlatformPage() {
  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ paddingTop: "calc(var(--nav-height) + 120px)", paddingBottom: 80 }}>
        <div className="page-container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ maxWidth: 700 }}
          >
            Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-editorial" style={{ marginTop: 24 }}
          >
            The technology layer behind the Palama super-agent. Models, Skills, Tools, and Memory work together to turn high-level goals into completed work.
          </motion.p>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container">
          <h2 style={{ marginBottom: 64 }}>How Palama thinks and acts</h2>
          <div className="r-grid-4">
            {[
              {
                title: "Models",
                href: "/platform/models",
                desc: "Palama dynamically selects the best model for each sub-task — frontier reasoning models for planning, fast models for extraction, specialized models for vision and code.",
                num: "01"
              },
              {
                title: "Skills",
                href: "/platform/skills",
                desc: "Modular capabilities the agent can invoke: coding, browser automation, data analysis, document generation, research, and more. The skill library is continuously expanding.",
                num: "02"
              },
              {
                title: "Tools",
                href: "/platform/tools",
                desc: "Connectors to external services: APIs, databases, cloud platforms, local applications. Tools give Palama the ability to take action beyond conversation.",
                num: "03"
              },
              {
                title: "Memory",
                href: "/platform/memory",
                desc: "Persistent context that spans sessions. Palama remembers your preferences, past interactions, file structures, and project state to work more effectively over time.",
                num: "04"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <Link href={item.href} style={{ textDecoration: "none", color: "#fff" }}>
                  <GlowCard style={{ padding: "40px 32px", minHeight: 300 }}>
                    <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: 24, fontFamily: "monospace" }}>{item.num}</div>
                    <h3 style={{ fontSize: "var(--text-2xl)", marginBottom: 16 }}>{item.title}</h3>
                    <p style={{ color: "#a1a1aa", lineHeight: 1.6, fontSize: "0.95rem" }}>{item.desc}</p>
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Execution Pipeline */}
      <section className="section-padding">
        <div className="page-container">
          <div className="r-split-lg">
            <div>
              <h2>From goal to result.</h2>
              <p className="text-editorial" style={{ margin: "24px 0" }}>
                When you give Palama a task, the platform orchestrates a complete execution pipeline. The agent decomposes your goal, selects the right models and tools, executes each step in a sandboxed environment, validates the output, and delivers the finished result.
              </p>
              <p className="text-editorial">
                Every action is logged, every decision is explainable, and every step can be reviewed before or after execution.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {["Goal Decomposition", "Model Selection", "Skill Assembly", "Tool Invocation", "Sandboxed Execution", "Validation", "Result Delivery"].map((step, i) => (
                <GlowRow key={step} style={{ borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 24,
                    padding: "20px 0",
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontFamily: "monospace", color: "#666", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "1.1rem" }}>{step}</span>
                  </div>
                </GlowRow>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Developer CTA */}
      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: 24 }}>Build on Palama</h2>
          <p className="text-editorial" style={{ margin: "0 auto 48px" }}>
            Access the Platform API to integrate agentic execution into your own applications. Deploy custom agents, define skill chains, and orchestrate models programmatically.
          </p>
          <Link href="/developers" style={{ background: "#fff", color: "#000", padding: "14px 28px", borderRadius: 4, fontWeight: 500, textDecoration: "none" }}>
            Explore Developer Docs
          </Link>
        </div>
      </section>

    </div>
  );
}
