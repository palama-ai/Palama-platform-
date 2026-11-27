import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/ui/Navigation";
import Footer from "./components/ui/Footer";
import CommandPalette from "./components/ui/CommandPalette";
import ActionField from "./components/ui/ActionField";
import { ScrollToTop } from "./components/ui/scroll-to-top";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Palama — AI That Acts",
  description: "Palama is a new kind of AI that doesn't just think—it controls a real computer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white" style={{ background: "#000", color: "#fff", margin: 0 }}>
        <ScrollToTop />
        <ActionField />
        <CommandPalette />
        <Navigation />
        <main style={{ flex: 1, position: "relative", zIndex: 10 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
