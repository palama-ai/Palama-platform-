"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const footerColumns = [
  {
    title: "Safety",
    links: [
      { label: "Safety Approach", href: "/safety/approach" },
      { label: "Deployment Safety", href: "/safety/deployment" },
      { label: "Security & Privacy", href: "/safety/security-privacy" },
      { label: "Trust & Transparency", href: "/safety/trust" },
    ]
  },
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
      { label: "Our Charter", href: "/company/charter" },
      { label: "Careers", href: "/company/careers" },
      { label: "Newsroom", href: "/news" },
    ]
  },
  {
    title: "More",
    links: [
      { label: "Academy", href: "/resources/academy" },
      { label: "Webcasts", href: "/resources/webcasts" },
      { label: "Podcast", href: "/resources/podcast" },
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

  const getLogoSuffix = () => {
    if (!pathname || pathname === "/") return "";
    if (pathname.startsWith("/products")) return "Products";
    if (pathname.startsWith("/platform")) return "Platform";
    if (pathname.startsWith("/use-cases")) return "Use Cases";
    if (pathname.startsWith("/developers")) return "Developers";
    if (pathname.startsWith("/company")) return "Company";
    if (pathname.startsWith("/news")) return "News";
    return "";
  };

  const logoSuffix = getLogoSuffix();

  return (
    <footer style={{ position: "relative", zIndex: 10, background: "#000", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 80, paddingBottom: 40, marginTop: "auto" }}>
      <div className="page-container">
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 64, marginBottom: 80 }}>
          {/* Giant Logo */}
          <div style={{ gridColumn: "1 / -1", marginBottom: 64, width: "100%", display: "flex", justifyContent: "center" }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", width: "100%", textAlign: "center" }}>
              <span 
                style={{
                  fontFamily: "'Arial Black', 'Inter', sans-serif",
                  fontSize: "clamp(80px, 25vw, 360px)", 
                  fontWeight: 900, 
                  letterSpacing: "-0.05em",
                  background: "linear-gradient(to bottom, #4a4a50 0%, #1a1a20 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 0.8,
                  display: "block",
                  width: "100%"
                }}
              >
                Palama
              </span>
            </Link>
          </div>

          {/* Navigation Columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 24 }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
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
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32, gap: 24 }}>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
            © {new Date().getFullYear()} Palama. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((item) => (
              <Link key={item} href="#" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                {item}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
