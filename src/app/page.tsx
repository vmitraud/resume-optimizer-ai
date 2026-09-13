"use client";

import { useState } from "react";
import { HeroSection } from "@/components/resume/hero-section";
import { ResumeInputForm } from "@/components/resume/resume-input-form";
import { LoadingState } from "@/components/resume/loading-state";
import { PreviewDownload } from "@/components/resume/preview-download";
import { OptimizedResume } from "@/lib/schema";
import { FREE_OPTIMIZATIONS_LIMIT, USAGE_STORAGE_KEY } from "@/lib/constants";

type Step = "input" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<OptimizedResume | null>(null);
  const [usageCount, setUsageCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = window.localStorage.getItem(USAGE_STORAGE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const handleSubmit = async (resumeText: string, jobDescription: string) => {
    setError(null);
    setStep("loading");

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Error optimizing the resume.");
      }

      setResume(data.resume);
      setStep("result");

      const nextCount = usageCount + 1;
      setUsageCount(nextCount);
      try {
        window.localStorage.setItem(USAGE_STORAGE_KEY, String(nextCount));
      } catch {
        // ignore failure to persist usage count
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error optimizing the resume.",
      );
      setStep("input");
    }
  };

  const handleStartOver = () => {
    setResume(null);
    setError(null);
    setStep("input");
  };

  const freeOptimizationsLeft = Math.max(
    0,
    FREE_OPTIMIZATIONS_LIMIT - usageCount,
  );

  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />
      <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:py-14">
        {step === "input" ? (
          <ResumeInputForm onSubmit={handleSubmit} errorMessage={error} />
        ) : null}
        {step === "loading" ? <LoadingState /> : null}
        {step === "result" && resume ? (
          <PreviewDownload
            resume={resume}
            freeOptimizationsLeft={freeOptimizationsLeft}
            onStartOver={handleStartOver}
          />
        ) : null}
      </main>
    </div>
  );
}
