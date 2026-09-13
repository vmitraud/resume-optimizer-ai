import { z } from "zod";
import { LANGUAGES, Language } from "@/lib/language";

const languageSchema = z
  .enum(Object.keys(LANGUAGES) as [Language, ...Language[]])
  .default("en");

export const personalInfoSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  linkedin: z.string(),
  location: z.string(),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  bulletPoints: z.array(z.string()),
});

export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
});

export const optimizedResumeSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: z.string(),
  skills: z.array(z.string()),
  experiences: z.array(experienceSchema),
  education: z.array(educationSchema),
  atsScoreEstimate: z.number().min(0).max(100),
  matchAnalysis: z.array(z.string()),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type OptimizedResume = z.infer<typeof optimizedResumeSchema>;

export const optimizeRequestSchema = z.object({
  resumeText: z.string().min(50, "Paste the full text of your resume."),
  jobDescription: z.string().min(50, "Paste the full text of the job description."),
  language: languageSchema,
});

export type OptimizeRequest = z.infer<typeof optimizeRequestSchema>;

export const THEME_COLORS = {
  slate: "#334155",
  blue: "#2563eb",
  emerald: "#059669",
  violet: "#7c3aed",
  rose: "#e11d48",
} as const;

export type ThemeColorKey = keyof typeof THEME_COLORS;

export const RESUME_TEMPLATES = {
  classic: { name: "Classic", isPremium: false },
  modern: { name: "Modern", isPremium: true },
  minimal: { name: "Minimal", isPremium: true },
} as const;

export type ResumeTemplateKey = keyof typeof RESUME_TEMPLATES;

export const pdfRequestSchema = z.object({
  resume: optimizedResumeSchema,
  themeColor: z.enum(
    Object.keys(THEME_COLORS) as [ThemeColorKey, ...ThemeColorKey[]],
  ),
  templateId: z
    .enum(Object.keys(RESUME_TEMPLATES) as [ResumeTemplateKey, ...ResumeTemplateKey[]])
    .default("classic"),
  language: languageSchema,
});

export type PdfRequest = z.infer<typeof pdfRequestSchema>;

export const docxRequestSchema = z.object({
  resume: optimizedResumeSchema,
  themeColor: z.enum(
    Object.keys(THEME_COLORS) as [ThemeColorKey, ...ThemeColorKey[]],
  ),
  language: languageSchema,
});

export type DocxRequest = z.infer<typeof docxRequestSchema>;
