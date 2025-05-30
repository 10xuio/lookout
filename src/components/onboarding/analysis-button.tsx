"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AnalysisButtonProps {
  promptId: string;
}

export function AnalysisButton({ promptId }: AnalysisButtonProps) {
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
      setTimeout(() => router.push("/dashboard/rankings"), 2000);
    } catch (error) {
      console.error("Failed to start analysis:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start analysis"
      );
      setIsProcessing(false);
    }
  }

  return (
    <Button
      onClick={handleAnalysis}
      disabled={isProcessing}
      size="lg"
      className="w-full h-12"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Starting analysis for your topic...
        </>
      ) : (
        <>
          <Search className="h-4 w-4 mr-2 capitalize" />
          Start analysis for your topic
        </>
      )}
    </Button>
  );
}
