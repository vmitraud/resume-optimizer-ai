"use client";

import { useState } from "react";
import { Download, Loader2, RotateCcw, Zap, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  OptimizedResume,
  THEME_COLORS,
  ThemeColorKey,
  RESUME_TEMPLATES,
  ResumeTemplateKey,
} from "@/lib/schema";
import { ResumePreview } from "@/components/resume/resume-preview";
import { cn } from "@/lib/utils";

interface PreviewDownloadProps {
  resume: OptimizedResume;
  freeOptimizationsLeft: number;
  onStartOver: () => void;
}

export function PreviewDownload({
  resume,
  freeOptimizationsLeft,
  onStartOver,
}: PreviewDownloadProps) {
  const [themeColor, setThemeColor] = useState<ThemeColorKey>("blue");
  const [templateId, setTemplateId] = useState<ResumeTemplateKey>("classic");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const isPremiumTemplateSelected = RESUME_TEMPLATES[templateId].isPremium;

  const handleDownload = async () => {
    if (isPremiumTemplateSelected) {
      setDownloadError(
        `The ${RESUME_TEMPLATES[templateId].name} template requires the Unlimited Plan.`,
      );
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, themeColor, templateId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to generate the PDF.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(resume.personalInfo.fullName || "resume")
        .toLowerCase()
        .replace(/\s+/g, "-")}-optimized.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Failed to generate the PDF.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <ResumePreview resume={resume} themeColor={themeColor} templateId={templateId} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ATS Compatibility
              </CardTitle>
              <CardDescription>
                Estimated match against the provided job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">
                  {resume.atsScoreEstimate}
                </span>
                <span className="pb-1 text-muted-foreground">/ 100</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">What was improved:</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {resume.matchAnalysis.map((item, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(RESUME_TEMPLATES) as ResumeTemplateKey[]).map((key) => {
                  const template = RESUME_TEMPLATES[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTemplateId(key)}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                        templateId === key
                          ? "border-foreground bg-accent"
                          : "border-border hover:bg-accent/50",
                      )}
                    >
                      {template.isPremium ? (
                        <Lock className="absolute top-1 right-1 h-3 w-3 text-muted-foreground" />
                      ) : null}
                      {template.name}
                      {template.isPremium ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Pro
                        </Badge>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(THEME_COLORS) as ThemeColorKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setThemeColor(key)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform",
                      themeColor === key
                        ? "scale-110 border-foreground"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: THEME_COLORS[key] }}
                    aria-label={`${key} theme`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPremiumTemplateSelected ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isPremiumTemplateSelected
                ? "Unlock to Download"
                : "Download Optimized PDF"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={onStartOver}
            >
              <RotateCcw className="h-4 w-4" />
              Optimize another resume
            </Button>
            {downloadError ? (
              <p className="text-sm text-destructive">{downloadError}</p>
            ) : null}
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle className="flex items-center gap-2">
              {freeOptimizationsLeft > 0
                ? `${freeOptimizationsLeft} free optimization${freeOptimizationsLeft === 1 ? "" : "s"} left`
                : "Free limit reached"}
              <Badge variant="secondary">Unlimited Plan</Badge>
            </AlertTitle>
            <AlertDescription>
              Unlock unlimited optimizations, more templates, and priority
              processing for{" "}
              <span className="font-semibold text-foreground">
                $4.99/week
              </span>
              .
              <Button size="sm" className="mt-3 w-full">
                Subscribe to Unlimited Plan
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
