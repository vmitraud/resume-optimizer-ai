"use client";

import { useEffect, useState } from "react";
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = window.localStorage.getItem(USAGE_STORAGE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    fetch("/api/subscription-status")
      .then((res) => res.json())
      .then((data) => setIsSubscribed(Boolean(data?.isSubscribed)))
      .catch(() => setIsSubscribed(false));

    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success") {
      setCheckoutNotice("You're subscribed! Unlimited optimizations and all templates are now unlocked.");
    } else if (checkout === "error") {
      setCheckoutNotice("We couldn't confirm your payment. If you were charged, please contact support.");
    } else if (checkout === "cancelled") {
      setCheckoutNotice(null);
    }
    if (checkout) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const freeOptimizationsLeft = Math.max(
    0,
    FREE_OPTIMIZATIONS_LIMIT - usageCount,
  );

  const handleSubmit = async (resumeText: string, jobDescription: string) => {
    if (!isSubscribed && freeOptimizationsLeft <= 0) {
      setError(
        "You've used all your free optimizations. Upgrade to the Unlimited Plan to keep going.",
      );
      return;
    }

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

      if (!isSubscribed) {
        const nextCount = usageCount + 1;
        setUsageCount(nextCount);
        try {
          window.localStorage.setItem(USAGE_STORAGE_KEY, String(nextCount));
        } catch {
          // ignore failure to persist usage count
        }
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

  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />
      <main className="flex flex-1 flex-col justify-center px-4 py-10 sm:py-14">
        {checkoutNotice ? (
          <div className="mx-auto mb-6 w-full max-w-4xl rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            {checkoutNotice}
          </div>
        ) : null}
        {step === "input" ? (
          <ResumeInputForm onSubmit={handleSubmit} errorMessage={error} />
        ) : null}
        {step === "loading" ? <LoadingState /> : null}
        {step === "result" && resume ? (
          <PreviewDownload
            resume={resume}
            freeOptimizationsLeft={freeOptimizationsLeft}
            isSubscribed={isSubscribed}
            onStartOver={handleStartOver}
          />
        ) : null}
      </main>
    </div>
  );
}
