export const stats = [
  { value: "50,000+", label: "Students Guided" },
  { value: "5,000+", label: "Resumes Generated" },
  { value: "92%", label: "ATS Success" },
  { value: "1,000+", label: "Internships Recommended" },
];

export const features = [
  {
    title: "Gemma Skill Assessment",
    description: "Gemma asks adaptive technical questions and estimates your real proficiency.",
    bullets: ["Adaptive questioning", "Real skill estimation", "Strength analysis"],
    icon: "brain" as const,
  },
  {
    title: "Gemma Learning Roadmap",
    description: "Gemma builds a structured plan with milestones, resources, and projects.",
    bullets: ["Milestones", "Resources", "Projects", "Progress tracking"],
    icon: "map" as const,
  },
  {
    title: "Gemma Resume Builder",
    description: "Gemma rewrites bullet points and optimizes your resume for ATS systems.",
    bullets: ["Resume generation", "ATS optimization", "Role-specific resumes"],
    icon: "file" as const,
  },
  {
    title: "Gemma Internship Match",
    description: "Gemma matches roles and explains skill gaps with clear reasoning.",
    bullets: ["AI matching", "Skill gap explanation", "Eligibility prediction"],
    icon: "briefcase" as const,
  },
  {
    title: "Gemma Mock Interview",
    description: "Gemma interviews you, adapts difficulty, and gives detailed feedback.",
    bullets: ["Adaptive questions", "Performance analysis", "Feedback"],
    icon: "mic" as const,
  },
  {
    title: "Career Dashboard",
    description: "Track progress, achievements, and personalized recommendations.",
    bullets: ["Progress", "Achievements", "Recommendations"],
    icon: "chart" as const,
  },
];

export const steps = [
  { step: 1, title: "Create Account", description: "Sign up and set your career goals." },
  { step: 2, title: "Take AI Skill Assessment", description: "Answer adaptive technical questions." },
  { step: 3, title: "Receive Skill Report", description: "Get strengths, weaknesses, and scores." },
  { step: 4, title: "Build Resume", description: "Generate ATS-optimized professional resume." },
  { step: 5, title: "Practice Interview", description: "Mock interviews with AI feedback." },
  { step: 6, title: "Apply for Internships", description: "Get matched roles with clear guidance." },
];

export const testimonials = [
  {
    name: "Priya Sharma",
    college: "IIT Delhi",
    avatar: "PS",
    review: "The adaptive assessment finally showed me where I actually stand. Landed my dream internship in 6 weeks.",
  },
  {
    name: "Arjun Mehta",
    college: "BITS Pilani",
    avatar: "AM",
    review: "Resume ATS score went from 62% to 94%. The AI bullet points are incredibly sharp.",
  },
  {
    name: "Sneha Reddy",
    college: "NIT Warangal",
    avatar: "SR",
    review: "Mock interviews felt real. Gemma pushed me harder each round — exactly what I needed.",
  },
];

export const faqs = [
  {
    q: "How does the AI skill assessment work?",
    a: "Gemma asks adaptive technical questions based on your previous answers, estimating proficiency across domains like Python, DSA, and Web Development — not just self-reported skills.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use Firebase Authentication and encrypted storage. Your profile data is never shared with third parties.",
  },
  {
    q: "Can I tailor my resume for different roles?",
    a: "Absolutely. Generate role-specific resumes for AI Engineer, Full Stack, Frontend, and more with ATS optimization.",
  },
  {
    q: "What makes internship recommendations accurate?",
    a: "Recommendations are based on your assessed skills, projects, and career goals — with clear explanations of match score and missing skills.",
  },
];

export const skillDomains = [
  "Python",
  "Java",
  "C++",
  "DSA",
  "Web Development",
  "AI/ML",
  "Cloud",
  "Cyber Security",
];

export const mockSkillScores: Record<string, number> = {
  Python: 72,
  Java: 45,
  "C++": 38,
  DSA: 65,
  "Web Development": 78,
  "AI/ML": 55,
  Cloud: 42,
  "Cyber Security": 30,
};

