const fs = require('fs');
const path = require('path');

const pages = [
  // Research & Intelligence
  { path: '/research/index', title: 'Research Index', desc: 'A comprehensive archive of our papers and architectural breakthroughs.', subtitle: 'Archive', process_subtitle: 'Research Model', process_title: 'How We Advance AI', features_subtitle: 'Publications' },
  { path: '/research/architecture', title: 'Architectural Overview', desc: 'Deep dive into the neural architecture powering Palama.', subtitle: 'Engineering', process_subtitle: 'Architecture', process_title: 'How the Stack Works', features_subtitle: 'Components' },
  { path: '/research/economics', title: 'Economic Impact', desc: 'Studying the macroeconomic effects of universal autonomous agents.', subtitle: 'Analysis', process_subtitle: 'Methodology', process_title: 'Our Research Approach', features_subtitle: 'Findings' },
  { path: '/research/models/palama-1-vision', title: 'Palama-1 Vision', desc: 'Our state-of-the-art vision-language model for UI parsing.', subtitle: 'Model', process_subtitle: 'Vision Model', process_title: 'How Vision Processing Works', features_subtitle: 'Capabilities' },
  { path: '/research/models/palama-1-logic', title: 'Palama-1 Logic', desc: 'The core reasoning engine capable of multi-step planning.', subtitle: 'Model', process_subtitle: 'Logic Engine', process_title: 'How Reasoning Works', features_subtitle: 'Capabilities' },
  { path: '/research/models/palama-micro', title: 'Palama Micro', desc: 'Lightning-fast on-device inference for edge applications.', subtitle: 'Model', process_subtitle: 'Edge Inference', process_title: 'How Local AI Works', features_subtitle: 'Performance' },
  { path: '/safety/approach', title: 'Safety Approach', desc: 'How we build inherently safe, controllable autonomous systems.', subtitle: 'Safety', process_subtitle: 'Safety Framework', process_title: 'How We Ensure Safety', features_subtitle: 'Principles' },
  { path: '/safety/deployment', title: 'Deployment Safety', desc: 'Staged rollouts, human-in-the-loop, and boundary constraints.', subtitle: 'Deployment', process_subtitle: 'Rollout Process', process_title: 'How Safe Deployment Works', features_subtitle: 'Guardrails' },
  { path: '/safety/security-privacy', title: 'Security & Privacy', desc: 'Enterprise-grade encryption and strict data siloing.', subtitle: 'Security', process_subtitle: 'Security Architecture', process_title: 'How We Protect Your Data', features_subtitle: 'Standards' },
  { path: '/safety/trust', title: 'Trust & Transparency', desc: 'Our commitment to open reporting and model explainability.', subtitle: 'Trust', process_subtitle: 'Transparency Model', process_title: 'How We Build Trust', features_subtitle: 'Commitments' },
  // Products & Platform
  { path: '/products/enterprise', title: 'Palama Enterprise', desc: 'Dedicated compute and custom fine-tuning for massive organizations.', subtitle: 'Enterprise', process_subtitle: 'Onboarding', process_title: 'How Enterprise Works', features_subtitle: 'Features' },
  { path: '/products/education', title: 'Palama for Education', desc: 'Empowering students and researchers with agentic workflows.', subtitle: 'Education', process_subtitle: 'Learning Model', process_title: 'How Education Works', features_subtitle: 'Benefits' },
  { path: '/products/release-notes', title: 'Release Notes', desc: 'The latest updates, capabilities, and performance improvements.', subtitle: 'Changelog', process_subtitle: 'Release Cycle', process_title: 'How We Ship Updates', features_subtitle: 'Highlights' },
  { path: '/platform/dashboard', title: 'API Dashboard', desc: 'Manage your API keys, monitor usage, and configure webhooks.', subtitle: 'Platform', process_subtitle: 'Dashboard', process_title: 'How the Dashboard Works', features_subtitle: 'Features' },
  { path: '/platform/memory', title: 'Memory & Context', desc: 'Infinite context windows and vector database integrations.', subtitle: 'Memory', process_subtitle: 'Memory System', process_title: 'How Memory Works', features_subtitle: 'Capabilities' },
  { path: '/platform/tools', title: 'Platform Tools', desc: 'Connect Palama directly to your internal software stack.', subtitle: 'Tools', process_subtitle: 'Tool Integration', process_title: 'How Tools Connect', features_subtitle: 'Integrations' },
  // Solutions & Business
  { path: '/solutions/business', title: 'Business Overview', desc: 'Transform your enterprise with agentic automation.', subtitle: 'Solutions', process_subtitle: 'Deployment', process_title: 'How Business Works', features_subtitle: 'Benefits' },
  { path: '/solutions/industries', title: 'Industry Solutions', desc: 'Tailored agent architectures for healthcare, finance, and logistics.', subtitle: 'Industries', process_subtitle: 'Industry Model', process_title: 'How Industry Solutions Work', features_subtitle: 'Verticals' },
  { path: '/solutions/roi', title: 'ROI Calculator', desc: 'Calculate the thousands of hours saved by deploying Palama.', subtitle: 'ROI', process_subtitle: 'ROI Model', process_title: 'How We Measure Value', features_subtitle: 'Metrics' },
  { path: '/solutions/stories', title: 'Customer Stories', desc: 'See how leading companies are using Palama today.', subtitle: 'Stories', process_subtitle: 'Case Studies', process_title: 'How Customers Succeed', features_subtitle: 'Results' },
  { path: '/solutions/partners', title: 'Partner Network', desc: 'Join our ecosystem of integration and consulting partners.', subtitle: 'Partners', process_subtitle: 'Partnership', process_title: 'How Partnerships Work', features_subtitle: 'Benefits' },
  { path: '/contact/sales', title: 'Contact Sales', desc: 'Get in touch with our enterprise team to discuss deployment.', subtitle: 'Sales', process_subtitle: 'Sales Process', process_title: 'How We Engage', features_subtitle: 'Next Steps' },
  { path: '/solutions/teams', title: 'For Teams', desc: 'Collaborative agent workspaces for marketing, engineering, and HR.', subtitle: 'Teams', process_subtitle: 'Team Model', process_title: 'How Teams Use Palama', features_subtitle: 'Benefits' },
  { path: '/solutions/developers', title: 'For Developers', desc: 'Accelerate your engineering velocity with autonomous coding agents.', subtitle: 'Developers', process_subtitle: 'Dev Model', process_title: 'How Developers Build', features_subtitle: 'Tools' },
  { path: '/solutions/personal', title: 'For Personal Use', desc: 'Your personal execution engine for daily tasks.', subtitle: 'Personal', process_subtitle: 'Personal Model', process_title: 'How Palama Helps You', features_subtitle: 'Use Cases' },
  // Developers
  { path: '/developers/docs', title: 'Documentation', desc: 'Comprehensive guides to the Palama API and SDKs.', subtitle: 'Docs', process_subtitle: 'Docs Structure', process_title: 'How Docs Are Organized', features_subtitle: 'Resources' },
  { path: '/developers/api', title: 'API Reference', desc: 'Detailed endpoint specifications for the Palama Platform.', subtitle: 'API', process_subtitle: 'API Design', process_title: 'How the API Works', features_subtitle: 'Endpoints' },
  { path: '/developers/sdk', title: 'SDKs', desc: 'Official client libraries for Python, Node.js, Go, and Rust.', subtitle: 'SDKs', process_subtitle: 'SDK Model', process_title: 'How SDKs Are Built', features_subtitle: 'Languages' },
  { path: '/developers/open-source', title: 'Open Source', desc: 'Community-driven tools and extensions for the Palama ecosystem.', subtitle: 'Open Source', process_subtitle: 'OSS Model', process_title: 'How Open Source Works', features_subtitle: 'Projects' },
  { path: '/developers/forum', title: 'Developer Forum', desc: 'Connect with other builders and share your agent architectures.', subtitle: 'Community', process_subtitle: 'Community', process_title: 'How the Forum Works', features_subtitle: 'Features' },
  { path: '/developers/agents', title: 'Agent Framework', desc: 'Build custom capabilities using our open-source framework.', subtitle: 'Framework', process_subtitle: 'Agent Model', process_title: 'How Agents Are Built', features_subtitle: 'Primitives' },
  // Company
  { path: '/company/about', title: 'About Palama', desc: 'Our mission to build universal super-agents.', subtitle: 'About', process_subtitle: 'Our Story', process_title: 'How Palama Began', features_subtitle: 'Values' },
  { path: '/company/charter', title: 'Our Charter', desc: 'The principles that guide our development and deployment.', subtitle: 'Charter', process_subtitle: 'Governance', process_title: 'How We Govern', features_subtitle: 'Principles' },
  { path: '/company/careers', title: 'Careers', desc: 'Help us build the execution layer of the internet.', subtitle: 'Careers', process_subtitle: 'Hiring', process_title: 'How We Hire', features_subtitle: 'Benefits' },
  { path: '/support/help', title: 'Help Center', desc: 'Support articles, troubleshooting, and FAQs.', subtitle: 'Support', process_subtitle: 'Support Model', process_title: 'How Support Works', features_subtitle: 'Resources' },
  { path: '/support/status', title: 'System Status', desc: 'Real-time uptime metrics for the Palama API.', subtitle: 'Status', process_subtitle: 'Monitoring', process_title: 'How We Monitor Systems', features_subtitle: 'Metrics' },
  // More
  { path: '/resources/academy', title: 'Palama Academy', desc: 'Learn how to prompt, orchestrate, and deploy agents.', subtitle: 'Academy', process_subtitle: 'Learning Path', process_title: 'How Academy Works', features_subtitle: 'Courses' },
  { path: '/resources/webcasts', title: 'Webcasts', desc: 'Live demos, architectural deep-dives, and Q&A sessions.', subtitle: 'Webcasts', process_subtitle: 'Content', process_title: 'How Webcasts Work', features_subtitle: 'Schedule' },
  { path: '/resources/podcast', title: 'Podcast', desc: 'Conversations with the researchers building the future.', subtitle: 'Podcast', process_subtitle: 'Episodes', process_title: 'How the Podcast Works', features_subtitle: 'Shows' },
  { path: '/legal/terms', title: 'Terms of Use', desc: 'Legal terms for using the Palama platform.', subtitle: 'Legal', process_subtitle: 'Legal Framework', process_title: 'How Terms Apply', features_subtitle: 'Policies' },
  { path: '/legal/privacy', title: 'Privacy Policy', desc: 'How we protect your data.', subtitle: 'Privacy', process_subtitle: 'Privacy Model', process_title: 'How We Protect Privacy', features_subtitle: 'Rights' },
  { path: '/legal/brand', title: 'Brand Guidelines', desc: 'Assets and rules for using the Palama brand.', subtitle: 'Brand', process_subtitle: 'Brand System', process_title: 'How the Brand Works', features_subtitle: 'Assets' },
];


