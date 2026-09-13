"use client";

import { useRef, useState } from "react";
import { Sparkles, FileText, Briefcase, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";

interface ResumeInputFormProps {
  onSubmit: (resumeText: string, jobDescription: string) => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

const MIN_LENGTH = 50;
const ACCEPTED_FILE_TYPES = ".pdf,.docx,.txt";

export function ResumeInputForm({
  onSubmit,
  disabled,
  errorMessage,
}: ResumeInputFormProps) {
  const { t } = useLanguage();
  const form = t("form");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isResumeMissing = resumeText.trim().length < MIN_LENGTH;
  const isJobDescriptionMissing = jobDescription.trim().length < MIN_LENGTH;
  const canSubmit = !isResumeMissing && !isJobDescriptionMissing && !disabled;

  const validationMessage =
    attempted && (isResumeMissing || isJobDescriptionMissing)
      ? isResumeMissing && isJobDescriptionMissing
        ? form.validationBoth
        : isJobDescriptionMissing
          ? form.validationJob
          : form.validationResume
      : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    onSubmit(resumeText.trim(), jobDescription.trim());
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? form.uploadErrorFallback);
      }

      setResumeText(data.text);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : form.uploadErrorFallback,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{form.cardTitle}</CardTitle>
        <CardDescription>{form.cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {validationMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="resumeText" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {form.resumeLabel}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {form.uploadButton}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <Textarea
                id="resumeText"
                placeholder={form.resumePlaceholder}
                className={cn(
                  "min-h-[280px] resize-y",
                  attempted && isResumeMissing && "border-destructive",
                )}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={disabled || isUploading}
              />
              {uploadError ? (
                <p className="text-xs text-destructive">{uploadError}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {resumeText.trim().length} {form.characters}
                {resumeText.trim().length < MIN_LENGTH
                  ? ` (${form.minimum} ${MIN_LENGTH})`
                  : ""}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="jobDescription"
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                {form.jobLabel}
              </Label>
              <Textarea
                id="jobDescription"
                placeholder={form.jobPlaceholder}
                className={cn(
                  "min-h-[280px] resize-y",
                  attempted && isJobDescriptionMissing && "border-destructive",
                )}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                {jobDescription.trim().length} {form.characters}
                {jobDescription.trim().length < MIN_LENGTH
                  ? ` (${form.minimum} ${MIN_LENGTH})`
                  : ""}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={disabled || isUploading}
          >
            <Sparkles className="h-4 w-4" />
            {form.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
