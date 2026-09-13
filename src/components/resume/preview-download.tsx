"use client";

import { useState } from "react";
import { Download, FileText, Loader2, RotateCcw, Zap, CheckCircle2, Lock } from "lucide-react";
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
import { useLanguage } from "@/components/language-provider";

interface PreviewDownloadProps {
  resume: OptimizedResume;
  freeOptimizationsLeft: number;
  isSubscribed: boolean;
  onStartOver: () => void;
}

export function PreviewDownload({
  resume,
  freeOptimizationsLeft,
  isSubscribed,
  onStartOver,
}: PreviewDownloadProps) {
  const { language, t } = useLanguage();
  const preview = t("preview");
  const [themeColor, setThemeColor] = useState<ThemeColorKey>("blue");
  const [templateId, setTemplateId] = useState<ResumeTemplateKey>("classic");
  const [downloadingFormat, setDownloadingFormat] = useState<"pdf" | "docx" | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isPremiumTemplateLocked = RESUME_TEMPLATES[templateId].isPremium && !isSubscribed;

  const handleSubscribe = async () => {
    setIsRedirecting(true);
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? preview.checkoutFailFallback);
      }
      window.location.href = data.url;
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : preview.checkoutFailFallback,
      );
      setIsRedirecting(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsRedirecting(true);
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? preview.billingFailFallback);
      }
      window.location.href = data.url;
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : preview.billingFailFallback,
      );
      setIsRedirecting(false);
    }
  };

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
              variant="outline"
              className="w-full"
              onClick={onStartOver}
            >
              <RotateCcw className="h-4 w-4" />
              {preview.optimizeAnother}
            </Button>
            {downloadError ? (
              <p className="text-sm text-destructive">{downloadError}</p>
            ) : null}
          </div>

          <Alert className="border-primary/30 bg-primary/5">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle className="flex items-center gap-2">
              {isSubscribed
                ? preview.unlimitedActive
                : freeOptimizationsLeft > 0
                  ? preview.freeLeft(freeOptimizationsLeft)
                  : preview.freeLimitReached}
              <Badge variant="secondary">{preview.planBadge}</Badge>
            </AlertTitle>
            <AlertDescription>
              {isSubscribed ? (
                <>
                  {preview.subscribedDescription}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={handleManageSubscription}
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {preview.manageSubscription}
                  </Button>
                </>
              ) : (
                <>
                  {preview.unsubscribedDescription}{" "}
                  <span className="font-semibold text-foreground">
                    $4.99/month
                  </span>
                  .
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={handleSubscribe}
                    disabled={isRedirecting}
                  >
                    {isRedirecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {preview.subscribeButton}
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
