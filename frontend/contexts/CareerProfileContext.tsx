"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { CareerData } from "@/lib/career-store";
import {
  buildRoadmapCurve,
  buildSkillSparkline,
  computeSkillScore,
  levelFromLabel,
  labelFromLevel,
  loadCareerData,
  recordDailyActivity,
  saveCareerData,
} from "@/lib/career-store";
import type { Profile } from "@/lib/types";

type CareerProfileContextValue = {
  career: CareerData;
  profile: Profile | null;
  loading: boolean;
  displayName: string;
  subtitle: string;
  initials: string;
  skillScore: number;
  skillSparkline: { v: number }[];
  roadmapCurve: { day: number; progress: number }[];
  refresh: () => void;
  updatePlanner: (events: CareerData["plannerEvents"]) => void;
  mergeFromProfile: (p: Profile) => void;
};

const CareerProfileContext = createContext<CareerProfileContextValue | undefined>(undefined);

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mergeProfileIntoCareer(career: CareerData, profile: Profile): CareerData {
  const estimate = profile.assessment?.skills_estimate ?? {};
  const skillLevels = Object.keys(estimate).length
    ? Object.entries(estimate).map(([name, val]) => {
        const level = levelFromLabel(val);
        return { name, level, label: labelFromLevel(level) };
      })
    : career.skillLevels;

  return {
    ...career,
    targetRole: profile.target_role || career.targetRole,
    degree: profile.degree || career.degree,
    skills: profile.skills?.length ? profile.skills : career.skills,
    skillLevels: skillLevels.length ? skillLevels : career.skillLevels,
    assessmentCount: profile.assessment?.questions_asked
      ? Math.max(career.assessmentCount, 1)
      : career.assessmentCount,
    strengths: profile.assessment?.strengths ?? career.strengths,
    weaknesses: profile.assessment?.weaknesses ?? career.weaknesses,
    assessmentSummary: profile.assessment?.summary ?? career.assessmentSummary,
    resumeVersions: profile.resume ? Math.max(career.resumeVersions, 1) : career.resumeVersions,
    projectCount: profile.projects?.length ?? career.projectCount,
    interviewScore: profile.interview?.score ?? career.interviewScore,
    internshipMatches: profile.internships?.length ?? career.internshipMatches,
    resumeAtsScore: profile.resume?.tailoring?.match_score ?? career.resumeAtsScore,
    roadmapDaysRemaining: profile.roadmap?.milestones?.length
      ? profile.roadmap.milestones.length * 7
      : career.roadmapDaysRemaining,
    recommendedSkills:
      profile.roadmap?.priority_skills?.map((p) => p.skill).slice(0, 5) ??
      career.recommendedSkills,
  };
}

export function CareerProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, getIdToken } = useAuth();
  const [career, setCareer] = useState<CareerData>(() => loadCareerData());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setCareer(loadCareerData(user?.email));
  }, [user?.email]);

  const mergeFromProfile = useCallback(
    (p: Profile) => {
      const merged = mergeProfileIntoCareer(loadCareerData(user?.email), p);
      saveCareerData(merged, user?.email);
      setCareer(merged);
      setProfile(p);
    },
    [user?.email]
  );

  const updatePlanner = useCallback(
    (events: CareerData["plannerEvents"]) => {
      const next = { ...loadCareerData(user?.email), plannerEvents: events };
      saveCareerData(next, user?.email);
      setCareer(next);
    },
    [user?.email]
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const withStreak = recordDailyActivity(user.email);
    setCareer(withStreak);

    void (async () => {
      try {
        const token = await getIdToken();
        if (token) api.setToken(token);
        const p = await api.getMe();
        mergeFromProfile(p);
      } catch {
        const local = loadCareerData(user.email);
        const seeded = {
          ...local,
          degree: user.college ? `Student • ${user.college}` : local.degree,
        };
        saveCareerData(seeded, user.email);
        setCareer(seeded);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, getIdToken, mergeFromProfile]);

  const displayName = user?.name ?? "Student";
  const subtitle =
    career.degree ||
    (user?.college ? `Student • ${user.college}` : career.targetRole);
  const skillScore = computeSkillScore(career);

  const value = useMemo<CareerProfileContextValue>(
    () => ({
      career,
      profile,
      loading,
      displayName,
      subtitle,
      initials: initialsFromName(displayName),
      skillScore,
      skillSparkline: buildSkillSparkline(career),
      roadmapCurve: buildRoadmapCurve(career),
      refresh,
      updatePlanner,
      mergeFromProfile,
    }),
    [career, profile, loading, displayName, subtitle, skillScore, refresh, updatePlanner, mergeFromProfile]
  );

  return (
    <CareerProfileContext.Provider value={value}>{children}</CareerProfileContext.Provider>
  );
}

export function useCareerProfile() {
  const ctx = useContext(CareerProfileContext);
  if (!ctx) throw new Error("useCareerProfile must be used within CareerProfileProvider");
  return ctx;
}
