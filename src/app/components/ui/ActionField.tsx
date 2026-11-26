"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ActionField() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDashboard = Boolean(pathname && pathname.startsWith("/dashboard"));

  useEffect(() => {
    if (isDashboard) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    const particles: { x: number; y: number; baseX: number; baseY: number; size: number }[] = [];
    const spacing = 40;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        particles.push({ x, y, baseX: x, baseY: y, size: 1.5 });
      }
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      
      particles.forEach((p) => {
        const dx = mouseX - p.baseX;
        const dy = mouseY - p.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Repel from mouse
        const maxDist = 150;
        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          p.x = p.baseX - (dx * force * 0.3);
          p.y = p.baseY - (dy * force * 0.3);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + (force * 0.3)})`;
        } else {
          // Spring back to base
          p.x += (p.baseX - p.x) * 0.1;
          p.y += (p.baseY - p.y) * 0.1;
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDashboard]);

  if (isDashboard) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