function generateParagraphs(title, pathStr) {
  let categoryStr = "platform";
  if (pathStr.includes("research")) categoryStr = "research";
  if (pathStr.includes("safety")) categoryStr = "safety protocol";
  if (pathStr.includes("products")) categoryStr = "product offering";
  if (pathStr.includes("solutions")) categoryStr = "business solution";
  if (pathStr.includes("developers")) categoryStr = "developer tool";
  if (pathStr.includes("company")) categoryStr = "company initiative";

  const getDummyText = (count) => {
    const sentences = [
      `The architecture of ${title} fundamentally redefines how we approach ${categoryStr} by distributing workloads across a decentralized compute grid.`,
      `By isolating context streams in memory, ${title} guarantees sub-millisecond latency even under extreme load.`,
      `We evaluated ${title} against existing industry standards and observed a 300% improvement in throughput.`,
      `The integration of non-blocking I/O operations ensures that the core event loop of ${title} remains highly responsive.`,
      `Security is not an afterthought; ${title} encrypts all state transitions using AES-256-GCM at the hardware level.`,
      `Our proprietary tensor routing algorithm ensures that ${title} minimizes cross-node communication overhead.`,
      `Developers can leverage the extensible API of ${title} to seamlessly embed its capabilities into legacy systems.`,
      `With native support for edge deployments, ${title} pushes computation closer to the data source, slashing bandwidth costs.`,
      `The fault-tolerance mechanisms in ${title} automatically reroute execution paths if a localized node failure occurs.`,
      `Extensive benchmarking reveals that ${title} maintains deterministic execution times even when scaling horizontally to thousands of instances.`
    ];
    let result = "";
    for(let i=0; i<count; i++){
      result += sentences[Math.floor(Math.random() * sentences.length)] + " ";
    }
    return result;
  };

  return `
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px", color: "#a1a1aa", fontSize: "1.1rem", lineHeight: 1.8 }}>
      
      {/* Introduction */}
      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 48, fontWeight: 600, letterSpacing: "-0.02em" }}>Introduction to ${title}</h2>
      <p style={{ marginBottom: 24 }}>${getDummyText(6)}</p>
      <p style={{ marginBottom: 24 }}>${getDummyText(5)}</p>

      {/* Deep Dive 1 */}
      <div style={{ background: "#111", borderLeft: "4px solid #fff", padding: "24px 32px", margin: "40px 0", borderRadius: "0 8px 8px 0" }}>
        <h4 style={{ color: "#fff", margin: "0 0 12px 0", fontSize: "1.2rem", fontWeight: 500 }}>Key Architectural Insight</h4>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          "The true breakthrough of ${title} isn't just its raw processing power, but its ability to autonomously determine the optimal routing path for any given tensor calculation. It doesn't just compute; it reasons about *how* to compute."
        </p>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Core Capabilities & Mechanics</h2>
      <p style={{ marginBottom: 24 }}>${getDummyText(7)}</p>
      
      {/* List Section */}
      <ul style={{ marginBottom: 32, paddingLeft: 24 }}>
        <li style={{ marginBottom: 12 }}><strong>Deterministic Execution:</strong> ${getDummyText(2)}</li>
        <li style={{ marginBottom: 12 }}><strong>Infinite Context Window:</strong> ${getDummyText(2)}</li>
        <li style={{ marginBottom: 12 }}><strong>Real-time State Sync:</strong> ${getDummyText(2)}</li>
        <li style={{ marginBottom: 12 }}><strong>Autonomous Error Recovery:</strong> ${getDummyText(2)}</li>
      </ul>

      <p style={{ marginBottom: 24 }}>${getDummyText(5)}</p>

      {/* Code Block / Technical Details */}
      <div style={{ background: "#050505", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 24, margin: "48px 0", fontFamily: "monospace", fontSize: "0.9rem", color: "#4ade80", overflowX: "auto", whiteSpace: "pre-wrap" }}>
        <div style={{ color: "#888", marginBottom: 12 }}>// Initializing ${title} inside a secure sandbox</div>
        <code>
          const session = await Palama.createSession({"{"})<br/>
          {"  "}target: "${title}",<br/>
          {"  "}isolationLevel: "HARDWARE",<br/>
          {"  "}maxTokens: 1000000<br/>
          {"}"});<br/>
          <br/>
          const result = await session.execute(complexWorkload);<br/>
          console.log(result.metrics);
        </code>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Security & Compliance</h2>
      <p style={{ marginBottom: 24 }}>${getDummyText(6)}</p>
      <p style={{ marginBottom: 24 }}>${getDummyText(4)}</p>

      {/* Table Section */}
      <div style={{ margin: "48px 0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#111", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "16px 24px", color: "#fff", fontWeight: 500 }}>Metric</th>
              <th style={{ padding: "16px 24px", color: "#fff", fontWeight: 500 }}>${title} Value</th>
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
      <p style={{ marginBottom: 24 }}>${getDummyText(8)}</p>
      <p style={{ marginBottom: 24 }}>${getDummyText(5)}</p>

      {/* Quote */}
      <div style={{ textAlign: "center", margin: "64px 0" }}>
        <h3 style={{ fontSize: "1.5rem", color: "#fff", fontWeight: 400, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 16px 0" }}>
          "Implementing ${title} allowed us to scale our operations globally without hiring a single additional devops engineer."
        </h3>
        <span style={{ color: "#888", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>— Lead Architect at Global FinTech</span>
      </div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Future Roadmap</h2>
      <p style={{ marginBottom: 24 }}>${getDummyText(7)}</p>
      <p style={{ marginBottom: 24 }}>${getDummyText(6)}</p>
      
      <div style={{ height: 120 }}></div>
      
      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Advanced Integrations</h2>
      <p style={{ marginBottom: 24 }}>${getDummyText(8)}</p>
      <p style={{ marginBottom: 24 }}>${getDummyText(7)}</p>

      <div style={{ height: 120 }}></div>

      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 24, marginTop: 64, fontWeight: 600, letterSpacing: "-0.02em" }}>Conclusion</h2>
      <p style={{ marginBottom: 24 }}>${getDummyText(5)}</p>
      <p style={{ marginBottom: 24 }}>${getDummyText(8)}</p>

    </div>
  `;
}

