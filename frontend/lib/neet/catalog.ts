import { ALL_CHAPTERS, NEET_CHAPTERS, SCHOOL_CHAPTERS, chapterById } from "@/lib/neet/syllabus";
import { FACTS } from "@/lib/neet/facts";
import type { Audience, MockKind, MockTestMeta, NeetMcq, NeetSubject } from "@/lib/neet/types";

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed || 1;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  const next = rng(hashString(seed));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rotateOptions(
  correct: string,
  distractors: [string, string, string],
  seed: string
): { options: [string, string, string, string]; answerIndex: 0 | 1 | 2 | 3 } {
  const raw = shuffle([correct, ...distractors], seed);
  const options = raw as [string, string, string, string];
  const answerIndex = options.indexOf(correct) as 0 | 1 | 2 | 3;
  return { options, answerIndex };
}

function chapterSubject(chapterId: string): NeetMcq["subject"] {
  return chapterById(chapterId)?.subject ?? "biology";
}

function stemsFor(topic: string, year: number | undefined, variant: 0 | 1 | 2): string {
  const pyq = year ? `NEET ${year} pattern — ` : "";
  if (variant === 0) return `${pyq}Which of the following is correct about ${topic}?`;
  if (variant === 1) return `${pyq}Identify the most accurate statement regarding ${topic}.`;
  return `${pyq}In NCERT-based NEET questions, ${topic} is:`;
}

export function expandFactBank(): NeetMcq[] {
  const out: NeetMcq[] = [];
  for (const fact of FACTS) {
    const years = fact.years;
    for (let v = 0; v < 3; v++) {
      const year = years[v % Math.max(years.length, 1)];
      const { options, answerIndex } = rotateOptions(fact.correct, fact.distractors, `${fact.chapterId}-${v}-${fact.topic}`);
      out.push({
        id: `${fact.chapterId}-v${v}-${hashString(fact.topic).toString(16)}`,
        chapterId: fact.chapterId,
        subject: chapterSubject(fact.chapterId),
        question: stemsFor(fact.topic, years.length ? year : undefined, v as 0 | 1 | 2),
        options,
        answerIndex,
        explanation: fact.why,
        years,
        source: years.length ? "pyq-style" : "ncert",
      });
    }
  }
  return out;
}

const BANK = expandFactBank();

function pick(pool: NeetMcq[], count: number, seed: string): NeetMcq[] {
  const uniqueTopic = new Map<string, NeetMcq>();
  for (const q of shuffle(pool, seed)) {
    if (!uniqueTopic.has(q.question) && uniqueTopic.size < count) uniqueTopic.set(q.id, q);
  }
  let chosen = [...uniqueTopic.values()];
  if (chosen.length < count) {
    const extras = shuffle(pool, seed + "-fill").filter((q) => !chosen.some((c) => c.id === q.id));
    chosen = [...chosen, ...extras].slice(0, count);
  }
  return chosen.slice(0, count).map((q, i) => ({
    ...q,
    id: `${q.id}-${seed}-${i}`,
  }));
}

function subjectPool(subject: NeetSubject | "science" | "math"): NeetMcq[] {
  return BANK.filter((q) => q.subject === subject);
}

export function questionsForTest(test: MockTestMeta): NeetMcq[] {
  const seed = test.id;
  if (test.kind === "chapter" && test.chapterId) {
    const own = BANK.filter((q) => q.chapterId === test.chapterId);
    const unit = chapterById(test.chapterId)?.unit;
    const sameUnit = BANK.filter((q) => chapterById(q.chapterId)?.unit === unit && q.subject === test.subject);
    const pool = own.length >= test.questionCount ? own : [...own, ...sameUnit, ...subjectPool(test.subject as NeetSubject)];
    return pick(pool, test.questionCount, seed);
  }
  if (test.kind === "pyq" && test.year) {
    const yearHits = BANK.filter((q) => q.years.includes(test.year!));
    const fill = BANK.filter((q) => q.source === "pyq-style");
    return pick(yearHits.length ? [...yearHits, ...fill] : fill, test.questionCount, seed);
  }
  if (test.subject === "pcb") {
    const phy = pick(subjectPool("physics"), Math.ceil(test.questionCount / 3), seed + "p");
    const chem = pick(subjectPool("chemistry"), Math.ceil(test.questionCount / 3), seed + "c");
    const bio = pick(subjectPool("biology"), test.questionCount - phy.length - chem.length, seed + "b");
    return shuffle([...phy, ...chem, ...bio], seed).slice(0, test.questionCount);
  }
  if (test.subject === "science") {
    return pick(BANK.filter((q) => q.subject === "science" || q.chapterId.startsWith("sch-")), test.questionCount, seed);
  }
  return pick(subjectPool(test.subject as NeetSubject), test.questionCount, seed);
}

function pushTest(
  list: MockTestMeta[],
  partial: Omit<MockTestMeta, "difficulty"> & { difficulty?: MockTestMeta["difficulty"] }
) {
  list.push({ difficulty: "mixed", ...partial });
}

