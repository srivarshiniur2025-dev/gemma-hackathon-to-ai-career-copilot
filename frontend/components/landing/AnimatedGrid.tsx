"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  connected: boolean;
}

export function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvasNode = canvasRef.current;
    if (!canvasNode) return;
    const canvas: HTMLCanvasElement = canvasNode;

    const drawCtxRaw = canvas.getContext("2d");
    if (!drawCtxRaw) return;
    const drawCtx: CanvasRenderingContext2D = drawCtxRaw;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationId = 0;
    let nodes: Node[] = [];
    let lastSpawn = 0;
    const GRID = 48;
    const SPAWN_INTERVAL = 3500;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnCluster() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = Math.random() * w * 0.6 + w * 0.2;
      const cy = Math.random() * h * 0.6 + h * 0.2;
      const count = 3 + Math.floor(Math.random() * 3);

      for (let i = 0; i < count; i++) {
        nodes.push({
          x: cx + (Math.random() - 0.5) * 120,
          y: cy + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          life: 0,
          maxLife: 180 + Math.random() * 120,
          connected: true,
        });
      }
    }

    function drawGrid(w: number, h: number, time: number) {
      drawCtx.strokeStyle = "rgba(228, 228, 231, 0.35)";
      drawCtx.lineWidth = 0.5;

      const offsetX = (time * 0.008) % GRID;
      const offsetY = (time * 0.005) % GRID;

      for (let x = -GRID + offsetX; x < w + GRID; x += GRID) {
        drawCtx.beginPath();
        drawCtx.moveTo(x, 0);
        drawCtx.lineTo(x, h);
        drawCtx.stroke();
      }
      for (let y = -GRID + offsetY; y < h + GRID; y += GRID) {
        drawCtx.beginPath();
        drawCtx.moveTo(0, y);
        drawCtx.lineTo(w, y);
        drawCtx.stroke();
      }
    }

    function draw(time: number) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      drawCtx.clearRect(0, 0, w, h);

      drawGrid(w, h, time);

      if (time - lastSpawn > SPAWN_INTERVAL) {
        spawnCluster();
        lastSpawn = time;
      }

      nodes = nodes.filter((n) => n.life < n.maxLife);

      for (const node of nodes) {
        node.life++;
        node.x += node.vx;
        node.y += node.vy;

        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.15;
          node.x -= (dx / dist) * force;
          node.y -= (dy / dist) * force;
        }

        const alpha = node.life < 30
          ? node.life / 30
          : node.life > node.maxLife - 40
            ? (node.maxLife - node.life) / 40
            : 1;

        drawCtx.beginPath();
        drawCtx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        drawCtx.fillStyle = `rgba(13, 148, 136, ${alpha * 0.35})`;
        drawCtx.fill();
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && a.connected && b.connected) {
            const alphaA = a.life < 30 ? a.life / 30 : a.life > a.maxLife - 40 ? (a.maxLife - a.life) / 40 : 1;
            const alphaB = b.life < 30 ? b.life / 30 : b.life > b.maxLife - 40 ? (b.maxLife - b.life) / 40 : 1;
            drawCtx.beginPath();
            drawCtx.moveTo(a.x, a.y);
            drawCtx.lineTo(b.x, b.y);
            drawCtx.strokeStyle = `rgba(13, 148, 136, ${Math.min(alphaA, alphaB) * 0.2})`;
            drawCtx.lineWidth = 0.75;
            drawCtx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    resize();
    spawnCluster();
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0 -z-10 h-full w-full opacity-60"
      aria-hidden
    />
  );
}
