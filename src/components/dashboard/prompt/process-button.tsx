"use client";

import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Status } from "@/types/prompt";

interface ProcessButtonProps {
  promptId: string;
  status: Status;
}

export function ProcessButton({ promptId, status }: ProcessButtonProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const router = useRouter();

  useEffect(() => {
    if (currentStatus !== "processing") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/prompts/${promptId}/status`);
        if (response.ok) {
          const data = await response.json();

          if (data.status !== currentStatus) {
            setCurrentStatus(data.status);
          }

          if (data.status !== "processing") {
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
    } catch (error) {
      console.error("Failed to process prompt:", error);
      setCurrentStatus("failed");
    }
  };

  if (currentStatus === "processing") {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (currentStatus === "failed") {
    return (
      <Button variant="outline" size="sm" onClick={handleProcess}>
        <RotateCcw className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleProcess}>
      <Search className="h-4 w-4" />
    </Button>
  );
}
