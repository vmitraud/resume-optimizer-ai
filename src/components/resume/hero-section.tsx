"use client";

import { Sparkles, Lock } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LANGUAGES, Language } from "@/lib/language";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountMenu } from "@/components/account-menu";

interface HeroSectionProps {
  isSubscribed: boolean;
}

export function HeroSection({ isSubscribed }: HeroSectionProps) {
  const { language, setLanguage, t } = useLanguage();
  const hero = t("hero");

  return (
    <header>
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">{hero.badge}</span>
          </div>
          <div className="flex items-center gap-3">
            <AccountMenu />
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
                    <span className="flex items-center gap-1.5">
                      {LANGUAGES[key].label}
                      {key !== "en" && !isSubscribed ? (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      ) : null}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center sm:py-16">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg">
            {hero.description}
          </p>
        </div>
      </div>
    </header>
  );
}
