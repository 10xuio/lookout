"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AnalysisStepProps {
  promptId: string;
}

export function AnalysisStep({ promptId }: AnalysisStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  async function handleAnalysis() {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/prompts/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to start analysis");
      }

      toast.success("Analysis started! This may take a few minutes.");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard/rankings");
      }, 2000);
    } catch (error) {
      console.error("Failed to start analysis:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start analysis"
      );
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Ready to Analyze!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Click the button below to start your first SEO analysis. We&apos;ll
          check how your brand appears across different AI models.
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-4">
        <Button
          onClick={handleAnalysis}
          disabled={isProcessing}
          size="lg"
          className="w-full h-12"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Starting Analysis...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Start Analysis
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Analysis typically takes 2-3 minutes to complete
        </p>
      </div>
    </div>
  );
}
