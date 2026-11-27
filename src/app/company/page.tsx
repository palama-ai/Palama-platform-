"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CompanyPage() {
  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ paddingTop: "calc(var(--nav-height) + 120px)", paddingBottom: 80 }}>
        <div className="page-container" style={{ maxWidth: 900 }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            Building the digital workforce.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-editorial" style={{ marginTop: 24 }}
          >
            Palama is an AI research and deployment company building the universal super-agent — a system capable of autonomously executing complex digital workflows across any tool, model, or application.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container">
          <div className="r-split-lg r-split-top">
            <div>
              <h2 style={{ marginBottom: 24 }}>Our mission</h2>
              <p className="text-editorial">
                To expand human capability by building AI systems that don't just think — they act. We believe the next phase of computing is not about better chatbots. It's about agents that can be given a goal and trusted to complete it.
              </p>
            </div>
            <div>
              <h2 style={{ marginBottom: 24 }}>Our approach</h2>
              <p className="text-editorial">
                We combine foundational AI research with production-grade engineering. Our team spans model development, agent architecture, computer use research, distributed systems, and product design. Every system we build must be safe, reliable, and useful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="section-padding">
        <div className="page-container">
          <div className="r-grid-4" style={{ textAlign: "center" }}>
            {[
              { num: "2024", label: "Founded" },
              { num: "50+", label: "Team members" },
              { num: "12M+", label: "Tasks executed" },
              { num: "99.7%", label: "Uptime SLA" }
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: "var(--text-4xl)", fontWeight: 500, letterSpacing: "-0.03em", marginBottom: 8 }}>{stat.num}</div>
                <div style={{ color: "#a1a1aa" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Safety */}
      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container" style={{ maxWidth: 900 }}>
          <h2 style={{ marginBottom: 24 }}>Security and control</h2>
          <p className="text-editorial" style={{ marginBottom: 48 }}>
            Autonomous agents that interact with real systems carry real responsibility. We design every layer of the Palama stack with isolation, transparency, and user control as first principles.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { title: "Sandboxed Execution", desc: "Every agent operates within an isolated, ephemeral virtual machine. When the task is complete, the environment is destroyed." },
              { title: "Human-in-the-Loop", desc: "Users can configure which actions require explicit approval. Sensitive operations like sending emails or making purchases always require confirmation." },
              { title: "Cryptographic Audit Trail", desc: "Every action, reasoning step, and tool call is immutably logged. Enterprise customers can export complete audit trails for compliance." },
              { title: "Permission Boundaries", desc: "Agents can only access the tools, files, and services explicitly granted by the user. There is no implicit scope escalation." },
              { title: "Continuous Red Teaming", desc: "We continuously test our agents against adversarial misuse, prompt injection, and privilege-escalation edge cases." }
            ].map((item, i) => (
              <div key={item.title} className="r-split-row" style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 500 }}>{item.title}</h3>
                <p style={{ color: "#a1a1aa", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
