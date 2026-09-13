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
        ? "Please paste or upload your resume and add the job description so we can compare them and optimize your resume."
        : isJobDescriptionMissing
          ? "Please add the job description so we can compare it with your resume and optimize it."
          : "Please paste or upload your resume before optimizing."
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
        throw new Error(data?.error ?? "Could not read this file.");
      }

      setResumeText(data.text);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Could not read this file.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Paste your details below</CardTitle>
        <CardDescription>
          The more complete the text, the better the optimization. No need
          to format it — just paste the content.
        </CardDescription>
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
                  Current Resume
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
                  Upload file
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
                placeholder="Paste the full text of your current resume here, or upload a PDF, DOCX, or TXT file..."
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
                {resumeText.trim().length} characters
                {resumeText.trim().length < MIN_LENGTH
                  ? ` (minimum ${MIN_LENGTH})`
                  : ""}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="jobDescription"
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the full text of the target job description here..."
                className={cn(
                  "min-h-[280px] resize-y",
                  attempted && isJobDescriptionMissing && "border-destructive",
                )}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                {jobDescription.trim().length} characters
                {jobDescription.trim().length < MIN_LENGTH
                  ? ` (minimum ${MIN_LENGTH})`
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
            Optimize My Resume with AI
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
