import type { Roadmap } from "@/lib/types";

export type LearnerTrack = "bio" | "high_school" | "grade_9_10" | "developer";

export type QuestionOption = { value: string; label: string };

export type OnboardingQuestion = {
  id: string;
  prompt: string;
  hint?: string;
  type: "choice" | "text";
  options?: QuestionOption[];
  placeholder?: string;
};

export type TrackDefinition = {
  id: LearnerTrack;
  title: string;
  subtitle: string;
  targetRole: string;
  questions: OnboardingQuestion[];
};

export const LEARNER_TRACKS: TrackDefinition[] = [
  {
    id: "bio",
    title: "Biology / NEET",
    subtitle: "NEET UG — chapter mocks, PYQ-style papers, and vigorous PCB prep",
    targetRole: "NEET / MBBS aspirant",
    questions: [
      {
        id: "level",
        prompt: "Where are you in your biology journey?",
        type: "choice",
        options: [
          { value: "class_11", label: "Class 11" },
          { value: "class_12", label: "Class 12" },
          { value: "undergrad", label: "Undergraduate" },
          { value: "other", label: "Other / exploring" },
        ],
      },
      {
        id: "focus",
        prompt: "What interests you most?",
        type: "choice",
        options: [
          { value: "medicine", label: "Medicine / NEET" },
          { value: "genetics", label: "Genetics & research" },
          { value: "biotech", label: "Biotechnology" },
          { value: "ecology", label: "Ecology & environment" },
        ],
      },
      {
        id: "exam",
        prompt: "Are you preparing for a specific exam or goal?",
        type: "choice",
        options: [
          { value: "neet", label: "NEET" },
          { value: "boards", label: "Board exams only" },
          { value: "research", label: "Research / olympiad" },
          { value: "none", label: "No exam — just learning" },
        ],
      },
      {
        id: "strength",
        prompt: "Which area feels strongest today?",
        type: "choice",
        options: [
          { value: "botany", label: "Botany" },
          { value: "zoology", label: "Zoology" },
          { value: "human_physio", label: "Human physiology" },
          { value: "cell_mol", label: "Cell & molecular biology" },
        ],
      },
      {
        id: "hardest",
        prompt: "Which topic currently feels the hardest?",
        type: "text",
        placeholder: "e.g. Genetics, Plant physiology, Neural control",
      },
      {
        id: "gap",
        prompt: "What do you want to improve first?",
        type: "choice",
        options: [
          { value: "concepts", label: "Core concepts" },
          { value: "diagrams", label: "Diagrams & labeling" },
          { value: "application", label: "Application / numericals" },
          { value: "lab", label: "Lab skills" },
        ],
      },
      {
        id: "difficulty",
        prompt: "What usually gets in the way of studying?",
        type: "choice",
        options: [
          { value: "time", label: "Not enough time" },
          { value: "focus", label: "Losing focus" },
          { value: "memory", label: "Forgetting after a few days" },
          { value: "overload", label: "Too many chapters at once" },
        ],
      },
      {
        id: "free_time",
        prompt: "When are you usually free to study?",
        type: "choice",
        options: [
          { value: "morning", label: "Mornings (before 12)" },
          { value: "afternoon", label: "Afternoons" },
          { value: "evening", label: "Evenings (after 5)" },
          { value: "weekend", label: "Weekends mostly" },
        ],
      },
      {
        id: "hours",
        prompt: "How many hours a week can you study extra?",
        type: "choice",
        options: [
          { value: "3", label: "About 3 hours" },
          { value: "6", label: "About 6 hours" },
          { value: "10", label: "10+ hours" },
        ],
      },
      {
        id: "phy_level",
        prompt: "How is NEET Physics feeling right now?",
        type: "choice",
        options: [
          { value: "strong", label: "Strong — I want speed" },
          { value: "ok", label: "Okay — need more numericals" },
          { value: "weak", label: "Weak — concepts are shaky" },
        ],
      },
      {
        id: "chem_level",
        prompt: "How is NEET Chemistry feeling right now?",
        type: "choice",
        options: [
          { value: "strong", label: "Strong" },
          { value: "ok", label: "Mixed — organic is the issue" },
          { value: "weak", label: "Weak — too many reactions" },
        ],
      },
      {
        id: "lab_access",
        prompt: "Do you have access to a lab or practicals?",
        type: "choice",
        options: [
          { value: "school", label: "School / college lab" },
          { value: "home", label: "Simple home experiments" },
          { value: "none", label: "Mostly theory for now" },
        ],
      },
    ],
  },
  {
    id: "high_school",
    title: "High School",
    subtitle: "Classes 11–12 — boards, entrance exams, and career foundations",
    targetRole: "High School Scholar",
    questions: [
      {
        id: "grade",
        prompt: "Which class are you in?",
        type: "choice",
        options: [
          { value: "11", label: "Class 11" },
          { value: "12", label: "Class 12" },
        ],
      },
      {
        id: "stream",
        prompt: "Which stream are you in?",
        type: "choice",
        options: [
          { value: "pcm", label: "Science — PCM" },
          { value: "pcb", label: "Science — PCB" },
          { value: "commerce", label: "Commerce" },
          { value: "arts", label: "Arts / Humanities" },
        ],
      },
      {
        id: "board",
        prompt: "Which board do you follow?",
        type: "choice",
        options: [
          { value: "cbse", label: "CBSE" },
          { value: "isc", label: "ISC / ICSE" },
          { value: "state", label: "State board" },
          { value: "ib", label: "IB / other" },
        ],
      },
      {
        id: "goal",
        prompt: "What is your main goal this year?",
        type: "choice",
        options: [
          { value: "boards", label: "Board exams" },
          { value: "entrance", label: "Entrance exams (JEE / NEET / CUET)" },
          { value: "skills", label: "Build a skill or portfolio" },
          { value: "explore", label: "Explore career options" },
        ],
      },
      {
        id: "weak_subject",
        prompt: "Which subject needs the most help?",
        type: "text",
        placeholder: "e.g. Physics, Accountancy, History",
      },
      {
        id: "strong_subject",
        prompt: "Which subject currently feels strongest?",
        type: "text",
        placeholder: "e.g. Chemistry, Economics, English",
      },
      {
        id: "difficulty",
        prompt: "What is the biggest study difficulty right now?",
        type: "choice",
        options: [
          { value: "syllabus", label: "Syllabus feels too large" },
          { value: "application", label: "I understand theory but freeze on problems" },
          { value: "consistency", label: "I cannot stay consistent" },
          { value: "anxiety", label: "Exam anxiety" },
        ],
      },
      {
        id: "coaching",
        prompt: "How are you studying besides school?",
        type: "choice",
        options: [
          { value: "coaching", label: "Coaching / tuition" },
          { value: "self", label: "Mostly self-study" },
          { value: "mixed", label: "Mix of both" },
          { value: "none", label: "School only for now" },
        ],
      },
      {
        id: "free_time",
        prompt: "When are you usually free to study extra?",
        type: "choice",
        options: [
          { value: "morning", label: "Mornings" },
          { value: "evening", label: "Evenings after school" },
          { value: "night", label: "Late night" },
          { value: "weekend", label: "Weekends" },
        ],
      },
      {
        id: "hours",
        prompt: "How many extra study hours can you give each week?",
        type: "choice",
        options: [
          { value: "4", label: "About 4 hours" },
          { value: "8", label: "About 8 hours" },
          { value: "12", label: "12+ hours" },
        ],
      },
    ],
  },
  {
    id: "grade_9_10",
    title: "9th & 10th Std",
    subtitle: "Build strong fundamentals and discover what you enjoy",
    targetRole: "Secondary School Learner",
    questions: [
      {
        id: "grade",
        prompt: "Which class are you in?",
        type: "choice",
        options: [
          { value: "9", label: "9th standard" },
          { value: "10", label: "10th standard" },
        ],
      },
      {
        id: "board",
        prompt: "Which board do you follow?",
        type: "choice",
        options: [
          { value: "cbse", label: "CBSE" },
          { value: "icse", label: "ICSE" },
          { value: "state", label: "State board" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "favorite",
        prompt: "Which subject do you enjoy most?",
        type: "choice",
        options: [
          { value: "math", label: "Math" },
          { value: "science", label: "Science" },
          { value: "english", label: "English" },
          { value: "social", label: "Social science" },
        ],
      },
      {
        id: "hard_subject",
        prompt: "Which subject feels the hardest right now?",
        type: "choice",
        options: [
          { value: "math", label: "Math" },
          { value: "science", label: "Science" },
          { value: "english", label: "English" },
          { value: "social", label: "Social science" },
        ],
      },
      {
        id: "curiosity",
        prompt: "What would you like to explore after class?",
        type: "choice",
        options: [
          { value: "coding", label: "Coding & computers" },
          { value: "design", label: "Design & creativity" },
          { value: "science", label: "Science experiments" },
          { value: "unsure", label: "Not sure yet" },
        ],
      },
      {
        id: "difficulty",
        prompt: "What makes studying difficult for you?",
        type: "choice",
        options: [
          { value: "homework", label: "Too much homework" },
          { value: "boring", label: "Lessons feel boring" },
          { value: "doubt", label: "I get stuck and don't ask" },
          { value: "phone", label: "Phone / distractions" },
        ],
      },
      {
        id: "support",
        prompt: "Who usually helps when you are stuck?",
        type: "choice",
        options: [
          { value: "teacher", label: "Teacher" },
          { value: "parent", label: "Parent / family" },
          { value: "friend", label: "Friend" },
          { value: "alone", label: "I figure it out alone" },
        ],
      },
      {
        id: "free_time",
        prompt: "When can you do extra learning?",
        type: "choice",
        options: [
          { value: "after_school", label: "Right after school" },
          { value: "evening", label: "Evening" },
          { value: "weekend", label: "Weekends" },
          { value: "short", label: "Short 20-minute slots" },
        ],
      },
      {
        id: "hours",
        prompt: "How much extra time can you spend learning each week?",
        type: "choice",
        options: [
          { value: "2", label: "About 2 hours" },
          { value: "4", label: "About 4 hours" },
          { value: "6", label: "6+ hours" },
        ],
      },
      {
        id: "exam_feel",
        prompt: "How do exams usually feel?",
        type: "choice",
        options: [
          { value: "ok", label: "Mostly okay if I revise" },
          { value: "rush", label: "I start too late" },
          { value: "nervous", label: "I get very nervous" },
          { value: "blank", label: "I go blank even if I studied" },
        ],
      },
    ],
  },
  {
    id: "developer",
    title: "Developer",
    subtitle: "Coding, software engineering, and tech internships",
    targetRole: "Software Engineering Intern",
    questions: [
      {
        id: "level",
        prompt: "How would you describe your coding level?",
        type: "choice",
        options: [
          { value: "beginner", label: "Beginner — just starting" },
          { value: "student", label: "Student — some projects" },
          { value: "intermediate", label: "Intermediate — internships or freelance" },
        ],
      },
      {
        id: "stack",
        prompt: "What do you want to focus on?",
        type: "choice",
        options: [
          { value: "web", label: "Web (React / Next.js)" },
          { value: "python", label: "Python / backend" },
          { value: "ai", label: "AI / ML" },
          { value: "mobile", label: "Mobile apps" },
        ],
      },
      {
        id: "known",
        prompt: "Which languages or tools do you already know?",
        type: "text",
        placeholder: "e.g. Python, HTML, Git",
      },
      {
        id: "goal",
        prompt: "What is the outcome you want in the next 8 weeks?",
        type: "choice",
        options: [
          { value: "internship", label: "Land an internship" },
          { value: "portfolio", label: "Ship a portfolio project" },
          { value: "dsa", label: "Get stronger at DSA" },
          { value: "job", label: "Prepare for full-time roles" },
        ],
      },
      {
        id: "difficulty",
        prompt: "What is the hardest part of learning to code for you?",
        type: "choice",
        options: [
          { value: "start", label: "Starting / blank editor" },
          { value: "dsa", label: "DSA and problem solving" },
          { value: "debug", label: "Debugging errors" },
          { value: "consistency", label: "Staying consistent" },
        ],
      },
      {
        id: "github",
        prompt: "Do you already use GitHub?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes — I push projects" },
          { value: "account", label: "I have an account but rarely use it" },
          { value: "no", label: "Not yet" },
        ],
      },
      {
        id: "free_time",
        prompt: "When can you actually practice?",
        type: "choice",
        options: [
          { value: "weekday_eve", label: "Weekday evenings" },
          { value: "weekend", label: "Weekends" },
          { value: "daily_short", label: "Short daily slots" },
          { value: "irregular", label: "It changes every week" },
        ],
      },
      {
        id: "hours",
        prompt: "How many hours a week can you practice?",
        type: "choice",
        options: [
          { value: "5", label: "About 5 hours" },
          { value: "10", label: "About 10 hours" },
          { value: "15", label: "15+ hours" },
        ],
      },
      {
        id: "blockers",
        prompt: "What else should Gemma know about your situation?",
        type: "text",
        placeholder: "e.g. College till 4pm, weak in DSA, want a summer intern",
      },
      {
        id: "project_idea",
        prompt: "Is there a project you already want to build?",
        type: "text",
        placeholder: "e.g. Habit tracker, resume site, chatbot — or skip with 'not sure'",
      },
    ],
  },
];

