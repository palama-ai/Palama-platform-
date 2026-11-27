"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowCard, GlowRow } from "../components/ui/glow-card";

export default function DevelopersPage() {
  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ paddingTop: "calc(var(--nav-height) + 120px)", paddingBottom: 80 }}>
        <div className="page-container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ maxWidth: 700 }}
          >
            Developers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-editorial" style={{ marginTop: 24 }}
          >
            Build on the Palama Platform. Deploy autonomous agents, define custom skills, orchestrate models, and integrate agentic execution into any application.
          </motion.p>
        </div>
      </section>

      {/* Quick Start Code Block */}
      <section style={{ paddingBottom: 120 }}>
        <div className="page-container">
          <div className="r-split-lg r-split-top r-gap-64">
            <div style={{ minWidth: 0 }}>
              <h2 style={{ marginBottom: 24 }}>Start in minutes.</h2>
              <p className="text-editorial" style={{ marginBottom: 32 }}>
                Install the SDK, authenticate with your API key, and deploy your first agent with a single function call.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "Documentation", href: "/developers/docs", desc: "Comprehensive guides and tutorials" },
                  { label: "API Reference", href: "/developers/api", desc: "Full endpoint documentation" },
                  { label: "SDKs", href: "/developers/sdk", desc: "Python, TypeScript, Go, Rust" },
                  { label: "Agent Framework", href: "/developers/agents", desc: "Build and deploy custom agents" },
                ].map(item => (
                  <GlowRow key={item.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link
                      href={item.href}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 0",
                        textDecoration: "none",
                        color: "#fff",
                        transition: "opacity 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>{item.desc}</div>
                      </div>
                      <span style={{ color: "#666" }}>→</span>
                    </Link>
                  </GlowRow>
                ))}
              </div>
            </div>

            {/* Code Example */}
            <GlowCard style={{ padding: 0 }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
                <span style={{ marginLeft: 12, fontSize: "0.8rem", color: "#666" }}>quickstart.py</span>
              </div>
              <pre style={{ padding: "32px 24px", margin: 0, fontSize: "0.85rem", lineHeight: 1.7, color: "#e0e0e0", overflow: "auto" }}>
{`from palama import Palama

client = Palama(api_key="sk-...")

# Deploy an agent with a goal
result = client.agents.run(
    goal="Research the top 5 competitors "
         "in the AI agent space and create "
         "a comparison spreadsheet",
    skills=["browser", "sheets", "research"],
    model="auto",  # dynamic routing
    sandbox=True,
)

print(result.summary)
# => "Created comparison.xlsx with 5
#     competitors across 12 dimensions."

print(result.artifacts)
# => ["comparison.xlsx", "sources.md"]`}
              </pre>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* API Capabilities */}
      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container">
          <h2 style={{ marginBottom: 64 }}>What you can build</h2>
          <div className="r-grid-3">
            {[
              { title: "Custom Agents", desc: "Define agent behavior, persona, available skills, and execution constraints. Deploy them via API or embed them in your product." },
              { title: "Skill Chains", desc: "Compose multi-step workflows by chaining skills together. Palama handles orchestration, error recovery, and state management." },
              { title: "Model Routing", desc: "Specify model preferences per task or let Palama automatically route to the optimal model based on cost, speed, and capability." },
              { title: "Webhooks & Streaming", desc: "Receive real-time updates as your agent executes. Stream reasoning steps, tool calls, and results to your application." },
              { title: "Computer Use API", desc: "Programmatically direct agents to interact with GUI applications. Define visual targets, click sequences, and validation steps." },
              { title: "Memory & Context", desc: "Attach persistent memory stores to your agents. They retain information across sessions and improve with use." }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <GlowCard style={{ padding: 32 }}>
                  <h3 style={{ fontSize: "var(--text-xl)", marginBottom: 12 }}>{item.title}</h3>
                  <p style={{ color: "#a1a1aa", lineHeight: 1.6, fontSize: "0.95rem" }}>{item.desc}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
