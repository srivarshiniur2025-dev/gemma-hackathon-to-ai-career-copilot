/** Hero illustration — route and milestone anchors (viewBox 480×520) */
export const HERO_VIEWBOX = { w: 480, h: 520 };

export const HERO_ROUTE_D =
  "M 72 452 C 115 415, 155 378, 200 358 C 245 328, 280 298, 292 262 C 305 228, 255 198, 172 182 C 138 168, 115 142, 138 108 C 168 82, 248 72, 338 66 C 378 62, 408 68, 408 82";

export const HERO_MILESTONES = [
  { id: "assessment", label: "Assessment", sub: "Know your starting point", icon: "clipboard" as const, x: 200, y: 358 },
  { id: "learning", label: "Learning", sub: "Build in-demand skills", icon: "book" as const, x: 292, y: 262 },
  { id: "projects", label: "Projects", sub: "Apply. Build. Showcase.", icon: "code" as const, x: 172, y: 182 },
  { id: "resume", label: "Resume", sub: "Craft your story", icon: "file" as const, x: 138, y: 108 },
  { id: "interview", label: "Interview", sub: "Practice. Improve. Ace.", icon: "mic" as const, x: 272, y: 86 },
  { id: "internship", label: "Internship", sub: "Land your opportunity", icon: "briefcase" as const, x: 408, y: 82 },
];

/** Navigator sits at route start */
export const HERO_NAVIGATOR = { x: 72, y: 452 };

export const HERO_METRICS = [
  { label: "AI Navigator", value: "Gemma 4 Powered", icon: "sparkles" as const },
  { label: "Route Accuracy", value: "98.7%", icon: "target" as const },
  { label: "Active Users", value: "12.4K+", icon: "users" as const },
  { label: "Offers Landed", value: "3.2K+", icon: "chart" as const },
];
