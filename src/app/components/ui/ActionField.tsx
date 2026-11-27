"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ActionField() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDashboard = Boolean(pathname && pathname.startsWith("/dashboard"));

  useEffect(() => {
    if (isDashboard) return;

    // Skip background canvas loop on mobile/touch or reduced-motion devices for 60fps scrolling & battery life
    const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarsePointer || reducedMotion || window.innerWidth < 768) return;

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
    let lastMoveAt = 0;

    type Particle = { x: number; y: number; baseX: number; baseY: number; size: number };
    let particles: Particle[] = [];

    const buildParticles = () => {
      particles = [];
      const spacing = 44;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          particles.push({ x, y, baseX: x, baseY: y, size: 1.5 });
        }
      }
    };
    buildParticles();

    let animationFrameId = 0;
    let running = false;

    const scheduleFrame = () => {
      if (!running && !document.hidden) {
        running = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      lastMoveAt = performance.now();
      scheduleFrame();
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      buildParticles();
      scheduleFrame();
    };

    const handleVisibility = () => {
      if (document.hidden && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        running = false;
      } else if (!document.hidden) {
        scheduleFrame();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    const render = () => {
      running = false;
      ctx.clearRect(0, 0, width, height);

      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      const maxDist = 150;
      const maxDistSq = maxDist * maxDist;
      const idle = performance.now() - lastMoveAt > 1800;
      let anyMoving = !idle;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = mouseX - p.baseX;
        const dy = mouseY - p.baseY;
        const distSq = dx * dx + dy * dy;

        if (!idle && distSq < maxDistSq) {
          const distance = Math.sqrt(distSq);
          const force = (maxDist - distance) / maxDist;
          p.x = p.baseX - dx * force * 0.3;
          p.y = p.baseY - dy * force * 0.3;
          ctx.fillStyle = `rgba(255, 255, 255, ${(0.08 + force * 0.3).toFixed(3)})`;
          anyMoving = true;
        } else {
          const rx = p.baseX - p.x;
          const ry = p.baseY - p.y;
          if (Math.abs(rx) > 0.25 || Math.abs(ry) > 0.25) {
            p.x += rx * 0.12;
            p.y += ry * 0.12;
            anyMoving = true;
          } else {
            p.x = p.baseX;
            p.y = p.baseY;
          }
          ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (anyMoving && !document.hidden) {
        running = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Draw initial static frame cleanly and pause until pointer interaction
    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
