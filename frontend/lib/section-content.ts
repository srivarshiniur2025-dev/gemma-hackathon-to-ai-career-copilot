export type SkillCard = {
  id: string;
  name: string;
  icon: string;
  percent: number;
  current: string;
  industry: string;
  gap: string;
  confidence: number;
  learning: string;
  scatter: { x: number; y: number; r: number };
};

export const ASSESSMENT_SKILLS: SkillCard[] = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    percent: 78,
    current: "Intermediate",
    industry: "Advanced",
    gap: "Async · Testing",
    confidence: 82,
    learning: "FastAPI patterns",
    scatter: { x: -48, y: -36, r: -11 },
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    percent: 62,
    current: "Beginner+",
    industry: "Intermediate",
    gap: "Spring · JVM",
    confidence: 68,
    learning: "OOP deep dive",
    scatter: { x: 90, y: -52, r: 9 },
  },
  {
    id: "ai",
    name: "AI",
    icon: "🧠",
    percent: 71,
    current: "Intermediate",
    industry: "Advanced",
    gap: "Fine-tuning",
    confidence: 74,
    learning: "RAG pipelines",
    scatter: { x: 140, y: 20, r: -6 },
  },
  {
    id: "sql",
    name: "SQL",
    icon: "🗄️",
    percent: 85,
    current: "Advanced",
    industry: "Advanced",
    gap: "Window fn",
    confidence: 88,
    learning: "Query optimization",
    scatter: { x: -70, y: 48, r: 14 },
  },
  {
    id: "comm",
    name: "Communication",
    icon: "💬",
    percent: 69,
    current: "Intermediate",
    industry: "Advanced",
    gap: "Technical writing",
    confidence: 71,
    learning: "STAR method",
    scatter: { x: 40, y: 70, r: -8 },
  },
  {
    id: "dsa",
    name: "DSA",
    icon: "⚡",
    percent: 55,
    current: "Beginner+",
    industry: "Advanced",
    gap: "Graphs · DP",
    confidence: 58,
    learning: "Blind 75 track",
    scatter: { x: 110, y: 90, r: 7 },
  },
];

export const ROADMAP_STEPS = [
  { id: "r1", title: "Skill baseline", duration: "Week 1", status: "done" as const, desc: "Gemma maps your starting proficiency across 12 domains." },
  { id: "r2", title: "Python mastery", duration: "Weeks 2–4", status: "active" as const, desc: "Async, testing, and production patterns for backend roles." },
  { id: "r3", title: "DSA sprint", duration: "Weeks 5–7", status: "upcoming" as const, desc: "Targeted problem sets aligned to your interview timeline." },
  { id: "r4", title: "System design", duration: "Week 8", status: "upcoming" as const, desc: "Architecture fundamentals for mid-level SDE interviews." },
  { id: "r5", title: "Portfolio push", duration: "Weeks 9–10", status: "upcoming" as const, desc: "Ship two projects that close your identified skill gaps." },
];

export const PROJECT_CARDS = [
  { id: "p1", title: "AI Resume Parser", stack: "Python · Gemma · FastAPI", impact: "94% ATS match", color: "#0D9488" },
  { id: "p2", title: "Career Path API", stack: "Next.js · MongoDB", impact: "12K requests/mo", color: "#18181B" },
  { id: "p3", title: "Skill Radar Dashboard", stack: "React · Recharts", impact: "Featured project", color: "#27272A" },
  { id: "p4", title: "Mock Interview Bot", stack: "WebSocket · Gemma 4", impact: "4.9★ feedback", color: "#0D9488" },
];

export const INTERVIEW_FLOW = [
  { q: "Tell me about a time you solved a complex technical problem.", score: 87, confidence: 82 },
  { q: "How would you design a rate-limited API?", score: 79, confidence: 74 },
  { q: "Explain your approach to debugging production issues.", score: 91, confidence: 88 },
];

export const INTERNSHIP_CARDS = [
  { company: "Stripe", role: "Backend Intern", match: 94, salary: "$8.2K/mo", location: "SF · Remote", skills: ["Python", "API", "SQL"], reason: "Strong Python + SQL alignment. Gemma verified role authenticity." },
  { company: "Linear", role: "Product Eng Intern", match: 89, salary: "$7.5K/mo", location: "Remote", skills: ["TypeScript", "React"], reason: "Portfolio projects match their design-engineering bar." },
  { company: "Vercel", role: "DX Intern", match: 86, salary: "$7K/mo", location: "NYC", skills: ["Next.js", "Docs"], reason: "Your open-source contributions signal strong DX instincts." },
];

export const DASHBOARD_METRICS = {
  streak: 14,
  readiness: 78,
  skillsTracked: 24,
  interviews: 6,
  radar: [
    { skill: "Python", value: 78 },
    { skill: "DSA", value: 55 },
    { skill: "AI", value: 71 },
    { skill: "SQL", value: 85 },
    { skill: "Comm", value: 69 },
  ],
  weekly: [42, 58, 65, 72, 68, 78, 82],
};
