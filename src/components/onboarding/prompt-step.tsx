import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PromptSuggestions } from "./prompt-suggestions";
import { CreatePromptForm } from "./create-prompt-form";
import { Bot } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PromptStepProps {
  topicId: string;
}

export function PromptStep({ topicId }: PromptStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Create Your First Prompt</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Choose a suggested prompt or create your own to track SEO performance
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Suggested Prompts</h3>
          <Suspense fallback={<SuggestionsSkeleton />}>
            <PromptSuggestions topicId={topicId} />
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
