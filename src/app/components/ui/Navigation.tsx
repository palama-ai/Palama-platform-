"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RandomLetterSwap } from "./random-letter-swap";
import { createClient } from "@/utils/supabase/client";
import { LayoutDashboard, Laptop, Cpu, LogOut, ChevronDown } from "lucide-react";

type NavLink = { label: string; href: string; external?: boolean };
type NavGroup = { title: string; links: NavLink[] };
type NavItem = { label: string; href: string; mainGroup: NavGroup; subGroup: NavGroup };

const navStructure: NavItem[] = [
  {
    label: "Products",
    href: "/products",
    mainGroup: {
      title: "Explore Products",
      links: [
        { label: "Palama Co-Worker", href: "/download" },
        { label: "Palama Cloud", href: "/dashboard" },
      ]
    },
    subGroup: {
      title: "Get Started",
      links: [
        { label: "Download the App", href: "/download" },
        { label: "Join the Waitlist", href: "/dashboard" },
      ]
    }
  },
  {
    label: "Use Cases",
    href: "/use-cases",
    mainGroup: {
      title: "Explore Use Cases",
      links: [
        { label: "For Business", href: "/use-cases#business" },
        { label: "For Developers", href: "/use-cases#developers" },
        { label: "For Personal Use", href: "/use-cases#personal" },
      ]
    },
    subGroup: {
      title: "More",
      links: [
        { label: "For Teams", href: "/use-cases#teams" },
        { label: "All Use Cases", href: "/use-cases" },
      ]
    }
  },
  {
    label: "Company",
    href: "/company",
    mainGroup: {
      title: "Explore Company",
      links: [
        { label: "About Palama", href: "/company/about" },
        { label: "Our Charter", href: "/company/charter" },
        { label: "Careers", href: "/company/careers" },
      ]
    },
    subGroup: {
      title: "Resources",
      links: [
        { label: "Newsroom", href: "/news" },
        { label: "Security & Privacy", href: "/safety/security-privacy" },
        { label: "Trust & Transparency", href: "/safety/trust" },
      ]
    }
  }
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Logged-in users get an account nav (no marketing links, no CTA)
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setAccountEmail(data.session?.user?.email || null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setAccountEmail(session?.user?.email || null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Close the account menu on outside click / Escape
  useEffect(() => {
    if (!accountMenuOpen) return;
    const close = (e: MouseEvent) => {
      const el = document.getElementById("palama-account-menu");
      if (el && !el.contains(e.target as Node)) setAccountMenuOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [accountMenuOpen]);

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    window.location.href = "/";
  };

  const getLogoSuffix = () => {
    if (!pathname || pathname === "/") return "";
    if (pathname.startsWith("/products")) return "Products";
    if (pathname.startsWith("/platform")) return "Platform";
    if (pathname.startsWith("/use-cases")) return "Use Cases";
    if (pathname.startsWith("/developers")) return "Developers";
    if (pathname.startsWith("/company")) return "Company";
    if (pathname.startsWith("/news")) return "News";
    if (pathname.startsWith("/safety")) return "Safety";
    return "";
  };

  const logoSuffix = getLogoSuffix();
  const activeItem = navStructure.find(n => n.label === activeDropdown);
  // Marketing links stay on public pages; account areas (/platform, /dashboard)
  // show a clean header for logged-in users.
  const isAccountArea = pathname.startsWith("/platform") || pathname.startsWith("/dashboard");
  const showMarketingNav = !accountEmail || !isAccountArea;

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled || activeDropdown ? "#000" : "transparent",
          borderBottom: scrolled || activeDropdown ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s",
        }}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "var(--nav-height)" }}>
          
          {/* Left Side: Logo + Main Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 48, height: "100%" }}>
            <Link href="/" style={{ textDecoration: "none", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="Palama" width={28} height={28} style={{ objectFit: "contain", display: "block" }} />
              <span style={{ fontWeight: 600, letterSpacing: "-0.02em", fontSize: "1.2rem" }}>
                PALAMA{logoSuffix && <span style={{ fontWeight: 400, marginLeft: 8, color: "rgba(255,255,255,0.7)" }}>{logoSuffix}</span>}
              </span>
            </Link>
            
            <nav style={{ display: "flex", gap: 12, alignItems: "center", height: "100%" }}>
              {showMarketingNav && navStructure.map((item) => (
                <div 
                  key={item.label}
                  style={{ height: "100%", display: "flex", alignItems: "center" }}
                  onMouseEnter={() => setActiveDropdown(item.label)}
                >
                  <Link
                    href={item.href}
                    style={{
                      color: activeDropdown === item.label ? "#fff" : "rgba(255, 255, 255, 0.7)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      display: "block",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => {
                      if (activeDropdown !== item.label) e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    }}
                  >
                    <RandomLetterSwap label={item.label} style={{ padding: "8px 12px", display: "inline-block" }} />
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Right Side: Tools & CTA (hidden on /dashboard — the "..." menu covers it) */}
          {pathname !== "/dashboard" && (
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <button
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
              title="Search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            {accountEmail && pathname !== "/dashboard" ? (
              <div id="palama-account-menu" style={{ position: "relative" }}>
                <button
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  title={accountEmail}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#fff",
                    background: "transparent",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    fontFamily: "inherit",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 24,
                    padding: "6px 14px 6px 6px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {(accountEmail.trim().charAt(0) || "P").toUpperCase()}
                  </span>
                  <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {accountEmail}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      transition: "transform 0.2s",
                      transform: accountMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {accountMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 210,
                      background: "#111111",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 14,
                      boxShadow: "0 16px 36px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                      padding: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      zIndex: 200,
                    }}
                  >
                    <Link
                      href="/dashboard"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 8,
                        color: "rgba(255,255,255,0.88)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.88)";
                      }}
                    >
                      <LayoutDashboard size={15} style={{ color: "#9ca3af" }} />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/devices"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 8,
                        color: "rgba(255,255,255,0.88)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.88)";
                      }}
                    >
                      <Laptop size={15} style={{ color: "#9ca3af" }} />
                      <span>Devices</span>
                    </Link>

                    <Link
                      href="/dashboard/tokens"
                      onClick={() => setAccountMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 8,
                        color: "rgba(255,255,255,0.88)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.88)";
                      }}
                    >
                      <Cpu size={15} style={{ color: "#9ca3af" }} />
                      <span>Tokens & Quota</span>
                    </Link>

                    <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 6px" }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        color: "#f87171",
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#f87171";
                      }}
                    >
                      <LogOut size={15} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  Log in
                </Link>
                <a
                  href="https://app.palama.com"
                  style={{
                    color: "#000",
                    background: "#fff",
                    padding: "8px 16px",
                    borderRadius: 24,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Try Palama <span style={{ marginLeft: 4 }}>↗</span>
                </a>
              </>
            )}
          </div>
          )}
        </div>

        {/* Dropdown Megamenu */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                overflow: "hidden",
                background: "#000",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="page-container" style={{ padding: "48px 24px 64px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 80, maxWidth: 1000 }}>
                  
                  {/* Left Column: Main Links (Giant) */}
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 500, marginBottom: 24 }}>
                      {activeItem.mainGroup.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {activeItem.mainGroup.links.map((sub, i) => (
                        <Link 
                          key={i} 
                          href={sub.href}
                          style={{ 
                            textDecoration: "none", 
                            color: "#fff",
                            fontSize: "2rem",
                            fontWeight: 500,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.2,
                            display: "inline-flex",
                            alignItems: "center",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}
                        >
                          {sub.label}
                          {sub.external && <span style={{ fontSize: "1.1rem", marginLeft: 8, marginTop: 4 }}>↗</span>}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Sub Links (Small) */}
                  <div style={{ paddingTop: 0 }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 500, marginBottom: 24 }}>
                      {activeItem.subGroup.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {activeItem.subGroup.links.map((sub, i) => (
                        <Link 
                          key={i} 
                          href={sub.href}
                          style={{ 
                            textDecoration: "none", 
                            color: "#fff",
                            fontSize: "0.95rem",
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            transition: "color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}
                        >
                          {sub.label}
                          {sub.external && <span style={{ fontSize: "0.8rem", marginLeft: 6 }}>↗</span>}
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Page Blur Overlay */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              zIndex: 90,
              pointerEvents: "none"
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation;
