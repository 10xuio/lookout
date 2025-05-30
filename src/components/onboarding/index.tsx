import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Suspense } from "react";
import { getTopics } from "@/components/dashboard/topics/actions";
import { StepIndicator } from "./step-indicator";
import { TopicStep } from "./topic-step";
import { PromptStep } from "./prompt-step";
import { AnalysisStep } from "./analysis-step";
import { Skeleton } from "@/components/ui/skeleton";

export async function Onboarding() {
  const topics = await getTopics();
  const hasTopics = topics.length > 0;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to AISEO</h1>
        <p className="text-muted-foreground">
          Let&apos;s get you started with your first SEO analysis in 3 simple
          steps
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <StepIndicator currentStep={hasTopics ? 2 : 1} />
        </CardHeader>
        <CardContent className="space-y-8">
          {!hasTopics ? (
            <Suspense fallback={<OnboardingSkeleton />}>
              <TopicStep />
            </Suspense>
          ) : (
            <Suspense fallback={<OnboardingSkeleton />}>
              <OnboardingWithTopic topicId={topics[0].id} />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function OnboardingWithTopic({ topicId }: { topicId: string }) {
  const { getPrompts } = await import(
    "@/components/dashboard/rankings/actions"
  );
  const prompts = await getPrompts(topicId);
  const hasPrompts = prompts.length > 0;

  if (!hasPrompts) {
    return <PromptStep topicId={topicId} />;
  }

  return <AnalysisStep promptId={prompts[0].id} />;
}

function OnboardingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
