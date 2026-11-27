"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const footerColumns = [
  {
    title: "Products",
    links: [
      { label: "Palama Co-Worker", href: "/download" },
      { label: "Palama Cloud", href: "/dashboard" },
    ]
  },
  {
    title: "Use Cases",
    links: [
      { label: "Overview", href: "/use-cases" },
      { label: "For Business", href: "/use-cases#business" },
      { label: "For Developers", href: "/use-cases#developers" },
      { label: "For Teams", href: "/use-cases#teams" },
      { label: "Contact Sales", href: "/contact/sales" },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About Palama", href: "/company/about" },
      { label: "Company Overview", href: "/company" },
      { label: "Newsroom", href: "/news" },
    ]
  },
  {
    title: "More",
    links: [
      { label: "Help Center", href: "/support/help" },
      { label: "Terms of Use", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
    ]
  }
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="palama-footer" style={{ position: "relative", zIndex: 10, background: "#000", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 64, paddingBottom: 36, marginTop: "auto" }}>
      <div className="page-container">

        <div className="palama-footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 40, marginBottom: 56 }}>
          {/* Giant Logo */}
          <div className="palama-footer-wordmark" style={{ gridColumn: "1 / -1", marginBottom: 24, width: "100%", display: "flex", justifyContent: "center", overflow: "hidden" }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", width: "100%", textAlign: "center" }}>
              <span
                style={{
                  fontFamily: "'Arial Black', 'Inter', sans-serif",
                  fontSize: "clamp(54px, 21vw, 340px)",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  background: "linear-gradient(to bottom, #4a4a50 0%, #1a1a20 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 0.85,
                  display: "block",
                  width: "100%",
                }}
              >
                Palama
              </span>
            </Link>
          </div>

          {/* Navigation Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 18 }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.9rem", textDecoration: "none", transition: "color 0.2s", display: "inline-block", padding: "2px 0" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.62)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Legal Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28, gap: 16 }}>
          <div style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} Palama. All rights reserved.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <Link href="/legal/privacy" style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/legal/terms" style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
              Terms of Use
            </Link>
            <Link href="/support/status" style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
              Status
            </Link>
          </div>
        </div>

      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .palama-footer {
            padding-top: 48px !important;
            padding-bottom: 28px !important;
          }
          .palama-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 28px 18px !important;
            margin-bottom: 40px !important;
          }
          .palama-footer-wordmark {
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </footer>
  );
}
