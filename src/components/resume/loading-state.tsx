"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language-provider";

export function LoadingState() {
  const { t } = useLanguage();
  const loading = t("loading");
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loading.messages.length);
    }, 2200);

    const progressTimer = setInterval(() => {
      setProgress((prev) => (prev >= 92 ? 92 : prev + Math.random() * 6));
    }, 500);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-medium transition-all">
            {loading.messages[messageIndex]}
          </p>
          <p className="text-sm text-muted-foreground">
            {loading.duration}
          </p>
        </div>
        <div className="w-full max-w-sm">
          <Progress value={progress} />
        </div>

        <div className="mt-4 grid w-full gap-3 text-left">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}
