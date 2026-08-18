import type { Resume } from "@/lib/types";

export type ResumeDraft = {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  education: string;
  skills: string;
  projects: string;
  experience: string;
  certifications: string;
};

export const RESUME_STORAGE_KEY = "careerCopilotResumeDraft";

export function loadResumeDraft(email?: string | null): ResumeDraft | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${RESUME_STORAGE_KEY}:${(email ?? "guest").toLowerCase()}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ResumeDraft;
  } catch {
    return null;
  }
}

export function saveResumeDraft(draft: ResumeDraft, email?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${RESUME_STORAGE_KEY}:${(email ?? "guest").toLowerCase()}`, JSON.stringify(draft));
}

export function defaultDraft(name: string, email: string): ResumeDraft {
  return {
    name,
    email,
    phone: "",
    github: "",
    linkedin: "",
    education: "",
    skills: "",
    projects: "",
    experience: "",
    certifications: "",
  };
}

export function bulletsFromText(text: string): string[] {
  return text
    .split(/\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function resumeToPlainText(resume: Resume, draft: ResumeDraft): string {
  const lines: string[] = [
    draft.name || "Your Name",
    [draft.email, draft.phone, draft.github, draft.linkedin].filter(Boolean).join(" · "),
    "",
    "SUMMARY",
    resume.summary,
    "",
    "SKILLS",
    resume.skills.join(" · "),
  ];
  if (resume.education?.length) {
    lines.push("", "EDUCATION");
    for (const e of resume.education) lines.push(`${e.degree} — ${e.details}`);
  } else if (draft.education.trim()) {
    lines.push("", "EDUCATION", draft.education.trim());
  }
  if (resume.projects?.length) {
    lines.push("", "PROJECTS");
    for (const p of resume.projects) {
      lines.push(p.name);
      p.bullets.forEach((b) => lines.push(`• ${b}`));
    }
  }
  if (resume.experience?.length) {
    lines.push("", "EXPERIENCE");
    for (const e of resume.experience) {
      lines.push(e.title);
      e.bullets.forEach((b) => lines.push(`• ${b}`));
    }
  }
  if (resume.certifications?.length) {
    lines.push("", "CERTIFICATIONS", resume.certifications.join(" · "));
  }
  return lines.join("\n");
}

export async function exportResumePdf(resume: Resume, draft: ResumeDraft, roleFocus: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;
  const width = doc.internal.pageSize.getWidth() - margin * 2;

  const addLine = (text: string, size = 11, bold = false, color: [number, number, number] = [24, 24, 27]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const wrapped = doc.splitTextToSize(text, width);
    for (const line of wrapped) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size + 4;
    }
  };

  addLine(draft.name || "Your Name", 20, true);
  addLine([draft.email, draft.phone, draft.github, draft.linkedin].filter(Boolean).join(" · "), 10, false, [82, 82, 91]);
  y += 6;
  addLine(`Target role: ${roleFocus}`, 10, false, [13, 148, 136]);
  y += 10;
  addLine("Summary", 12, true, [13, 148, 136]);
  addLine(resume.summary);
  y += 8;
  addLine("Skills", 12, true, [13, 148, 136]);
  addLine(resume.skills.join(" · "));
  if (resume.education?.length || draft.education.trim()) {
    y += 8;
    addLine("Education", 12, true, [13, 148, 136]);
    if (resume.education?.length) {
      for (const e of resume.education) addLine(`${e.degree} — ${e.details}`);
    } else addLine(draft.education.trim());
  }
  if (resume.projects?.length) {
    y += 8;
    addLine("Projects", 12, true, [13, 148, 136]);
    for (const p of resume.projects) {
      addLine(p.name, 11, true);
      p.bullets.forEach((b) => addLine(`• ${b}`, 10));
    }
  }
  if (resume.experience?.length) {
    y += 8;
    addLine("Experience", 12, true, [13, 148, 136]);
    for (const e of resume.experience) {
      addLine(e.title, 11, true);
      e.bullets.forEach((b) => addLine(`• ${b}`, 10));
    }
  }
  if (resume.certifications?.length) {
    y += 8;
    addLine("Certifications", 12, true, [13, 148, 136]);
    addLine(resume.certifications.join(" · "));
  }
  if (resume.tips?.length) {
    y += 8;
    addLine("ATS tips", 12, true, [13, 148, 136]);
    resume.tips.slice(0, 3).forEach((t) => addLine(`• ${t}`, 10));
  }

  const safeName = (draft.name || "resume").replace(/\s+/g, "-").toLowerCase();
  doc.save(`${safeName}-${roleFocus.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
