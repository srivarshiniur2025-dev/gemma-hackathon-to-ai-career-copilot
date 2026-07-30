"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useHeroInteractionOptional } from "@/contexts/HeroInteractionContext";

type Node = {
  x: number;
  y: number;
  phase: number;
  speed: number;
  r: number;
};

type TrailDot = { x: number; y: number; born: number };

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function NavigationFieldCanvas({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hero = useHeroInteractionOptional();
  const nodesRef = useRef<Node[]>([]);
  const trailsRef = useRef<TrailDot[]>([]);
  const lastTrail = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawCtxRaw = canvas.getContext("2d");
    if (!drawCtxRaw) return;
    const drawCtx: CanvasRenderingContext2D = drawCtxRaw;

    const cvs = canvas;

    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = mobile ? 420 : 1100;
    let w = 0;
    let h = 0;
    let t = 0;
    let raf = 0;

    if (nodesRef.current.length === 0) {
      nodesRef.current = Array.from({ length: COUNT }, (_, i) => ({
        x: seededRandom(i * 1.7) * 1,
        y: seededRandom(i * 2.3 + 50) * 1,
        phase: seededRandom(i * 3.1) * Math.PI * 2,
        speed: 0.00008 + seededRandom(i * 4.7) * 0.00015,
        r: 0.4 + seededRandom(i * 5.9) * 1.2,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = cvs.clientWidth;
      h = cvs.clientHeight;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      raf = requestAnimationFrame(draw);
      t += 1;
      drawCtx.clearRect(0, 0, w, h);

      const mx = hero?.rawMouse.current.px ?? -9999;
      const my = hero?.rawMouse.current.py ?? -9999;
      const now = performance.now();

      /* Contour lines — slow morphing */
      drawCtx.strokeStyle = "rgba(24, 24, 27, 0.04)";
      drawCtx.lineWidth = 0.6;
      for (let c = 0; c < 5; c++) {
        drawCtx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const y =
            h * (0.15 + c * 0.16) +
            Math.sin(x * 0.004 + t * 0.0008 + c * 1.7) * 28 +
            Math.cos(x * 0.002 + t * 0.0005 + c) * 14;
          if (x === 0) drawCtx.moveTo(x, y);
          else drawCtx.lineTo(x, y);
        }
        drawCtx.stroke();
      }

      /* Radar sweeps — non-repeating intervals */
      for (let r = 0; r < 2; r++) {
        const cx = w * (0.25 + r * 0.5) + Math.sin(t * 0.0003 + r * 2.1) * 40;
        const cy = h * (0.35 + r * 0.2) + Math.cos(t * 0.00025 + r) * 30;
        const pulse = ((t * 0.4 + r * 800) % 2200) / 2200;
        const radius = pulse * Math.min(w, h) * 0.45;
        drawCtx.beginPath();
        drawCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        drawCtx.strokeStyle = `rgba(13, 148, 136, ${0.06 * (1 - pulse)})`;
        drawCtx.lineWidth = 0.75;
        drawCtx.stroke();
      }

      /* Scan line */
      const scanY = ((t * 0.15) % (h + 200)) - 100;
      drawCtx.fillStyle = "rgba(13, 148, 136, 0.025)";
      drawCtx.fillRect(0, scanY, w, 2);

      const nodes = nodesRef.current;
      const pxCoords: { x: number; y: number; i: number }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.phase += n.speed * 16;
        const px = (n.x + Math.sin(n.phase + i) * 0.012) * w;
        const py = (n.y + Math.cos(n.phase * 0.7 + i * 0.3) * 0.012) * h;
        pxCoords.push({ x: px, y: py, i });

        drawCtx.beginPath();
        drawCtx.arc(px, py, n.r, 0, Math.PI * 2);
        drawCtx.fillStyle = `rgba(24, 24, 27, ${0.06 + (i % 7) * 0.008})`;
        drawCtx.fill();
      }

      /* Neural connections — sparse */
      drawCtx.lineWidth = 0.4;
      for (let i = 0; i < pxCoords.length; i += mobile ? 4 : 2) {
        const a = pxCoords[i];
        for (let j = i + 1; j < Math.min(i + 8, pxCoords.length); j++) {
          const b = pxCoords[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 55) {
            drawCtx.strokeStyle = `rgba(24, 24, 27, ${0.04 * (1 - d / 55)})`;
            drawCtx.beginPath();
            drawCtx.moveTo(a.x, a.y);
            drawCtx.lineTo(b.x, b.y);
            drawCtx.stroke();
          }
        }
      }

      /* Mouse connections + wave */
      if (mx > 0 && my > 0) {
        if (now - lastTrail.current > 48) {
          lastTrail.current = now;
          trailsRef.current.push({ x: mx, y: my, born: now });
          if (trailsRef.current.length > 40) trailsRef.current.shift();
        }

        drawCtx.beginPath();
        drawCtx.arc(mx, my, 60, 0, Math.PI * 2);
        drawCtx.strokeStyle = "rgba(13, 148, 136, 0.08)";
        drawCtx.lineWidth = 1;
        drawCtx.stroke();

        for (const p of pxCoords) {
          const d = Math.hypot(p.x - mx, p.y - my);
          if (d < 100) {
            drawCtx.strokeStyle = `rgba(13, 148, 136, ${0.15 * (1 - d / 100)})`;
            drawCtx.beginPath();
            drawCtx.moveTo(mx, my);
            drawCtx.lineTo(p.x, p.y);
            drawCtx.stroke();
          }
        }
      }

      /* Cursor trail dots */
      trailsRef.current = trailsRef.current.filter((d) => now - d.born < 2800);
      for (const d of trailsRef.current) {
        const age = (now - d.born) / 2800;
        drawCtx.beginPath();
        drawCtx.arc(d.x, d.y, 2 * (1 - age), 0, Math.PI * 2);
        drawCtx.fillStyle = `rgba(13, 148, 136, ${0.35 * (1 - age)})`;
        drawCtx.fill();
      }

      /* Drifting particles */
      for (let p = 0; p < 12; p++) {
        const px = (seededRandom(p * 9.1 + Math.floor(t / 400)) * 0.8 + 0.1 + t * 0.00002 * (p + 1)) % 1 * w;
        const py = (seededRandom(p * 7.3) * 0.9 + Math.sin(t * 0.001 + p) * 0.05) * h;
        drawCtx.fillStyle = "rgba(13, 148, 136, 0.12)";
        drawCtx.fillRect(px, py, 1, 1);
      }
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduceMotion, hero]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
    />
  );
}