export const mockAssessmentMessages = [
  { role: "assistant" as const, content: "Welcome! Let's start with Python. Explain the difference between a list and a tuple, and when you'd use each." },
  { role: "user" as const, content: "Lists are mutable, tuples are immutable. I use tuples for fixed collections like coordinates." },
  { role: "assistant" as const, content: "Good! Now write a one-liner to flatten a nested list [[1,2],[3,4]] into [1,2,3,4]." },
];

export const mockRoadmapSteps = [
  { title: "Learn Python", progress: 85, time: "2 weeks", resources: ["Python.org", "Real Python"], projects: ["CLI Todo App"] },
  { title: "Complete DSA", progress: 60, time: "4 weeks", resources: ["LeetCode", "NeetCode"], projects: ["50 Problems"] },
  { title: "Build Projects", progress: 40, time: "3 weeks", resources: ["GitHub"], projects: ["Portfolio Site"] },
  { title: "Learn Git", progress: 90, time: "1 week", resources: ["Pro Git Book"], projects: ["Open Source PR"] },
  { title: "Learn React", progress: 55, time: "3 weeks", resources: ["React Docs"], projects: ["Dashboard UI"] },
  { title: "Deploy Portfolio", progress: 20, time: "1 week", resources: ["Vercel"], projects: ["Live Portfolio"] },
  { title: "Interview Preparation", progress: 10, time: "2 weeks", resources: ["Mock Interviews"], projects: ["System Design Notes"] },
];

export const mockInternships = [
  {
    company: "TechNova Labs",
    logo: "TN",
    role: "Junior Python Developer Intern",
    location: "Remote",
    match: 88,
    type: "Remote" as const,
    stipend: "₹25,000/mo",
    required: ["Python", "Git", "REST APIs"],
    missing: ["Docker"],
    why: "Strong Python fundamentals and project experience align well with backend intern requirements.",
  },
  {
    company: "DataBridge Analytics",
    logo: "DB",
    role: "ML Engineering Intern",
    location: "Hybrid · Bangalore",
    match: 74,
    type: "Hybrid" as const,
    stipend: "₹30,000/mo",
    required: ["Python", "ML basics", "Pandas"],
    missing: ["TensorFlow", "Statistics"],
    why: "Your AI/ML interest and Python skills are a solid foundation for this role.",
  },
  {
    company: "WebCraft Studio",
    logo: "WC",
    role: "Frontend Developer Intern",
    location: "On-site · Mumbai",
    match: 82,
    type: "Onsite" as const,
    stipend: "₹20,000/mo",
    required: ["React", "CSS", "JavaScript"],
    missing: ["TypeScript"],
    why: "Web development score and React project experience make you a strong candidate.",
  },
];

export const mockDashboardStats = {
  skillScore: 72,
  learningProgress: 58,
  internshipsMatched: 12,
  resumeAtsScore: 89,
};

export const mockRadarData = [
  { skill: "Python", score: 72, fullMark: 100 },
  { skill: "DSA", score: 65, fullMark: 100 },
  { skill: "Web Dev", score: 78, fullMark: 100 },
  { skill: "AI/ML", score: 55, fullMark: 100 },
  { skill: "Cloud", score: 42, fullMark: 100 },
  { skill: "Git", score: 90, fullMark: 100 },
];

export const mockWeeklyGrowth = [
  { week: "W1", hours: 8, score: 45 },
  { week: "W2", hours: 12, score: 52 },
  { week: "W3", hours: 15, score: 61 },
  { week: "W4", hours: 18, score: 68 },
  { week: "W5", hours: 22, score: 72 },
];

export const mockAchievements = [
  { title: "First Assessment", desc: "Completed your first skill assessment", earned: true },
  { title: "Resume Pro", desc: "Generated an ATS-optimized resume", earned: true },
  { title: "Interview Ready", desc: "Scored 80%+ on mock interview", earned: false },
  { title: "Roadmap Master", desc: "Completed 5 roadmap milestones", earned: false },
];

export const resumeRoles = [
  "AI Engineer",
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
];
