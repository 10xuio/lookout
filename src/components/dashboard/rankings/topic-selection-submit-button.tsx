"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function TopicSelectionSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="flex-1" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating Suggestions...
        </>
      ) : (
        <>
          <ArrowRight className="h-4 w-4 mr-2" />
          Generate Suggestions
        </>
      )}
    </Button>
  );
}
