import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { Suspense } from "react";
import {
  generatePromptSuggestions,
  type PromptSuggestion,
} from "@/lib/suggestions";
import { getTopics } from "../topics/actions";
import { createPrompt } from "./actions";
import { revalidatePath } from "next/cache";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopicSelectionSubmitButton } from "./topic-selection-submit-button";

interface SuggestionsDialogProps {
  children: React.ReactNode;
  topicId?: string;
}

async function fetchSuggestions(topicId?: string): Promise<PromptSuggestion[]> {
  "use server";

  try {
    if (topicId) {
      // Get topic details to provide context
      const topics = await getTopics();
      const topic = topics.find((t) => t.id === topicId);

      if (topic) {
        return await generatePromptSuggestions(
          topic.name,
          topic.description || undefined
        );
      }
    }

    // Fallback: generate generic suggestions
    return await generatePromptSuggestions("SEO and Marketing Analysis");
  } catch (error) {
    console.error("Failed to generate suggestions:", error);

    // Fallback to some default suggestions if AI fails
    return [
      {
        id: "fallback_1",
        content: "best project management software",
        description:
          "Analyze top project management tools and their market positioning",
      },
      {
        id: "fallback_2",
        content: "affordable web hosting providers",
        description:
          "Compare budget-friendly hosting services and their competitive landscape",
      },
      {
        id: "fallback_3",
        content: "small business accounting software",
        description:
          "Research accounting solutions targeting small business market",
      },
      {
        id: "fallback_4",
        content: "email marketing platforms comparison",
        description:
          "Analyze email marketing tools and their competitive strategies",
      },
      {
        id: "fallback_5",
        content: "CRM software for startups",
        description: "Explore CRM solutions designed for early-stage companies",
      },
    ];
  }
}

function SuggestionsListSkeleton() {
  return (
    <div className="space-y-3 mr-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-3 rounded-lg border bg-card"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-1 shrink-0">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function TopicSelectionStep() {
  const topics = await getTopics();

  async function handleTopicSelection(formData: FormData) {
    "use server";
    const selectedTopicId = formData.get("topicId") as string;
    if (selectedTopicId) {
      // Redirect to the same page with the selected topic
      const { redirect } = await import("next/navigation");
      redirect(`/dashboard/prompts?topicId=${selectedTopicId}`);
    }
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No topics available. Create a topic first to get personalized prompt
          suggestions.
        </p>
        <p className="text-sm text-muted-foreground">
          Or we can show you general SEO and marketing suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Select a topic to get personalized prompt suggestions, or continue for
          general suggestions.
        </p>
      </div>

      <form action={handleTopicSelection} className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="topicId" className="text-sm font-medium">
            Choose a topic for personalized suggestions:
          </label>
          <Select name="topicId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a topic..." />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <TopicSelectionSubmitButton />
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
    </div>
  );
}

async function SuggestionsList({ topicId }: { topicId?: string }) {
  const suggestions = await fetchSuggestions(topicId);

  async function handleAccept(suggestion: PromptSuggestion) {
    "use server";

    try {
      if (!topicId) {
        console.error("No topic ID provided for creating prompt");
        return;
      }

      const result = await createPrompt({
        content: suggestion.content,
        topicId: topicId,
        geoRegion: "global",
      });

      if (result.success) {
        revalidatePath("/dashboard/prompts");
      } else {
        console.error("Failed to create prompt:", result.error);
      }
    } catch (error) {
      console.error("Error creating prompt from suggestion:", error);
    }
  }

  async function handleReject(suggestionId: string) {
    "use server";
    console.log("Rejected suggestion:", suggestionId);
    // TODO: Implement rejection logic (e.g., feedback for AI)
  }

  return (
    <div className="space-y-3 mr-3">
      {!topicId && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 These are general SEO suggestions. Select a topic above for
            personalized recommendations.
          </p>
        </div>
      )}

      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1">
            <p className="text-sm leading-relaxed font-medium mb-1">
              {suggestion.content}
            </p>
            {suggestion.description && (
              <p className="text-xs text-muted-foreground">
                {suggestion.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {topicId ? (
              <form action={handleAccept.bind(null, suggestion)}>
                <Button
                  type="submit"
                  size="icon"
                  variant="outline"
                  title="Create this prompt"
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Accept suggestion</span>
                </Button>
              </form>
            ) : (
              <Button
                size="icon"
                variant="outline"
                disabled
                title="Select a topic first to create prompts"
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Select topic first</span>
              </Button>
            )}
            <form action={handleReject.bind(null, suggestion.id)}>
              <Button
                type="submit"
                size="icon"
                variant="outline"
                title="Dismiss suggestion"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Reject suggestion</span>
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SuggestionsDialog({
  children,
  topicId,
}: SuggestionsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI-Generated Prompt Suggestions</DialogTitle>
          <DialogDescription>
            {topicId
              ? "Here are AI-generated suggestions tailored to your selected topic."
              : "Get personalized prompt suggestions by selecting a topic, or view general suggestions below."}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto">
          {!topicId ? (
            <>
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <TopicSelectionStep />
              </Suspense>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">
                  General Suggestions:
                </h4>
                <Suspense fallback={<SuggestionsListSkeleton />}>
                  <SuggestionsList topicId={topicId} />
                </Suspense>
              </div>
            </>
          ) : (
            <Suspense fallback={<SuggestionsListSkeleton />}>
              <SuggestionsList topicId={topicId} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
