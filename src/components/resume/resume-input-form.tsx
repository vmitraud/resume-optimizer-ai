"use client";

import { useRef, useState } from "react";
import {
  Sparkles,
  FileText,
  Briefcase,
  Upload,
  Loader2,
  Pencil,
  X,
  CheckCircle2,
} from "lucide-react";
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
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function ResumeInputForm({
  onSubmit,
  disabled,
  errorMessage,
}: ResumeInputFormProps) {
  const { t } = useLanguage();
  const form = t("form");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const uploadFile = async (file: File) => {
    const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    if (!hasAcceptedExtension) {
      setUploadError(form.uploadErrorFallback);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        throw new Error(data?.error ?? form.uploadErrorFallback);
      }

      setResumeText(data.text);
      setUploadedFile({ name: file.name, size: file.size });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : form.uploadErrorFallback,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) uploadFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setResumeText("");
    setUploadError(null);
  };

  const handleEditFile = () => {
    setUploadedFile(null);
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

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!disabled && !isUploading) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className="relative"
              >
                {uploadedFile ? (
                  <div
                    className={cn(
                      "flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed bg-accent/30 p-6 text-center transition-colors",
                      attempted && isResumeMissing && "border-destructive",
                    )}
                  >
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium break-all">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.size)} · {form.fileExtracted}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleEditFile}
                        disabled={disabled}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {form.editFile}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={disabled}
                      >
                        <X className="h-3.5 w-3.5" />
                        {form.removeFile}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Textarea
                      id="resumeText"
                      placeholder={form.resumePlaceholder}
                      className={cn(
                        "min-h-[280px] resize-y rounded-lg bg-muted/30 shadow-inner transition-colors",
                        isDragging && "border-primary bg-primary/5",
                        attempted && isResumeMissing && "border-destructive",
                      )}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      disabled={disabled || isUploading}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {form.dropHint}
                    </p>
                  </>
                )}
                {isDragging && !uploadedFile ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                ) : null}
              </div>

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
                  "min-h-[280px] resize-y rounded-lg bg-muted/30 shadow-inner transition-colors",
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
