import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <header className="border-b bg-gradient-to-b from-primary/5 to-transparent">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center sm:py-20">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI Resume Optimizer
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          Pass automated job screening in 30 seconds
        </h1>
        <p className="max-w-2xl text-balance text-muted-foreground sm:text-lg">
          Paste your resume and the job description. Our AI rewrites the
          content with the right keywords to maximize your compatibility
          with ATS systems — and generates a PDF ready to send.
        </p>
      </div>
    </header>
  );
}
