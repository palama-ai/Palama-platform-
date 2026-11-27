"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PlatformSkillsPage() {
  return (
    <div style={{ minHeight: "100vh" }}>

      <section style={{ paddingTop: "calc(var(--nav-height) + 120px)", paddingBottom: 120 }}>
        <div className="page-container" style={{ textAlign: "center", maxWidth: 900 }}>
          <div style={{ color: "#ff5f56", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24, fontSize: "0.85rem" }}>
            The Capabilities Layer
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            Skills & Capabilities
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: "var(--text-xl)", color: "#a1a1aa", margin: "24px auto 48px", maxWidth: 700 }}
          >
            Give your agent a brain, then give it a body. Skills are modular tools that you can attach to any Palama instance, granting it the ability to interact with databases, APIs, or software.
          </motion.p>
        </div>
      </section>

      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 48 }}>
            <h2 style={{ textAlign: "center", marginBottom: 32 }}>Featured Skills</h2>
            
            <div className="r-grid-3">
              {[
                { name: "Terminal Access", desc: "Allow the agent to run bash scripts safely.", type: "Core" },
                { name: "Postgres Reader", desc: "Execute SQL queries directly against your DB.", type: "Data" },
                { name: "GitHub Integration", desc: "Clone repos, read issues, and open PRs.", type: "Dev" },
                { name: "Salesforce CRM", desc: "Update lead status and pull account info.", type: "Business" },
                { name: "Web Crawler", desc: "Recursively scrape domains for unstructured text.", type: "Core" },
                { name: "Docker Orchestration", desc: "Spin up containers to test generated code.", type: "Dev" }
              ].map(skill => (
                <div key={skill.name} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 32 }}>
                  <div style={{ fontSize: "0.75rem", color: "#ffbd2e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>{skill.type}</div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: 12 }}>{skill.name}</h3>
                  <p style={{ color: "#a1a1aa", fontSize: "0.95rem", lineHeight: 1.5 }}>{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
