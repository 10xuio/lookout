import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePromptForm } from "./create-prompt-form";
import { Separator } from "@/components/ui/separator";
import { SuggestionsList } from "../dashboard";

interface PromptStepProps {
  topicId: string;
}

export function PromptStep({ topicId }: PromptStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Suggested Prompts</h3>
        <Suspense fallback={<SuggestionsSkeleton />}>
          <SuggestionsList topicId={topicId} count={2} />
        </Suspense>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
          OR
        </span>
      </div>

      <CreatePromptForm topicId={topicId} />
    </div>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-17 w-full rounded" />
      <Skeleton className="h-17 w-full rounded" />
    </div>
  );
}
