"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";

type CareerRouteContextValue = {
  progress: number;
  smoothProgress: ReturnType<typeof useSpring>;
  introComplete: boolean;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
};

const CareerRouteContext = createContext<CareerRouteContextValue | null>(null);

export function CareerRouteProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.5,
  });
  const [progress, setProgress] = useState(0);
  const [introComplete, setIntroComplete] = useState(!!reduceMotion);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useMotionValueEvent(smoothProgress, "change", (v) => {
    setProgress(v);
  });

  useEffect(() => {
    if (reduceMotion) {
      setIntroComplete(true);
      return;
    }
    const t = setTimeout(() => setIntroComplete(true), 2800);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  const setHovered = useCallback((id: string | null) => setHoveredId(id), []);

  return (
    <CareerRouteContext.Provider
      value={{
        progress,
        smoothProgress,
        introComplete,
        hoveredId,
        setHoveredId: setHovered,
      }}
    >
      {children}
    </CareerRouteContext.Provider>
  );
}

export function useCareerRoute() {
  const ctx = useContext(CareerRouteContext);
  if (!ctx) throw new Error("useCareerRoute must be used within CareerRouteProvider");
  return ctx;
}