export function getTrack(id: LearnerTrack): TrackDefinition {
  const track = LEARNER_TRACKS.find((t) => t.id === id);
  if (!track) throw new Error(`Unknown track: ${id}`);
  return track;
}

export function labelForAnswer(track: TrackDefinition, questionId: string, value: string): string {
  const question = track.questions.find((q) => q.id === questionId);
  const option = question?.options?.find((o) => o.value === value);
  return option?.label ?? value;
}

function week(
  n: number,
  title: string,
  tasks: string[],
  resources: string[],
  why: string
): Roadmap["milestones"][number] {
  return { week: n, title, tasks, resources, why };
}

export function fallbackRoadmap(track: TrackDefinition, answers: Record<string, string>): Roadmap {
  const hours = answers.hours ?? "6";
  const overview = `An 8-week ${track.title.toLowerCase()} plan tailored to your answers, with about ${hours} hours of focused work each week.`;

  const byTrack: Record<LearnerTrack, Roadmap["milestones"]> = {
    bio: [
      week(1, "NCERT sweep + error log", ["Finish weakest bio chapter", "30 Physics numericals", "Daily 20 organic reactions"], ["NCERT Biology", "HC Verma selected", "MS Chauhan GOC"], "NEET rewards line-by-line NCERT plus an error notebook."),
      week(2, "Human physiology block", ["Diagrams from memory", "PYQ-style 10Q daily"], ["NEET PYQ chapter tests in the app"], "Physiology is high-yield and diagram-heavy."),
      week(3, "Genetics + evolution grind", ["Punnett + pedigree drills", "Molecular basis flashcards"], ["App: Genetics chapter assessment"], "These chapters decide many 4-mark equivalent MCQs."),
      week(4, "Physics mechanics + chem equilibrium", ["One sectional mock each", "Revise every wrong option"], ["App: Physics sectional — Mechanics"], "Sectionals build speed before full papers."),
      week(5, "Full PCB mock #1", ["One 45-question mock", "Post-mortem the same day"], ["App: Full NEET mock #1"], "Stamina is a skill; sit the clock."),
      week(6, "PYQ-style year paper", ["NEET 2023–2025 pattern papers", "Revisit NCERT lines you missed"], ["App: PYQ-style papers tab"], "Year mix trains you for surprise topics."),
      week(7, "Rapid fire + weak chapter blitz", ["Two rapid tests/day", "Re-teach one chapter out loud"], ["App: Rapid fire"], "Active recall beats rereading."),
      week(8, "Peak week", ["Two full mocks", "Sleep and revision only — no new books"], ["App: Full NEET mock #8"], "Rank comes from calm accuracy, not new material."),
    ],
    high_school: [
      week(1, "Study system", ["Build a weekly timetable", "Identify the weakest chapter"], ["Cornell notes method", "Pomodoro timer"], "A system beats last-minute cramming."),
      week(2, "Core subject block A", ["Concept notes + 20 practice Qs"], ["Official board textbook", "Unacademy / Khan Academy"], "Depth in one subject raises overall confidence."),
      week(3, "Core subject block B", ["Error log of every missed question"], ["Previous year papers"], "Your mistakes are the real syllabus."),
      week(4, "Entrance or boards drill", ["One timed mock", "Review every wrong answer"], ["Official sample papers"], "Timed practice is a skill of its own."),
      week(5, "Skill add-on", ["Start a small related project or case file"], ["YouTube project walkthroughs"], "Colleges and internships notice initiative."),
      week(6, "Weak-topic repair", [`Rebuild notes for ${answers.weak_subject || "your weak subject"}`], ["Teacher office hours", "Peer study"], "Closing one gap lifts the whole score."),
      week(7, "Full mock week", ["Two mocks + sleep schedule"], ["Board / entrance archives"], "Stamina matters as much as knowledge."),
      week(8, "Career map", ["Shortlist 3 paths after 12th", "Talk to one mentor or senior"], ["Career guidance portals"], "A plan after boards reduces panic."),
    ],
    grade_9_10: [
      week(1, "Learning habits", ["20-minute daily review", "Keep a doubt notebook"], ["Simple study planner"], "Small daily habits beat long weekend sessions."),
      week(2, "Math confidence", ["10 mixed problems a day"], ["Khan Academy Math", "NCERT"], "Math underpins science, coding, and commerce."),
      week(3, "Science curiosity", ["One experiment or demo at home", "Explain it to a friend"], ["PhET simulations"], "Curiosity now becomes a stream choice later."),
      week(4, "Language & thinking", ["Write a one-page journal twice", "Read one article"], ["BBC Learning English"], "Clear writing helps every subject."),
      week(5, "Explore a passion", [`Try a beginner project in ${answers.curiosity || "a topic you like"}`], ["Scratch / CS First", "Science olympiad primers"], "Exploration is the point of 9th and 10th."),
      week(6, "Board-style practice", ["Chapter-end questions timed"], ["Textbook exercises"], "Exam format should feel familiar, not scary."),
      week(7, "Revision games", ["Mind maps + teach-back"], ["Quizlet"], "Active recall is kinder than rereading."),
      week(8, "Look ahead", ["List subjects you might pick in 11th", "Talk with a teacher"], ["School career cell"], "A gentle plan beats a rushed stream choice."),
    ],
    developer: [
      week(1, "Environment & Git", ["Install tools", "Push a Hello World repo"], ["GitHub Skills", "The Odin Project"], "You cannot intern without a working setup."),
      week(2, "Language fundamentals", ["Daily 45-minute drills"], ["freeCodeCamp", "Python.org tutorial"], "Syntax fluency unlocks every later project."),
      week(3, "Build in public", ["Ship a tiny UI or CLI", "Write a README"], ["MDN", "React docs"], "Shipped work beats unfinished tutorials."),
      week(4, "Data & APIs", ["Fetch a public API", "Show results in a simple page"], ["JSONPlaceholder", "FastAPI tutorial"], "Most internships are API + UI work."),
      week(5, "Project v1", ["Define one user problem", "Build the happy path"], ["roadmap.sh"], "A focused project is your best interview artifact."),
      week(6, "Quality pass", ["Add basic tests or error states"], ["Testing Library docs"], "Interns who handle edge cases stand out."),
      week(7, "DSA or system basics", ["4 problems or one design sketch a day"], ["NeetCode", "Educative"], "Interviews still test structured thinking."),
      week(8, "Apply", ["Polish GitHub + resume bullets", "Apply to 8 roles"], ["Wellfound", "LinkedIn internships"], "A roadmap only works if you send it into the world."),
    ],
  };

  return {
    overview,
    milestones: byTrack[track.id],
    priority_skills: [
      {
        skill: track.title,
        current: "beginner",
        target: "intermediate",
        reason: "Chosen from your onboarding track and weekly time budget.",
      },
    ],
    project_ideas: [
      `A 2-week ${track.title.toLowerCase()} mini-project you can show in interviews`,
      "A weekly learning log with what you practiced and what is still unclear",
    ],
    internship_readiness_score: 42,
  };
}
