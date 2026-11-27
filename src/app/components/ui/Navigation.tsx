"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RandomLetterSwap } from "./random-letter-swap";
import { createClient } from "@/utils/supabase/client";
import { LayoutDashboard, Laptop, Cpu, LogOut, ChevronDown, Menu, X, Search } from "lucide-react";

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
        { label: "Company Overview", href: "/company" },
      ]
    },
    subGroup: {
      title: "Resources",
      links: [
        { label: "Newsroom", href: "/news" },
        { label: "Help Center", href: "/support/help" },
        { label: "Contact Sales", href: "/contact/sales" },
      ]
    }
  }
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>("Products");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", esc);
    };
  }, [mobileMenuOpen]);

  // Logged-in users get an account nav
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
    setMobileMenuOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    window.location.href = "/";
  };

  const openSearch = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event("palama:open-search"));
  };

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
  const activeItem = navStructure.find(n => n.label === activeDropdown);
  const isAccountArea = pathname.startsWith("/platform") || pathname.startsWith("/dashboard");
  const showMarketingNav = !accountEmail || !isAccountArea;
  const isLightHeroNav = pathname === "/" && !scrolled && !activeDropdown && !mobileMenuOpen;

  if (pathname && (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding") || pathname.startsWith("/auth") || pathname.startsWith("/admin"))) {
    return null;
  }

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled || activeDropdown || mobileMenuOpen ? "#000" : "transparent",
          borderBottom: scrolled || activeDropdown || mobileMenuOpen
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : isLightHeroNav
              ? "1px solid rgba(10, 10, 12, 0.06)"
              : "1px solid transparent",
          transition: "background 0.25s, border-color 0.25s, color 0.25s",
        }}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "var(--nav-height)", gap: 12 }}>

          {/* Left Side: Logo + Desktop Main Nav */}
          <div className="nav-left-wrap" style={{ display: "flex", alignItems: "center", gap: 48, height: "100%", minWidth: 0 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: isLightHeroNav ? "#0d0d10" : "#fff",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "color 0.25s",
                minWidth: 0,
                flexShrink: 0,
              }}
            >
              <img src={isLightHeroNav ? "/logo-light.png" : "/logo.png"} alt="Palama" width={28} height={28} style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
              <span className="nav-brand-wordmark" style={{ fontWeight: 600, letterSpacing: "-0.02em", fontSize: "clamp(1.02rem, 3vw, 1.2rem)", whiteSpace: "nowrap" }}>
                PALAMA{logoSuffix && <span style={{ fontWeight: 400, marginLeft: 7, color: isLightHeroNav ? "rgba(13,13,16,0.65)" : "rgba(255,255,255,0.7)" }}>{logoSuffix}</span>}
              </span>
            </Link>

            <nav className="nav-desktop-only" style={{ display: "flex", gap: 12, alignItems: "center", height: "100%" }}>
              {showMarketingNav && navStructure.map((item) => (
                <div
                  key={item.label}
                  style={{ height: "100%", display: "flex", alignItems: "center" }}
                  onMouseEnter={() => setActiveDropdown(item.label)}
                >
                  <Link
                    href={item.href}
                    style={{
                      color: isLightHeroNav
                        ? (activeDropdown === item.label ? "#0d0d10" : "rgba(13, 13, 16, 0.68)")
                        : (activeDropdown === item.label ? "#fff" : "rgba(255, 255, 255, 0.7)"),
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      display: "block",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = isLightHeroNav ? "#0d0d10" : "#fff")}
                    onMouseLeave={(e) => {
                      if (activeDropdown !== item.label) {
                        e.currentTarget.style.color = isLightHeroNav ? "rgba(13, 13, 16, 0.68)" : "rgba(255, 255, 255, 0.7)";
                      }
                    }}
                  >
                    <RandomLetterSwap label={item.label} style={{ padding: "8px 12px", display: "inline-block" }} />
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Right Side (Desktop): Search + Account / CTA */}
          {pathname !== "/dashboard" && (
            <div className="nav-desktop-only" style={{ display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }}>
              <button
                type="button"
                onClick={openSearch}
                style={{
                  background: "none",
                  border: "none",
                  color: isLightHeroNav ? "rgba(13, 13, 16, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  padding: 6,
                }}
                aria-label="Search Palama"
                title="Search (Ctrl+K)"
              >
                <Search size={16} />
              </button>
              {accountEmail ? (
                <div id="palama-account-menu" style={{ position: "relative" }}>
                  <button
                    onClick={() => setAccountMenuOpen((o) => !o)}
                    title={accountEmail}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: isLightHeroNav ? "#0d0d10" : "#fff",
                      background: "transparent",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      fontFamily: "inherit",
                      border: isLightHeroNav ? "1px solid rgba(13,13,16,0.16)" : "1px solid rgba(255,255,255,0.15)",
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
                        background: isLightHeroNav ? "rgba(13,13,16,0.08)" : "rgba(255,255,255,0.12)",
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
                        color: isLightHeroNav ? "rgba(13,13,16,0.6)" : "rgba(255,255,255,0.6)",
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
                      color: isLightHeroNav ? "rgba(13, 13, 16, 0.72)" : "rgba(255, 255, 255, 0.7)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/signup"
                    style={{
                      color: isLightHeroNav ? "#fff" : "#000",
                      background: isLightHeroNav ? "#0d0d10" : "#fff",
                      padding: "8px 16px",
                      borderRadius: 24,
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      transition: "transform 0.2s ease, opacity 0.2s ease, background 0.25s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Right Side (Mobile < 880px): Compact Search + Hamburger */}
          {pathname !== "/dashboard" && (
            <div className="nav-mobile-actions" style={{ display: "none", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search Palama"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "transparent",
                  border: "none",
                  color: isLightHeroNav ? "#0d0d10" : "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: isLightHeroNav ? "rgba(13,13,16,0.06)" : "rgba(255,255,255,0.08)",
                  border: isLightHeroNav ? "1px solid rgba(13,13,16,0.12)" : "1px solid rgba(255,255,255,0.12)",
                  color: isLightHeroNav ? "#0d0d10" : "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          )}
        </div>

        {/* Desktop Dropdown Megamenu */}
        <AnimatePresence>
          {activeItem && !mobileMenuOpen && (
            <motion.div
              className="nav-desktop-only"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                overflow: "hidden",
                background: "#000",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="page-container" style={{ padding: "48px 24px 64px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 80, maxWidth: 1000 }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 500, marginBottom: 24 }}>
                      {activeItem.mainGroup.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {activeItem.mainGroup.links.map((sub, i) => (
                        <Link
                          key={i}
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          style={{
                            textDecoration: "none",
                            color: "#fff",
                            fontSize: "2rem",
                            fontWeight: 500,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.2,
                            display: "inline-flex",
                            alignItems: "center",
                            transition: "color 0.2s",
                          }}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 500, marginBottom: 24 }}>
                      {activeItem.subGroup.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {activeItem.subGroup.links.map((sub, i) => (
                        <Link
                          key={i}
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          style={{
                            textDecoration: "none",
                            color: "#fff",
                            fontSize: "0.95rem",
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            transition: "color 0.2s",
                          }}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Full-Height Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="nav-mobile-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: "var(--nav-height)",
              left: 0,
              right: 0,
              bottom: 0,
              background: "#08080a",
              zIndex: 99,
              overflowY: "auto",
              padding: "20px 20px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 28,
            }}
          >
            <div>
              {showMarketingNav && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {navStructure.map((item) => {
                    const expanded = mobileExpanded === item.label;
                    return (
                      <div key={item.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10, marginBottom: 6 }}>
                        <button
                          type="button"
                          onClick={() => setMobileExpanded(expanded ? null : item.label)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 4px",
                            background: "transparent",
                            border: "none",
                            color: "#fff",
                            fontSize: "1.15rem",
                            fontWeight: 600,
                            fontFamily: "inherit",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            size={18}
                            style={{
                              color: "rgba(255,255,255,0.6)",
                              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </button>
                        {expanded && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 6px 10px" }}>
                            {[...item.mainGroup.links, ...item.subGroup.links].map((sub) => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                  color: "rgba(255,255,255,0.78)",
                                  textDecoration: "none",
                                  fontSize: "0.98rem",
                                  padding: "6px 0",
                                }}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Drawer Auth / Account Footer */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {accountEmail ? (
                <>
                  <div style={{ fontSize: "0.84rem", color: "#a1a1aa", padding: "4px 2px", wordBreak: "break-all" }}>
                    Signed in as <strong style={{ color: "#fff" }}>{accountEmail}</strong>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px",
                        borderRadius: 12,
                        background: "#fff",
                        color: "#000",
                        fontWeight: 600,
                        fontSize: "0.92rem",
                        textDecoration: "none",
                      }}
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link
                      href="/dashboard/devices"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "0.92rem",
                        textDecoration: "none",
                      }}
                    >
                      <Laptop size={15} /> Devices
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 12,
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#f87171",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: 999,
                      background: "#fff",
                      color: "#000",
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: "0.96rem",
                      textDecoration: "none",
                    }}
                  >
                    Create account
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: 999,
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: 500,
                      fontSize: "0.96rem",
                      textDecoration: "none",
                    }}
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Blur Overlay (desktop dropdown) */}
      <AnimatePresence>
        {activeDropdown && !mobileMenuOpen && (
          <motion.div
            className="nav-desktop-only"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 880px) {
          .nav-desktop-only {
            display: none !important;
          }
          .nav-mobile-actions {
            display: flex !important;
          }
          .nav-left-wrap {
            gap: 12px !important;
          }
        }
      `}</style>
    </>
  );
}

export default Navigation;