function generateFAQs(title) {
  return `
    <div style={{ maxWidth: 800, margin: "100px auto 160px", padding: "0 24px" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 600, color: "#fff", marginBottom: 48, textAlign: "center", letterSpacing: "-0.02em" }}>
        Frequently Asked Questions
      </h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* FAQ Item 1 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>How does ${title} integrate with existing infrastructure?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            ${title} is designed to be fully modular. It connects via standard REST/GraphQL endpoints and supports native event streaming through Kafka and WebSockets. For enterprise deployments, we provide a dedicated VPC peering option to ensure zero-latency data transfer.
          </p>
        </BentoItem>

        {/* FAQ Item 2 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>What are the compliance and data residency guarantees?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Security is paramount. ${title} inherits our global compliance certifications, including SOC 2 Type II, ISO 27001, and HIPAA. Data can be pinned to specific geographic regions (e.g., EU-Central, US-East) to comply with local data sovereignty laws like GDPR and CCPA.
          </p>
        </BentoItem>

        {/* FAQ Item 3 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>Can ${title} be fine-tuned or customized?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Yes. Enterprise customers receive access to our orchestration dashboard, allowing you to define custom system prompts, inject proprietary vector knowledge bases (RAG), and adjust the safety boundaries specifically for ${title} workflows.
          </p>
        </BentoItem>

        {/* FAQ Item 4 */}
        <BentoItem className="w-full text-left">
          <h4 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 500, margin: "0 0 12px 0" }}>What is the pricing model?</h4>
          <p style={{ color: "#888", margin: 0, lineHeight: 1.6 }}>
            Usage is billed entirely on compute duration and token throughput. There are no seat licenses or hidden fees. We believe you should only pay for the exact amount of intelligence and execution ${title} consumes. Volume discounts trigger automatically at scale.
          </p>
        </BentoItem>
      </div>
    </div>
  `;
}

