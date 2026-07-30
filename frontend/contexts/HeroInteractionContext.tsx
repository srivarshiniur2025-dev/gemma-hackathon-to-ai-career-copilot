"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

type HeroInteractionContextValue = {
  rawMouse: React.MutableRefObject<{ x: number; y: number; px: number; py: number }>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setLayerRef: (depth: number, el: HTMLElement | null) => void;
};

const HeroInteractionContext = createContext<HeroInteractionContextValue | null>(null);

const DEPTH_MULT: Record<number, number> = { 1: 0.15, 2: 0.35, 3: 0.55, 4: 0.75, 5: 1 };

function applyLayers(
  el: HTMLDivElement | null,
  layerRefs: Map<number, HTMLElement>,
  mx: number,
  my: number
) {
  if (!el) return;
  el.style.setProperty("--mx", String(mx));
  el.style.setProperty("--my", String(my));
  layerRefs.forEach((layer, depth) => {
    const m = DEPTH_MULT[depth] ?? 1;
    const tx = (mx - 0.5) * 12 * m;
    const ty = (my - 0.5) * 10 * m;
    const rx = (my - 0.5) * 0.5 * m;
    const ry = (mx - 0.5) * -0.5 * m;
    layer.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
}

export function HeroInteractionProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef(new Map<number, HTMLElement>());
  const rawMouse = useRef({ x: 0.5, y: 0.4, px: 0, py: 0 });

  const setLayerRef = useCallback((depth: number, el: HTMLElement | null) => {
    if (el) layerRefs.current.set(depth, el);
    else layerRefs.current.delete(depth);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = containerRef.current;
      if (!el || reduceMotion) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      rawMouse.current = { x: nx, y: ny, px: e.clientX - r.left, py: e.clientY - r.top };
      applyLayers(el, layerRefs.current, nx, ny);
    },
    [reduceMotion]
  );

  const onPointerLeave = useCallback(() => {
    rawMouse.current = { x: 0.5, y: 0.4, px: -9999, py: -9999 };
    applyLayers(containerRef.current, layerRefs.current, 0.5, 0.4);
  }, []);

  return (
    <HeroInteractionContext.Provider
      value={{ rawMouse, onPointerMove, onPointerLeave, containerRef, setLayerRef }}
    >
      <div
        ref={containerRef}
        className="hero-interaction-root relative"
        style={{ ["--mx" as string]: 0.5, ["--my" as string]: 0.4 }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {children}
      </div>
    </HeroInteractionContext.Provider>
  );
}

export function useHeroInteraction() {
  const ctx = useContext(HeroInteractionContext);
  if (!ctx) throw new Error("useHeroInteraction must be used within HeroInteractionProvider");
  return ctx;
}

export function useHeroInteractionOptional() {
  return useContext(HeroInteractionContext);
}

export function HeroParallaxLayer({
  depth,
  className,
  children,
}: {
  depth: 1 | 2 | 3 | 4 | 5;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useHeroInteractionOptional();
  return (
    <div
      ref={(el) => ctx?.setLayerRef(depth, el)}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