export function buildMockCatalog(): MockTestMeta[] {
  const tests: MockTestMeta[] = [];

  for (const ch of NEET_CHAPTERS) {
    pushTest(tests, {
      id: `ch-${ch.id}`,
      title: ch.name,
      subtitle: `Class ${ch.classLevel} · ${ch.subject} chapter assessment`,
      subject: ch.subject,
      chapterId: ch.id,
      kind: "chapter",
      audience: "neet",
      durationMin: 15,
      questionCount: 10,
      difficulty: "medium",
    });
  }

  for (const ch of SCHOOL_CHAPTERS) {
    pushTest(tests, {
      id: `ch-${ch.id}`,
      title: ch.name,
      subtitle: `Class ${ch.classLevel} · chapter practice`,
      subject: ch.subject,
      chapterId: ch.id,
      kind: "chapter",
      audience: "school",
      durationMin: 12,
      questionCount: 8,
      difficulty: "easy",
    });
  }

  const sectionals: { id: string; title: string; subject: NeetSubject; subtitle: string }[] = [
    { id: "sec-phy-mech", title: "Physics sectional — Mechanics", subject: "physics", subtitle: "Kinematics to gravitation" },
    { id: "sec-phy-heat", title: "Physics sectional — Heat & waves", subject: "physics", subtitle: "Thermo, kinetic theory, SHM" },
    { id: "sec-phy-electro", title: "Physics sectional — Electro & magneto", subject: "physics", subtitle: "Class 12 core" },
    { id: "sec-phy-modern", title: "Physics sectional — Optics & modern", subject: "physics", subtitle: "High-yield modern physics" },
    { id: "sec-chem-phy", title: "Chemistry sectional — Physical", subject: "chemistry", subtitle: "Mole, thermo, equilibrium, kinetics" },
    { id: "sec-chem-inorg", title: "Chemistry sectional — Inorganic", subject: "chemistry", subtitle: "Periodic table, d-block, coordination" },
    { id: "sec-chem-org", title: "Chemistry sectional — Organic", subject: "chemistry", subtitle: "GOC to biomolecules" },
    { id: "sec-bio-diversity", title: "Biology sectional — Diversity & structure", subject: "biology", subtitle: "Living world to anatomy" },
    { id: "sec-bio-cell", title: "Biology sectional — Cell & plant physio", subject: "biology", subtitle: "Cell, photosynthesis, respiration" },
    { id: "sec-bio-human", title: "Biology sectional — Human physiology", subject: "biology", subtitle: "Breathing to endocrine" },
    { id: "sec-bio-genetics", title: "Biology sectional — Genetics & biotech", subject: "biology", subtitle: "Inheritance to applications" },
    { id: "sec-bio-ecology", title: "Biology sectional — Ecology", subject: "biology", subtitle: "Populations to conservation" },
  ];
  for (const s of sectionals) {
    pushTest(tests, {
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      subject: s.subject,
      kind: "sectional",
      audience: "neet",
      durationMin: 25,
      questionCount: 20,
      difficulty: "mixed",
    });
  }

  for (let i = 1; i <= 8; i++) {
    pushTest(tests, {
      id: `full-neet-${i}`,
      title: `Full NEET mock #${i}`,
      subtitle: "PCB mixed · vigorous timed paper",
      subject: "pcb",
      kind: "full",
      audience: "neet",
      durationMin: 45,
      questionCount: 45,
      difficulty: i <= 2 ? "medium" : i <= 5 ? "mixed" : "hard",
    });
  }

  for (const subject of ["physics", "chemistry", "biology"] as NeetSubject[]) {
    for (let n = 1; n <= 3; n++) {
      pushTest(tests, {
        id: `full-${subject}-${n}`,
        title: `${subject[0].toUpperCase()}${subject.slice(1)} full syllabus mock #${n}`,
        subtitle: "Single-subject grind",
        subject,
        kind: "full",
        audience: "neet",
        durationMin: 30,
        questionCount: 25,
        difficulty: "mixed",
      });
    }
  }

  for (let year = 2015; year <= 2025; year++) {
    pushTest(tests, {
      id: `pyq-${year}`,
      title: `NEET ${year} PYQ-style paper`,
      subtitle: "Topic mix and difficulty modelled on that year’s paper",
      subject: "pcb",
      kind: "pyq",
      audience: "neet",
      year,
      durationMin: 45,
      questionCount: 45,
      difficulty: year >= 2023 ? "hard" : "mixed",
    });
  }

  for (const subject of ["physics", "chemistry", "biology"] as NeetSubject[]) {
    for (let n = 1; n <= 2; n++) {
      pushTest(tests, {
        id: `rapid-${subject}-${n}`,
        title: `${subject} rapid fire #${n}`,
        subtitle: "10-minute sprint",
        subject,
        kind: "rapid",
        audience: "neet",
        durationMin: 10,
        questionCount: 8,
        difficulty: "medium",
      });
    }
  }

  for (let i = 1; i <= 4; i++) {
    pushTest(tests, {
      id: `school-mixed-${i}`,
      title: `Class 9–10 mixed science mock #${i}`,
      subtitle: "Board-style mixed paper",
      subject: "science",
      kind: "full",
      audience: "school",
      durationMin: 25,
      questionCount: 20,
      difficulty: "easy",
    });
  }

  return tests;
}

export const MOCK_CATALOG = buildMockCatalog();

export function getMockTest(id: string): MockTestMeta | undefined {
  return MOCK_CATALOG.find((t) => t.id === id);
}

export function catalogForAudience(audience: Audience): MockTestMeta[] {
  return MOCK_CATALOG.filter((t) => t.audience === audience);
}

export function testsByKind(audience: Audience, kind: MockKind): MockTestMeta[] {
  return catalogForAudience(audience).filter((t) => t.kind === kind);
}

export const CATALOG_COUNTS = {
  total: MOCK_CATALOG.length,
  neet: catalogForAudience("neet").length,
  school: catalogForAudience("school").length,
};

export { ALL_CHAPTERS, NEET_CHAPTERS, SCHOOL_CHAPTERS };
