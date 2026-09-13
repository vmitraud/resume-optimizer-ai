"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LANGUAGES, Language } from "@/lib/language";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function HeroSection() {
  const { language, setLanguage, t } = useLanguage();
  const hero = t("hero");

  return (
    <header className="relative border-b bg-gradient-to-b from-primary/5 to-transparent">
      <div className="absolute top-4 right-4">
        <Select
          value={language}
          onValueChange={(value) => setLanguage(value as Language)}
        >
          <SelectTrigger size="sm" aria-label="Language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(LANGUAGES) as Language[]).map((key) => (
              <SelectItem key={key} value={key}>
                {LANGUAGES[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center sm:py-20">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {hero.badge}
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          {hero.title}
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg">
          {hero.description}
        </p>
      </div>
    </header>
  );
}
