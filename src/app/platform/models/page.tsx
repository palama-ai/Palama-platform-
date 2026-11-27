"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ModelsPlatformPage() {
  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Hero */}
      <section style={{ paddingTop: "calc(var(--nav-height) + 120px)", paddingBottom: 120 }}>
        <div className="page-container" style={{ textAlign: "center", maxWidth: 900 }}>
          <div style={{ color: "#ffbd2e", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24, fontSize: "0.85rem" }}>
            The Intelligence Layer
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            Model Agnosticism
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: "var(--text-xl)", color: "#a1a1aa", margin: "24px auto 48px", maxWidth: 700 }}
          >
            The best AI agent doesn't rely on a single model. Palama acts as an intelligence router, dynamically selecting the optimal foundation model for each sub-task based on capability, latency, and cost.
          </motion.p>
        </div>
      </section>

      {/* Dynamic Routing Diagram / Explanation */}
      <section className="section-padding" style={{ background: "#0a0a0a" }}>
        <div className="page-container">
          <div className="r-split-lg">
            <div>
              <h2>How dynamic routing works.</h2>
              <p className="text-editorial" style={{ margin: "24px 0" }}>
                When you assign Palama a complex objective, it first uses a high-parameter frontier reasoning model to decompose the goal into a plan.
              </p>
              <p className="text-editorial" style={{ margin: "24px 0" }}>
                As it executes the plan, it routes specific tasks to specialized models: code generation goes to models fine-tuned for syntax, visual parsing goes to multimodal vision models, and repetitive data extraction is routed to extremely fast, lightweight models.
              </p>
            </div>
            
            <div style={{ background: "#111", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { task: "Complex Planning", model: "GPT-4o / Claude 3.5 Opus", speed: "High latency", cost: "High cost" },
                { task: "Code Generation", model: "Claude 3.5 Sonnet", speed: "Medium latency", cost: "Medium cost" },
                { task: "Vision / Screen Parsing", model: "GPT-4o Vision", speed: "Medium latency", cost: "Medium cost" },
                { task: "Data Extraction & Routing", model: "Llama 3 8B / GPT-4o-mini", speed: "Ultra-low latency", cost: "Low cost" },
              ].map(route => (
                <div key={route.task} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{route.task}</div>
                    <div style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>{route.model}</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#666" }}>
                    <div>{route.speed}</div>
                    <div>{route.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bring Your Own Model */}
      <section className="section-padding">
        <div className="page-container" style={{ textAlign: "center", maxWidth: 800 }}>
          <h2 style={{ marginBottom: 24 }}>Bring your own intelligence.</h2>
          <p className="text-editorial" style={{ margin: "0 auto 64px" }}>
            Palama integrates natively with the leading model providers, but enterprise customers can seamlessly point the agent framework at their own fine-tuned open-weight models or private VPC endpoints for total data privacy.
          </p>
          
          <div className="r-grid-3" style={{ textAlign: "left" }}>
            {[
              { name: "Public APIs", desc: "Native support for OpenAI, Anthropic, Google Gemini, and Cohere endpoints." },
              { name: "Open Weights", desc: "Deploy Palama against local instances of Llama 3, Mistral, or Qwen via vLLM." },
              { name: "Private VPCs", desc: "Keep all telemetry and inference strictly within your corporate firewall." }
            ].map(sec => (
              <div key={sec.name} style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "32px", borderRadius: 8, background: "#050505" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>{sec.name}</h3>
                <p style={{ color: "#a1a1aa", lineHeight: 1.5, fontSize: "0.9rem" }}>{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
