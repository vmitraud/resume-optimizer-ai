"use client";

import { useState } from "react";
import { Download, FileText, Loader2, RotateCcw, CheckCircle2, Lock, Globe } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OptimizedResume,
  THEME_COLORS,
  ThemeColorKey,
  RESUME_TEMPLATES,
  ResumeTemplateKey,
} from "@/lib/schema";
import { ResumePreview } from "@/components/resume/resume-preview";
import { PlanStatusCard } from "@/components/resume/plan-status-card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { LANGUAGES, Language } from "@/lib/language";

interface PreviewDownloadProps {
  resume: OptimizedResume;
  freeOptimizationsLeft: number;
  isSubscribed: boolean;
  onStartOver: () => void;
  onRegenerateLanguage: (language: Language) => void;
  isTranslating: boolean;
  translateError: string | null;
}

export function PreviewDownload({
  resume,
  freeOptimizationsLeft,
  isSubscribed,
  onStartOver,
  onRegenerateLanguage,
  isTranslating,
  translateError,
}: PreviewDownloadProps) {
  const { language, t } = useLanguage();
  const preview = t("preview");
  const [themeColor, setThemeColor] = useState<ThemeColorKey>("blue");
  const [templateId, setTemplateId] = useState<ResumeTemplateKey>("classic");
  const [downloadingFormat, setDownloadingFormat] = useState<"pdf" | "docx" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const isPremiumTemplateLocked = RESUME_TEMPLATES[templateId].isPremium && !isSubscribed;

  const downloadFile = async (blob: Blob, extension: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(resume.personalInfo.fullName || "resume")
      .toLowerCase()
      .replace(/\s+/g, "-")}-optimized.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (isPremiumTemplateLocked) {
      setDownloadError(preview.templateLockedFallback(RESUME_TEMPLATES[templateId].name));
      return;
    }

    setDownloadingFormat("pdf");
    setDownloadError(null);
    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, themeColor, templateId, language }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? preview.pdfFailFallback);
      }

      await downloadFile(await response.blob(), "pdf");
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : preview.pdfFailFallback,
      );
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadDocx = async () => {
    if (!isSubscribed) {
      setDownloadError(preview.docxLockedFallback);
      return;
    }

    setDownloadingFormat("docx");
    setDownloadError(null);
    try {
      const response = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, themeColor, language }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? preview.docxFailFallback);
      }

      await downloadFile(await response.blob(), "docx");
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : preview.docxFailFallback,
      );
    } finally {
      setDownloadingFormat(null);
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
                {preview.atsTitle}
              </CardTitle>
              <CardDescription>{preview.atsDescription}</CardDescription>
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
                <p className="text-sm font-medium">{preview.whatWasImproved}</p>
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
              <CardTitle className="text-base">{preview.templateCardTitle}</CardTitle>
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
                        "relative flex flex-col items-center gap-1 rounded-md border px-2 py-2.5 text-xs font-medium transition-all",
                        templateId === key
                          ? "border-foreground bg-accent shadow-sm"
                          : "border-border hover:border-foreground/30 hover:bg-accent/50 hover:shadow-sm",
                      )}
                    >
                      {template.isPremium && !isSubscribed ? (
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
              <CardTitle className="text-base">{preview.colorCardTitle}</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{preview.languageCardTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={language}
                onValueChange={(value) => onRegenerateLanguage(value as Language)}
                disabled={isTranslating}
              >
                <SelectTrigger className="w-full">
                  {isTranslating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Globe className="h-3.5 w-3.5" />
                  )}
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
              {translateError ? (
                <p className="mt-2 text-xs text-destructive">{translateError}</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full"
              onClick={handleDownloadPdf}
              disabled={downloadingFormat !== null}
            >
              {downloadingFormat === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPremiumTemplateLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isPremiumTemplateLocked ? preview.unlockToDownload : preview.downloadPdf}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadDocx}
              disabled={downloadingFormat !== null}
            >
              {downloadingFormat === "docx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : !isSubscribed ? (
                <Lock className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isSubscribed ? preview.downloadDocx : preview.downloadDocxPro}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onStartOver}
            >
              <RotateCcw className="h-4 w-4" />
              {preview.optimizeAnother}
            </Button>
            {downloadError ? (
              <p className="text-sm text-destructive">{downloadError}</p>
            ) : null}
          </div>

          <PlanStatusCard
            freeOptimizationsLeft={freeOptimizationsLeft}
            isSubscribed={isSubscribed}
          />
        </div>
      </div>
    </div>
  );
}
