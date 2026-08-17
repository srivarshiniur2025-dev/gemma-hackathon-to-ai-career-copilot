export const DEMO_DASHBOARD_USER = {
  name: "Monic Sathyaki",
  degree: "B.Tech AI & ML",
  college: "VIT Chennai",
  subtitle: "B.Tech AI & ML • VIT Chennai",
  initials: "MS",
  avatarColor: "#0D9488",
};

export const dashboardMetrics = {
  skillScore: 92,
  atsResumeScore: 88,
  roadmapDaysRemaining: 34,
  internshipMatches: 24,
};

export const dashboardStatistics = [
  { label: "Completed Assessments", value: 8 },
  { label: "Resume Versions", value: 5 },
  { label: "Projects", value: 12 },
  { label: "Interview Score", value: 85, suffix: "%" },
] as const;

export const skillScoreSparkline = [
  { v: 72 },
  { v: 78 },
  { v: 75 },
  { v: 84 },
  { v: 88 },
  { v: 92 },
];

export const roadmapCurveData = [
  { day: 1, progress: 10 },
  { day: 2, progress: 18 },
  { day: 3, progress: 15 },
  { day: 4, progress: 28 },
  { day: 5, progress: 35 },
  { day: 6, progress: 42 },
  { day: 7, progress: 50 },
];

export type TimelineEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  startHour: number;
  durationHours: number;
  color: string;
  dotColor: string;
  bgColor: string;
  date?: string;
  why?: string;
};

export const weeklyTimelineEvents: TimelineEvent[] = [
  {
    id: "python",
    title: "Python Practice",
    startTime: "10:00",
    endTime: "11:00",
    startHour: 10,
    durationHours: 1,
    color: "#2563EB",
    dotColor: "#2563EB",
    bgColor: "#EFF6FF",
  },
  {
    id: "resume",
    title: "Resume Optimization",
    startTime: "12:00",
    endTime: "1:00",
    startHour: 12,
    durationHours: 1,
    color: "#FB923C",
    dotColor: "#FB923C",
    bgColor: "#FFF7ED",
  },
  {
    id: "interview",
    title: "Mock Interview",
    startTime: "3:00",
    endTime: "4:00",
    startHour: 15,
    durationHours: 1,
    color: "#10B981",
    dotColor: "#10B981",
    bgColor: "#ECFDF5",
  },
  {
    id: "dsa",
    title: "DSA Revision",
    startTime: "5:00",
    endTime: "6:30",
    startHour: 17,
    durationHours: 1.5,
    color: "#8B5CF6",
    dotColor: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    id: "internship",
    title: "Apply to Internship",
    startTime: "7:00",
    endTime: "7:30",
    startHour: 19,
    durationHours: 0.5,
    color: "#EF4444",
    dotColor: "#EF4444",
    bgColor: "#FEF2F2",
  },
];

export const timelineHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
