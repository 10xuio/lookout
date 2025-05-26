"use client";

import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
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
    if (status !== "pending") return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/prompts/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process prompt");
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error("Error processing prompt:", error);
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

  if (status === "processing") {
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
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        Retry
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleProcess}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Play className="h-4 w-4 mr-2" />
      )}
      Process
    </Button>
  );
}