const template = (title, desc, subtitle, process_subtitle, process_title, features_subtitle, pathStr) => `"use client";
import { motion } from "framer-motion";
import { Navigation } from "@/app/components/ui/Navigation";
import { Features } from "@/app/components/ui/features-2";
import { BentoItem } from "@/app/components/ui/cybernetic-bento-grid";
export default function Page() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section style={{ paddingTop: "calc(var(--nav-height) + 120px)", paddingBottom: 100 }}>
        <div className="page-container" style={{ maxWidth: 960 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ marginBottom: 12 }}
          >
            <span style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>
              ${subtitle}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05 }}
            style={{ maxWidth: 800 }}
          >
            ${title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 }}
            style={{ fontSize: "var(--text-xl)", color: "#a1a1aa", margin: "24px 0 48px", maxWidth: 600, lineHeight: 1.7 }}
          >
            ${desc}
          </motion.p>
        </div>
      </section>

      {/* Bento Feature Block */}
      <section style={{ background: "#080808", paddingTop: 80, paddingBottom: 80, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="page-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <BentoItem>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>What is ${title}?</h3>
              <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem" }}>${desc}</p>
            </BentoItem>
            <BentoItem>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>Enterprise Ready</h3>
              <p style={{ color: "#888", lineHeight: 1.6, fontSize: "0.9rem" }}>Built for scale with SOC 2 compliance, dedicated infrastructure, and 99.9% uptime SLAs.</p>
            </BentoItem>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
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
        ${generateParagraphs(title, pathStr)}
      </section>


      {/* Deep Dive FAQs */}
      <section style={{ background: "#000" }}>
        ${generateFAQs(title)}
      </section>

      {/* Features */}
      <Features featuresSubtitle="${features_subtitle}" />
    </div>
  );
}
`;

const baseDir = path.join(__dirname, 'src', 'app');

pages.forEach(page => {
  const fullDirPath = path.join(baseDir, page.path);
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true });
  }
  const filePath = path.join(fullDirPath, 'page.tsx');
  fs.writeFileSync(filePath, template(
    page.title,
    page.desc,
    page.subtitle,
    page.process_subtitle,
    page.process_title,
    page.features_subtitle,
    page.path
  ));
  console.log("Upgraded " + filePath);
});
