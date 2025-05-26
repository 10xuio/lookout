"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProcessButtonProps {
  promptId: string;
  status: string;
}

export function ProcessButton({ promptId, status }: ProcessButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleProcess = async () => {
    try {
      setIsProcessing(true);

      const response = await fetch("/api/prompts/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to process prompt");
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to process prompt:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "completed") {
    return (
      <Button variant="outline" size="sm" disabled>
        Completed
      </Button>
    );
  }

  if (status === "processing" || isProcessing) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Processing
      </Button>
    );
  }

  if (status === "failed") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleProcess}
        disabled={isProcessing}
      >
        Retry
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleProcess}
      disabled={isProcessing}
    >
      Process
    </Button>
  );
}
