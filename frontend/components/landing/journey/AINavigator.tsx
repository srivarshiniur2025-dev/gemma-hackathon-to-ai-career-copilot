"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";

export function AINavigator({
  rotation = 0,
  idle = true,
}: {
  rotation?: number;
  idle?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const scanRef = useRef<SVGCircleElement>(null);
  const [recalcFlash, setRecalcFlash] = useState(false);

  useEffect(() => {
    if (reduceMotion || !idle) return;
    const interval = setInterval(() => {
      setRecalcFlash(true);
      setTimeout(() => setRecalcFlash(false), 1200);
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [reduceMotion, idle]);

  useEffect(() => {
    if (reduceMotion || !scanRef.current) return;
    gsap.to(scanRef.current, {
      rotate: 360,
      duration: 4,
      repeat: -1,
      ease: "none",
      transformOrigin: "18px 15px",
    });
  }, [reduceMotion]);

  return (
    <motion.div
      className="relative flex items-center justify-center"
      animate={
        reduceMotion || !idle
          ? { rotate: rotation }
          : {
              rotate: rotation,
              y: [0, -4, 0],
              scale: [1, 1.02, 1],
            }
      }
      transition={
        idle && !reduceMotion
          ? {
              y: { duration: 3.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] },
              scale: { duration: 2.8, repeat: Infinity, ease: [0.45, 0, 0.55, 1] },
              rotate: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            }
          : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {/* GPS ripple */}
      {idle && !reduceMotion && (
        <>
          <motion.span
            className="absolute left-1/2 top-[34%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0D9488]/25"
            animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="absolute left-1/2 top-[34%] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0D9488]/15"
            animate={{ scale: [1, 2.8], opacity: [0.2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          />
        </>
      )}

      {recalcFlash && (
        <motion.div
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.8 }}
          className="absolute inset-0 rounded-full border border-[#0D9488]/30"
        />
      )}

      <svg
        width="40"
        height="48"
        viewBox="0 0 36 44"
        fill="none"
        className="relative drop-shadow-[0_4px_24px_rgba(24,24,27,0.14)]"
        aria-hidden
      >
        <path
          d="M18 42C18 42 4 28 4 14.5C4 7.04 10.04 1 17.5 1C24.96 1 31 7.04 31 14.5C31 28 18 42 18 42Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1.25"
        />
        <circle cx="18" cy="15" r="9" stroke="#E4E4E7" strokeWidth="0.75" fill="#FAFAFA" />
        {/* Compass scan arc */}
        <circle
          ref={scanRef}
          cx="18"
          cy="15"
          r="9"
          fill="none"
          stroke="#0D9488"
          strokeWidth="0.5"
          strokeDasharray="8 48"
          opacity="0.5"
        />
        <path d="M18 8L19.5 14L18 12.5L16.5 14L18 8Z" fill="#18181B" />
        <path d="M18 22L16.5 16L18 17.5L19.5 16L18 22Z" fill="#A1A1AA" opacity="0.6" />
        <motion.circle
          cx="18"
          cy="15"
          r="3"
          fill="#0D9488"
          animate={idle && !reduceMotion ? { opacity: [0.85, 1, 0.85] } : undefined}
          transition={{ duration: 2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        />
        <circle cx="17" cy="14" r="1" fill="#FFFFFF" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
