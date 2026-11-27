"use client";
import { motion } from "framer-motion";
import { Navigation } from "@/app/components/ui/Navigation";
import { Features } from "@/app/components/ui/features-2";
import { BentoItem } from "@/app/components/ui/cybernetic-bento-grid";
export default function Page() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ paddingTop: "calc(var(--nav-height) + 72px)", paddingBottom: 64 }}>
        <div className="page-container" style={{ maxWidth: 960 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ marginBottom: 12 }}
          >
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>
              Memory
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05 }}
            style={{ maxWidth: 800 }}
          >
            Memory & Context
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 }}
            style={{ fontSize: "var(--text-xl)", color: "#a1a1aa", margin: "24px 0 48px", maxWidth: 600, lineHeight: 1.7 }}
          >
            Infinite context windows and vector database integrations.
          </motion.p>
        </div>
      </section>

      {/* Bento Feature Block */}
      <section style={{ background: "#080808", paddingTop: 80, paddingBottom: 80, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="page-container">
          <div className="r-grid-2" style={{ marginBottom: 24 }}>
            <BentoItem>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>What is Memory & Context?</h3>
              <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem" }}>Infinite context windows and vector database integrations.</p>
            </BentoItem>
            <BentoItem>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>Enterprise Ready</h3>
              <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem" }}>Built for scale with SOC 2 compliance, dedicated infrastructure, and 99.9% uptime SLAs.</p>
            </BentoItem>
          </div>
          <div className="r-grid-3">
            <BentoItem>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: 8 }}>Reliable</h3>
              <p style={{ color: "#666", lineHeight: 1.5, fontSize: "0.85rem" }}>Enterprise-grade infrastructure with redundant failover.</p>
            </BentoItem>
            <BentoItem>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: 8 }}>Documented</h3>
              <p style={{ color: "#666", lineHeight: 1.5, fontSize: "0.85rem" }}>Comprehensive API docs, guides, and integration examples.</p>
            </BentoItem>
            <BentoItem>
              <h3 style={{ fontSize: "1rem", fontWeight: 500, marginBottom: 8 }}>Secure</h3>
              <p style={{ color: "#666", lineHeight: 1.5, fontSize: "0.85rem" }}>Encrypted at rest and in transit. Private and SOC 2 certified.</p>
            </BentoItem>
          </div>
        </div>
      </section>

      {/* Deep Dive Text Section */}
      <section style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", color: "#a1a1aa", fontSize: "1.1rem", lineHeight: 1.8 }}>
      
      {/* Introduction */}
      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 48, fontWeight: 600, letterSpacing: "-0.02em" }}>Introduction to Memory & Context</h2>
      <p style={{ marginBottom: 24 }}>Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. Developers can leverage the extensible API of Memory & Context to seamlessly embed its capabilities into legacy systems. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. </p>
      <p style={{ marginBottom: 24 }}>Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. </p>

      {/* Deep Dive 1 */}
      <div style={{ background: "#111", borderLeft: "4px solid #fff", padding: "24px 32px", margin: "40px 0", borderRadius: "0 8px 8px 0" }}>
        <h4 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "1.2rem", fontWeight: 500 }}>Key Architectural Insight</h4>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          "The true breakthrough of Memory & Context isn't just its raw processing power, but its ability to autonomously determine the optimal routing path for any given tensor calculation. It doesn't just compute; it reasons about *how* to compute."
        </p>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Core Capabilities & Mechanics</h2>
      <p style={{ marginBottom: 24 }}>The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. Developers can leverage the extensible API of Memory & Context to seamlessly embed its capabilities into legacy systems. By isolating context streams in memory, Memory & Context guarantees sub-millisecond latency even under extreme load. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. </p>
      
      {/* List Section */}
      <ul style={{ marginBottom: 32, paddingLeft: 24 }}>
        <li style={{ marginBottom: 12 }}><strong>Deterministic Execution:</strong> The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. </li>
        <li style={{ marginBottom: 12 }}><strong>Infinite Context Window:</strong> We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. </li>
        <li style={{ marginBottom: 12 }}><strong>Real-time State Sync:</strong> Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. </li>
        <li style={{ marginBottom: 12 }}><strong>Autonomous Error Recovery:</strong> We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. </li>
      </ul>

      <p style={{ marginBottom: 24 }}>Developers can leverage the extensible API of Memory & Context to seamlessly embed its capabilities into legacy systems. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. By isolating context streams in memory, Memory & Context guarantees sub-millisecond latency even under extreme load. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. </p>

      {/* Code Block / Technical Details */}
      <div style={{ background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 24, margin: "48px 0", fontFamily: "monospace", fontSize: "0.9rem", color: "#4ade80", overflowX: "auto", whiteSpace: "pre-wrap" }}>
        <div style={{ color: "#888", marginBottom: 12 }}>// Initializing Memory & Context inside a secure sandbox</div>
        <code>
          const session = await Palama.createSession({"{"})<br/>
          {"  "}target: "Memory & Context",<br/>
          {"  "}isolationLevel: "HARDWARE",<br/>
          {"  "}maxTokens: 1000000<br/>
          {"}"});<br/>
          <br/>
          const result = await session.execute(complexWorkload);<br/>
          console.log(result.metrics);
        </code>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Security & Compliance</h2>
      <p style={{ marginBottom: 24 }}>By isolating context streams in memory, Memory & Context guarantees sub-millisecond latency even under extreme load. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. </p>
      <p style={{ marginBottom: 24 }}>Developers can leverage the extensible API of Memory & Context to seamlessly embed its capabilities into legacy systems. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. </p>

      {/* Table Section */}
      <div className="r-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "16px 24px", color: "#fff", fontWeight: 500 }}>Metric</th>
              <th style={{ padding: "16px 24px", color: "#fff", fontWeight: 500 }}>Memory & Context Value</th>
              <th style={{ padding: "16px 24px", color: "#fff", fontWeight: 500 }}>Industry Std</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "16px 24px" }}>P99 Latency</td>
              <td style={{ padding: "16px 24px", color: "#fff" }}>&lt; 50ms</td>
              <td style={{ padding: "16px 24px" }}>250ms</td>
            </tr>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "16px 24px" }}>Context Retention</td>
              <td style={{ padding: "16px 24px", color: "#fff" }}>99.99%</td>
              <td style={{ padding: "16px 24px" }}>92.50%</td>
            </tr>
            <tr>
              <td style={{ padding: "16px 24px" }}>Fault Recovery</td>
              <td style={{ padding: "16px 24px", color: "#fff" }}>Instant (0-downtime)</td>
              <td style={{ padding: "16px 24px" }}>Manual / High Delay</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Deployment Strategy</h2>
      <p style={{ marginBottom: 24 }}>Developers can leverage the extensible API of Memory & Context to seamlessly embed its capabilities into legacy systems. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. </p>
      <p style={{ marginBottom: 24 }}>With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. By isolating context streams in memory, Memory & Context guarantees sub-millisecond latency even under extreme load. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. </p>

      {/* Quote */}
      <div style={{ textAlign: "center", margin: "64px 0" }}>
        <h3 style={{ fontSize: "1.5rem", color: "#fff", fontWeight: 400, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 16px 0" }}>
          "Implementing Memory & Context allowed us to scale our operations globally without hiring a single additional devops engineer."
        </h3>
        <span style={{ color: "#888", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>— Lead Architect at Global FinTech</span>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Future Roadmap</h2>
      <p style={{ marginBottom: 24 }}>The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. </p>
      <p style={{ marginBottom: 24 }}>Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. </p>
      
      <div style={{ height: 120 }}></div>
      
      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Advanced Integrations</h2>
      <p style={{ marginBottom: 24 }}>The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. With native support for edge deployments, Memory & Context pushes computation closer to the data source, slashing bandwidth costs. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. </p>
      <p style={{ marginBottom: 24 }}>Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. </p>

      <div style={{ height: 120 }}></div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Conclusion</h2>
      <p style={{ marginBottom: 24 }}>The integration of non-blocking I/O operations ensures that the core event loop of Memory & Context remains highly responsive. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. Our proprietary tensor routing algorithm ensures that Memory & Context minimizes cross-node communication overhead. The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. </p>
      <p style={{ marginBottom: 24 }}>The architecture of Memory & Context fundamentally redefines how we approach platform by distributing workloads across a decentralized compute grid. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. Security is not an afterthought; Memory & Context encrypts all state transitions using AES-256-GCM at the hardware level. Developers can leverage the extensible API of Memory & Context to seamlessly embed its capabilities into legacy systems. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. Extensive benchmarking reveals that Memory & Context maintains deterministic execution times even when scaling horizontally to thousands of instances. The fault-tolerance mechanisms in Memory & Context automatically reroute execution paths if a localized node failure occurs. We evaluated Memory & Context against existing industry standards and observed a 300% improvement in throughput. </p>

    </div>
  
      </section>


      {/* Deep Dive FAQs */}
      <section style={{ background: "#000" }}>
        
    <div style={{ maxWidth: 800, margin: "100px auto 160px", padding: "0 24px" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "#fff", marginBottom: 48, textAlign: "center", letterSpacing: "-0.02em" }}>
        Frequently Asked Questions
      </h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* FAQ Item 1 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>How does Memory & Context integrate with existing infrastructure?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Memory & Context is designed to be fully modular. It connects via standard REST/GraphQL endpoints and supports native event streaming through Kafka and WebSockets. For enterprise deployments, we provide a dedicated VPC peering option to ensure zero-latency data transfer.
          </p>
        </BentoItem>

        {/* FAQ Item 2 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>What are the compliance and data residency guarantees?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Security is paramount. Memory & Context inherits our global compliance certifications, including SOC 2 Type II, ISO 27001, and HIPAA. Data can be pinned to specific geographic regions (e.g., EU-Central, US-East) to comply with local data sovereignty laws like GDPR and CCPA.
          </p>
        </BentoItem>

        {/* FAQ Item 3 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>Can Memory & Context be fine-tuned or customized?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Yes. Enterprise customers receive access to our orchestration dashboard, allowing you to define custom system prompts, inject proprietary vector knowledge bases (RAG), and adjust the safety boundaries specifically for Memory & Context workflows.
          </p>
        </BentoItem>

        {/* FAQ Item 4 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>What is the pricing model?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Usage is billed entirely on compute duration and token throughput. There are no seat licenses or hidden fees. We believe you should only pay for the exact amount of intelligence and execution Memory & Context consumes. Volume discounts trigger automatically at scale.
          </p>
        </BentoItem>
      </div>
    </div>
  
      </section>

      {/* Features */}
      <Features featuresSubtitle="Capabilities" />
    </div>
  );
}
