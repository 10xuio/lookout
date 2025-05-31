import { getTopics } from "@/components/dashboard/topics/actions";
import { getPrompts } from "@/components/dashboard/rankings/actions";
import { TopicStep } from "./topic-step";
import { PromptStep } from "./prompt-step";
import { AnalysisStep } from "./analysis-step";
import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

interface Step {
  id: string;
  number: number;
  title: string;
  isComplete: boolean;
  isActive: boolean;
  isLocked: boolean;
}

export async function Onboarding() {
  const topics = await getTopics();
  const hasTopics = topics.length > 0;

  let firstPromptId: string | null = null;
  let hasPrompts = false;
  let hasAnalysis = false;

  if (hasTopics) {
    const prompts = await getPrompts(topics[0].id);
    hasPrompts = prompts.length > 0;

    if (hasPrompts) {
      firstPromptId = prompts[0].id;
      hasAnalysis = (prompts[0].modelResults?.length ?? 0) > 0;
    }
  }

  if (hasAnalysis) redirect("/dashboard/rankings");

  const steps: Step[] = [
    {
      id: "topic",
      number: 1,
      title: "Add a Topic",
      isComplete: hasTopics,
      isActive: !hasTopics,
      isLocked: false,
    },
    {
      id: "prompt",
      number: 2,
      title: "Create a Prompt",
      isComplete: hasPrompts,
      isActive: hasTopics && !hasPrompts,
      isLocked: !hasTopics,
    },
    {
      id: "analysis",
      number: 3,
      title: "Run an Analysis",
      isComplete: hasAnalysis,
      isActive: hasPrompts && !hasAnalysis,
      isLocked: !hasPrompts,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-8">
          <StepContainer step={steps[0]} isLastStep={false}>
            <TopicStep />
          </StepContainer>

          <StepContainer step={steps[1]} isLastStep={false}>
            {hasTopics && <PromptStep topicId={topics[0].id} />}
          </StepContainer>

          <StepContainer step={steps[2]} isLastStep={true}>
            {firstPromptId && <AnalysisStep promptId={firstPromptId} />}
          </StepContainer>
        </div>
      </div>
    </div>
  );
}

function StepContainer({
  step,
  children,
  isLastStep,
}: {
  step: Step;
  children?: React.ReactNode;
  isLastStep: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          "bg-background rounded-xl border transition-all duration-300",
          step.isActive && "shadow-lg shadow-primary/10",
          step.isComplete && "opacity-90",
          step.isLocked && "opacity-50"
        )}
      >
        <div className="flex items-center gap-4 p-6">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all",
              step.isComplete
                ? "bg-green-600 text-white"
                : step.isActive
                ? "bg-primary/10 text-primary border"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step.isComplete ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : step.isLocked ? (
              <Lock className="h-5 w-5" />
            ) : (
              <span className="font-semibold">{step.number}</span>
            )}
          </div>
          <div className="flex-1">
            <h3
              className={cn(
                "font-semibold text-lg",
                step.isLocked && "text-muted-foreground"
              )}
            >
              {step.title}
            </h3>
          </div>
          {step.isComplete && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Completed
            </div>
          )}
        </div>

        {children && !step.isComplete && !step.isLocked && (
          <div
            className={cn(
              "p-6 border-t",
              step.isLocked && "pointer-events-none"
            )}
          >
            {children}
          </div>
        )}
      </div>

      {!isLastStep && (
        <div className="absolute left-7 top-full h-8 w-0.5 bg-border" />
      )}
    </div>
  );
}
