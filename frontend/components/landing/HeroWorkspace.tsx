"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { BarChart3, Briefcase, FileText, Map, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const workspaceCards = [
  {
    id: "readiness",
    title: "Career Readiness Score",
    icon: Target,
    metric: "87",
    unit: "/100",
    detail: "Strong foundation",
    position: "top-[4%] left-[2%] lg:left-[0%]",
    width: "w-[52%]",
  },
  {
    id: "skills",
    title: "Skill Assessment",
    icon: BarChart3,
    metric: "12",
    unit: " skills",
    detail: "3 gaps identified",
    position: "top-[2%] right-[0%]",
    width: "w-[46%]",
  },
  {
    id: "resume",
    title: "Resume Quality",
    icon: FileText,
    metric: "92",
    unit: "% ATS",
    detail: "2 suggestions",
    position: "top-[38%] left-[6%]",
    width: "w-[44%]",
  },
  {
    id: "internship",
    title: "Internship Match",
    icon: Briefcase,
    metric: "24",
    unit: " roles",
    detail: "Top: Product Intern",
    position: "top-[36%] right-[2%]",
    width: "w-[48%]",
  },
  {
    id: "roadmap",
    title: "AI Roadmap",
    icon: Map,
    metric: "6",
    unit: " milestones",
    detail: "Week 3 in progress",
    position: "bottom-[6%] left-[18%]",
    width: "w-[64%]",
  },
];

function WorkspaceCard({
  card,
  index,
}: {
  card: (typeof workspaceCards)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { stiffness: 280, damping: 28 });
  const rotateY = useSpring(0, { stiffness: 280, damping: 28 });
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${spotlightX}px ${spotlightY}px, rgba(13,148,136,0.08), transparent 70%)`;

  const Icon = card.icon;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateY.set(((x - centerX) / centerX) * 2.5);
    rotateX.set(((centerY - y) / centerY) * 2.5);
    spotlightX.set(x);
    spotlightY.set(y);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, scale: 0.96, rotate: index % 2 === 0 ? 1.5 : -1.5 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.65,
        delay: 0.35 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "absolute rounded-[14px] border border-border bg-white/95 backdrop-blur-sm card-shadow",
        card.position,
        card.width
      )}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
        <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
        <span className="h-2 w-2 rounded-full bg-[#28C840]" />
        <span className="ml-2 truncate text-[10px] font-medium text-muted">{card.title}</span>
      </div>

      <div className="flex items-center justify-between px-4 py-3.5">
        <div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-heading text-2xl font-bold text-foreground-heading">{card.metric}</span>
            <span className="text-xs text-muted">{card.unit}</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted">{card.detail}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-background-secondary">
          <Icon className="h-4 w-4 text-accent" />
        </div>
      </div>
    </motion.div>
  );
}

export function HeroWorkspace() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-lg">
      <div className="absolute inset-4 rounded-[20px] border border-border/50 bg-background-secondary/40" />
      <div className="relative h-full w-full">
        {workspaceCards.map((card, i) => (
          <WorkspaceCard key={card.id} card={card} index={i} />
        ))}
      </div>
    </div>
  );
}
