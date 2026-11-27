import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isAdminUser } from "@/lib/security";
import AdminDashboardView from "@/app/AdminDashboardView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  return (
    <div
      style={
        {
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#000000",
          color: "#ffffff",
          "--bg-base": "#000000",
          "--bg-elevated": "#09090b",
          "--bg-surface": "#121215",
          "--border-subtle": "rgba(255, 255, 255, 0.09)",
          "--border-hover": "rgba(255, 255, 255, 0.24)",
          "--text-primary": "#ffffff",
          "--text-secondary": "#d4d4d8",
          "--text-muted": "#71717a",
          "--signal": "#ffffff",
        } as React.CSSProperties
      }
    >
      <header
        style={{
          height: 64,
          padding: "0 36px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#000000",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
            }}
          >
            <img src="/logo.png" alt="Palama" width={22} height={22} style={{ objectFit: "contain" }} />
            <span>PALAMA</span>
          </Link>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#71717a",
              borderLeft: "1px solid rgba(255,255,255,0.12)",
              paddingLeft: 14,
            }}
          >
            Admin Console
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "0.82rem", color: "#71717a" }}>{user.email}</span>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#e4e4e7",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      <AdminDashboardView />
    </div>
  );
}
