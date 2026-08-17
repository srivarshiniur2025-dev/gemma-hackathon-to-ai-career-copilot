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
import { applyOnboardingToCareer } from "@/lib/personalize";
import { loadLocalProfile, saveLocalProfile } from "@/lib/local-profile";
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
  const personalized = applyOnboardingToCareer(career, profile);
  const estimate = profile.assessment?.skills_estimate ?? {};
  const skillLevels = Object.keys(estimate).length
    ? Object.entries(estimate).map(([name, val]) => {
        const level = levelFromLabel(val);
        return { name, level, label: labelFromLevel(level) };
      })
    : personalized.skillLevels;

  return {
    ...personalized,
    targetRole: profile.target_role || personalized.targetRole,
    skills: profile.skills?.length ? profile.skills : personalized.skills,
    skillLevels: skillLevels.length ? skillLevels : personalized.skillLevels,
    assessmentCount: profile.assessment?.questions_asked
      ? Math.max(personalized.assessmentCount, 1)
      : personalized.assessmentCount,
    strengths: profile.assessment?.strengths?.length
      ? profile.assessment.strengths
      : personalized.strengths,
    weaknesses: profile.assessment?.weaknesses?.length
      ? profile.assessment.weaknesses
      : personalized.weaknesses,
    assessmentSummary: profile.assessment?.summary ?? personalized.assessmentSummary,
    resumeVersions: profile.resume ? Math.max(personalized.resumeVersions, 1) : personalized.resumeVersions,
    projectCount: profile.projects?.length ?? personalized.projectCount,
    interviewScore: profile.interview?.score ?? personalized.interviewScore,
    internshipMatches: profile.internships?.length ?? personalized.internshipMatches,
    resumeAtsScore: profile.resume?.tailoring?.match_score ?? personalized.resumeAtsScore,
    roadmapDaysRemaining: profile.roadmap?.milestones?.length
      ? profile.roadmap.milestones.length * 7
      : personalized.roadmapDaysRemaining,
    recommendedSkills:
      profile.roadmap?.priority_skills?.map((p) => p.skill).slice(0, 5) ??
      personalized.recommendedSkills,
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
      void api.updateMe({ planner_events: events }).catch(() => undefined);
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

    const cached = loadLocalProfile(user.email);
    if (cached) {
      mergeFromProfile(cached);
      setLoading(false);
    }

    void (async () => {
      try {
        const token = await getIdToken();
        if (token) api.setToken(token);
        let p: Profile;
        try {
          p = await api.getMe();
        } catch {
          p = await api.registerUser(user.name);
        }
        const local = loadLocalProfile(user.email);
        if (local?.onboarding_complete && !p.onboarding_complete) {
          p = { ...p, ...local, uid: p.uid || local.uid };
          void api.updateMe(local).catch(() => undefined);
        }
        saveLocalProfile(p, user.email);
        mergeFromProfile(p);
      } catch {
        if (!cached) {
          const local = loadCareerData(user.email);
          const seeded = {
            ...local,
            degree: user.college ? `Student • ${user.college}` : local.degree,
          };
          saveCareerData(seeded, user.email);
          setCareer(seeded);
        }
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
