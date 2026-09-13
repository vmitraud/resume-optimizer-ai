"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/components/language-provider";

interface PlanStatusCardProps {
  freeOptimizationsLeft: number;
  isSubscribed: boolean;
  className?: string;
}

export function PlanStatusCard({
  freeOptimizationsLeft,
  isSubscribed,
  className,
}: PlanStatusCardProps) {
  const { t } = useLanguage();
  const preview = t("preview");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setIsRedirecting(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? preview.checkoutFailFallback);
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : preview.checkoutFailFallback);
      setIsRedirecting(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsRedirecting(true);
    setError(null);
    try {
      const response = await fetch("/api/billing-portal", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? preview.billingFailFallback);
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : preview.billingFailFallback);
      setIsRedirecting(false);
    }
  };

  return (
    <Alert className={`border-primary/30 bg-primary/5 ${className ?? ""}`}>
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
              {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {preview.manageSubscription}
            </Button>
          </>
        ) : (
          <>
            {preview.unsubscribedDescription}{" "}
            <span className="font-semibold text-foreground">$2.99/month</span>.
            <Button
              size="sm"
              className="mt-3 w-full"
              onClick={handleSubscribe}
              disabled={isRedirecting}
            >
              {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {preview.subscribeButton}
            </Button>
          </>
        )}
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </AlertDescription>
    </Alert>
  );
}
