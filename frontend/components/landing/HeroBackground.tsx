"use client";

import { motion } from "framer-motion";

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-[#2563EB]/8 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#8B5CF6]/6 blur-3xl"
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E4E4E7 1px, transparent 1px), linear-gradient(to bottom, #E4E4E7 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
        }}
      />
    </div>
  );
}
