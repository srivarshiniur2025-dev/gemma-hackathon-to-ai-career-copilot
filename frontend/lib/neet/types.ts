export type NeetSubject = "physics" | "chemistry" | "biology";
export type SchoolSubject = "science" | "math";
export type ExamSubject = NeetSubject | SchoolSubject | "pcb";

export type MockKind = "chapter" | "sectional" | "full" | "pyq" | "rapid";
export type Audience = "neet" | "school";

export type ChapterDef = {
  id: string;
  subject: NeetSubject | SchoolSubject;
  classLevel: 9 | 10 | 11 | 12;
  name: string;
  unit: string;
  audience: Audience;
};

export type NeetMcq = {
  id: string;
  chapterId: string;
  subject: NeetSubject | SchoolSubject;
  question: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
  years: number[];
  source: "ncert" | "pyq-style";
};

export type MockTestMeta = {
  id: string;
  title: string;
  subtitle: string;
  subject: ExamSubject;
  chapterId?: string;
  kind: MockKind;
  audience: Audience;
  year?: number;
  durationMin: number;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
};
