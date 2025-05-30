import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePromptForm } from "./create-prompt-form";
import { Bot } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SuggestionsList } from "../dashboard/";

interface PromptStepProps {
  topicId: string;
  isComplete?: boolean;
}

export function PromptStep({ topicId, isComplete = false }: PromptStepProps) {
  if (isComplete) {
    return (
      <div className="text-center space-y-1">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Prompt Created</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your tracking prompt has been set up successfully
        </p>
      </div>
    );
  }

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

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Create Custom Prompt</h3>
        <CreatePromptForm topicId={topicId} />
      </div>
    </div>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
