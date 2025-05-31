"use client";

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Status } from "@/types/prompt";

function ProcessMentionsButton({ topicId }: { topicId?: string }) {
  const [currentStatus, setCurrentStatus] = useState<Status>("pending");

  const handleProcess = async () => {
    try {
      setCurrentStatus("processing");

      const response = await fetch("/api/analyze-mentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to process mentions");
      }

      toast.success("Mentions refresh started, this may take a few minutes");
      setCurrentStatus("completed");
    } catch (error) {
      console.error("Failed to process mentions:", error);
      toast.error("Failed to process mentions");
      setCurrentStatus("failed");
    }
  };

  if (currentStatus === "processing") {
    return (
      <Button aria-label="Processing" variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
      </Button>
    );
  }

  if (currentStatus === "failed") {
    return (
      <Button
        aria-label="Retry"
        variant="outline"
        size="sm"
        onClick={handleProcess}
      >
        <RotateCcw className="h-4 w-4" /> Retry
      </Button>
    );
  }

  return (
    <Button
      aria-label="Process mentions"
      variant="outline"
      size="sm"
      onClick={handleProcess}
    >
      <RefreshCw className="h-4 w-4" /> Process Mentions
    </Button>
  );
}

export function MentionsToolbar({ topicId }: { topicId?: string }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <ProcessMentionsButton topicId={topicId} />
    </div>
  );
}
