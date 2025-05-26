"use client";

import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

interface ProcessSubmitButtonProps {
  variant: "process" | "retry";
}

export function ProcessSubmitButton({ variant }: ProcessSubmitButtonProps) {
  const { pending } = useFormStatus();

  if (variant === "retry") {
    return (
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        {pending ? "Processing..." : "Retry"}
      </Button>
    );
  }

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
}
