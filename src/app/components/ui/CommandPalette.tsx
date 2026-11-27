"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const searchData = [
  { group: "Products", items: [{ label: "Palama Products", href: "/products" }, { label: "Download App", href: "/download" }] },
  { group: "Platform", items: [{ label: "Dashboard", href: "/dashboard" }, { label: "API Docs", href: "/developers/docs" }] },
  { group: "Company", items: [{ label: "About Palama", href: "/company/about" }, { label: "Newsroom", href: "/news" }, { label: "Contact Sales", href: "/contact/sales" }] },
  { group: "Resources", items: [{ label: "Use Cases", href: "/use-cases" }, { label: "Help Center", href: "/support/help" }] }
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("palama:open-search", handleOpenSearch);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("palama:open-search", handleOpenSearch);
    };
  }, []);

  const filteredData = query
    ? searchData
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0)
    : searchData;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", paddingLeft: 16, paddingRight: 16 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 600,
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
            }}
          >
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center" }}>
              <input
                autoFocus
                placeholder="Search PALAMA..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "1.1rem",
                  fontWeight: 500
                }}
              />
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontFamily: "monospace", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>ESC</div>
            </div>
            
            <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "16px 0" }}>
              {filteredData.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
                  No results found for "{query}"
                </div>
              ) : (
                filteredData.map((group) => (
                  <div key={group.group} style={{ marginBottom: 16 }}>
                    <div style={{ padding: "0 24px", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, fontWeight: 600 }}>
                      {group.group}
                    </div>
                    <div>
                      {group.items.map((item) => (
                        <div
                          key={item.label}
                          onClick={() => {
                            router.push(item.href);
                            setIsOpen(false);
                          }}
                          style={{
                            padding: "10px 24px",
                            color: "#fff",
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
