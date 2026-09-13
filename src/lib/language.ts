export const LANGUAGES = {
  en: { label: "English", aiName: "English" },
  pt: { label: "Português", aiName: "Portuguese" },
  de: { label: "Deutsch", aiName: "German" },
} as const;

export type Language = keyof typeof LANGUAGES;

export const LANGUAGE_STORAGE_KEY = "resume-optimizer:language";
