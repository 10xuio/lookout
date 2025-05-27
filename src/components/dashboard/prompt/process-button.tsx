"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@/types/prompt";

interface ProcessButtonProps {
  promptId: string;
  status: Status;
}

export function ProcessButton({ promptId, status }: ProcessButtonProps) {
  const [isProcessing, setIsProcessing] = useState(status === "processing");
  const [currentStatus, setCurrentStatus] = useState(status);
  const router = useRouter();

  useEffect(() => {
    if (currentStatus !== "processing") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/status`);
        if (response.ok) {
          const data = await response.json();
          setCurrentStatus(data.status);

          if (data.status !== "processing") {
            setIsProcessing(false);
            router.refresh();
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Failed to poll status:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentStatus, promptId, router]);

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      setCurrentStatus("processing");

      const response = await fetch("/api/prompts/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to process prompt");
      }
      console.log(data.message);
    } catch (error) {
      console.error("Failed to process prompt:", error);
      setIsProcessing(false);
      setCurrentStatus("failed");
    }
  };

  if (currentStatus === "completed") {
    return (
      <Button variant="outline" size="sm" disabled>
        Completed
      </Button>
    );
  }

  if (currentStatus === "processing" || isProcessing) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Processing
      </Button>
    );
  }

  if (currentStatus === "failed") {
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
