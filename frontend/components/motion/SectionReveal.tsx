"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type RevealVariant =
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "mask"
  | "scale"
  | "rotate-in";

const revealVariants: Record<RevealVariant, Variants> = {
  "slide-up": {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
  mask: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  },
  "rotate-in": {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

export function SectionReveal({
  children,
  variant = "slide-up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-72px" }}
      variants={revealVariants[variant]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionRevealStagger({
  children,
  className,
  stagger = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-72px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionRevealItem({
  children,
  className,
  variant = "slide-up",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <motion.div variants={revealVariants[variant]} className={className}>
      {children}
    </motion.div>
  );
}

export function LineDraw({
  className,
  direction = "horizontal",
}: {
  className?: string;
  direction?: "horizontal" | "vertical";
}) {
  const isHorizontal = direction === "horizontal";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={cn(
        "bg-accent/40",
        isHorizontal ? "h-px w-full origin-left" : "w-px origin-top",
        className
      )}
      variants={{
        hidden: { scaleX: isHorizontal ? 0 : 1, scaleY: isHorizontal ? 1 : 0 },
        visible: {
          scaleX: 1,
          scaleY: 1,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    />
  );
}

export function ProgressIndicator({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-full bg-background-secondary", className)}>
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </div>
  );
}
