"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientLightSweep() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-1/4 top-0 h-full w-1/2 opacity-[0.035]"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.9) 50%, transparent 60%)",
        }}
        animate={{ x: ["-20%", "120%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -right-1/4 top-0 h-full w-1/3 opacity-[0.025]"
        style={{
          background:
            "linear-gradient(75deg, transparent 42%, rgba(13,148,136,0.15) 50%, transparent 58%)",
        }}
        animate={{ x: ["80%", "-100%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 4 }}
      />
    </div>
  );
}
