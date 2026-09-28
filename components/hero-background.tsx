"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DIST = 130;
const MOUSE_DIST = 180;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Drifting violet gradient mesh + a faint "neural network" node field that
 * reaches toward the cursor. Pauses off-screen / in background tabs and renders
 * a single static frame under prefers-reduced-motion.
 */
export function HeroBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let inView = true;
    let rgb: [number, number, number] = [167, 139, 250];
    const mouse = { x: -9999, y: -9999 };

    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      if (v.startsWith("#")) rgb = hexToRgb(v);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(22, Math.min(80, Math.round((width * height) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.2 + 0.8,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const [r, g, b] = rgb;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        // Gentle pull toward the cursor.
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE_DIST && d > 1) {
          n.x += (dx / d) * 0.15;
          n.y += (dy / d) * 0.15;
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b2 = nodes[j];
          const d = Math.hypot(a.x - b2.x, a.y - b2.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - d / LINK_DIST) * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b2.x, b2.y);
            ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dm / MOUSE_DIST) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        const dm = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const boost = dm < MOUSE_DIST ? 1 - dm / MOUSE_DIST : 0;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.45 + boost * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + boost * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce || raf || !inView || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    readColor();
    resize();
    draw();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw();
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(wrap);

    const mo = new MutationObserver(() => {
      readColor();
      if (reduce) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="mesh-blob"
        style={{
          width: "55vw",
          height: "55vw",
          top: "-20%",
          right: "-10%",
          background: "radial-gradient(circle, #7c3aed 0%, transparent 65%)",
          animation: "drift-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="mesh-blob"
        style={{
          width: "45vw",
          height: "45vw",
          bottom: "-25%",
          left: "-15%",
          background: "radial-gradient(circle, #4c1d95 0%, transparent 65%)",
          animation: "drift-b 28s ease-in-out infinite",
        }}
      />
      <div
        className="mesh-blob"
        style={{
          width: "30vw",
          height: "30vw",
          top: "30%",
          left: "35%",
          background: "radial-gradient(circle, #a78bfa 0%, transparent 65%)",
          opacity: 0.25,
          animation: "drift-c 18s ease-in-out infinite",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
