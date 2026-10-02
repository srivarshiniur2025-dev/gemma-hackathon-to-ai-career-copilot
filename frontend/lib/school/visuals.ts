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
