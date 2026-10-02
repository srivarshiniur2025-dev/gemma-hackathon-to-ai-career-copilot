import type { SchoolSubject } from "./syllabus";

export type ChapterArtKey =
  | "inquiry"
  | "cell"
  | "body"
  | "motion"
  | "chemistry"
  | "atom"
  | "sound"
  | "genetics"
  | "earth"
  | "light"
  | "electricity"
  | "graphs"
  | "numbers"
  | "geometry"
  | "trigonometry"
  | "mensuration"
  | "probability";

const ART_BY_CHAPTER: Record<string, ChapterArtKey> = {
  "s9-exploration": "inquiry",
  "s9-cell": "cell",
  "s9-tissues": "body",
  "s9-motion": "motion",
  "s9-mixtures": "chemistry",
  "s9-forces": "motion",
  "s9-work": "motion",
  "s9-atom": "atom",
  "s9-matter": "atom",
  "s9-sound": "sound",
  "s9-reproduction": "genetics",
  "s9-diversity": "earth",
  "s9-earth": "earth",
  "s10-reactions": "chemistry",
  "s10-acids": "chemistry",
  "s10-metals": "chemistry",
  "s10-carbon": "atom",
  "s10-periodic": "atom",
  "s10-life": "cell",
  "s10-control": "body",
  "s10-repro": "genetics",
  "s10-heredity": "genetics",
  "s10-light": "light",
  "s10-eye": "light",
  "s10-electricity": "electricity",
  "s10-magnetic": "electricity",
  "s10-environment": "earth",
  "m9-coordinates": "graphs",
  "m9-linear-poly": "graphs",
  "m9-numbers": "numbers",
  "m9-identities": "numbers",
  "m9-circles": "geometry",
  "m9-area": "mensuration",
  "m9-probability": "probability",
  "m9-sequences": "numbers",
  "m10-real": "numbers",
  "m10-poly": "graphs",
  "m10-linear": "graphs",
  "m10-quadratic": "graphs",
  "m10-ap": "numbers",
  "m10-coord": "graphs",
  "m10-triangles": "geometry",
  "m10-circles": "geometry",
  "m10-trig": "trigonometry",
  "m10-heights": "trigonometry",
  "m10-areas": "mensuration",
  "m10-surface": "mensuration",
  "m10-stats": "probability",
  "m10-prob": "probability",
};

export function chapterArt(chapterId: string, subject: SchoolSubject = "science"): string {
  const key = ART_BY_CHAPTER[chapterId] ?? (subject === "maths" ? "graphs" : "inquiry");
  return `/school/ch-${key}.webp`;
}

export function heroArt(subject: SchoolSubject): string {
  return subject === "maths" ? "/school/hero-maths.webp" : "/school/hero-science.webp";
}

export function trackHeroArt(track: "neet" | "high_school" | "developer"): string {
  if (track === "neet") return "/school/hero-neet.webp";
  if (track === "high_school") return "/school/hero-boards.webp";
  return "/school/hero-developer.webp";
}

const TOPIC_KEYWORDS: [RegExp, ChapterArtKey][] = [
  [/genetic|inherit|biotech|reproduc|heredity/, "genetics"],
  [/cell|photosynth|respiration|plant/, "cell"],
  [/human|physio|breath|endocrine|anatomy|digest|neural|body/, "body"],
  [/ecolog|environment|diversity|living world|population|conservation/, "earth"],
  [/optic|light|ray/, "light"],
  [/electr|magnet|current/, "electricity"],
  [/wave|sound|oscillat|shm/, "sound"],
  [/mechanic|kinemat|motion|force|gravit|work|laws/, "motion"],
  [/atom|nucle|modern|periodic|organic|carbon|bond/, "atom"],
  [/chem|mole|thermo|equilib|kinetic|solution|redox|acid|block|coordination|reaction/, "chemistry"],
  [/trig|height/, "trigonometry"],
  [/probab|statist/, "probability"],
  [/geometr|triangle|circle/, "geometry"],
  [/graph|coordinate|polynom|linear|quadratic|calculus|function/, "graphs"],
  [/number|sequence|progression|algebra/, "numbers"],
];

const SUBJECT_FALLBACK: Record<string, ChapterArtKey> = {
  physics: "motion",
  chemistry: "chemistry",
  biology: "cell",
  pcb: "atom",
  science: "inquiry",
  math: "graphs",
  maths: "graphs",
};

/** Best-matching chapter illustration for a free-text test title (NEET / board mocks). */
export function topicArt(text: string, subject: string, kind?: string): string {
  const t = text.toLowerCase();
  const match = TOPIC_KEYWORDS.find(([re]) => re.test(t))?.[1];
  const key = match ?? (kind === "pyq" ? "inquiry" : SUBJECT_FALLBACK[subject] ?? "inquiry");
  return `/school/ch-${key}.webp`;
}

export function skillArt(domain: string): string {
  return domain === "mixed" ? "/school/dev-system-design.webp" : `/school/dev-${domain}.webp`;
}
