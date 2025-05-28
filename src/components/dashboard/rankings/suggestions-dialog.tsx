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
import { redirect } from "next/navigation";

const MAX_DIALOG_HEIGHT = 400;
const DEFAULT_GEO_REGION = "global" as const;
const DEFAULT_TOPIC_CONTEXT = "SEO and Marketing Analysis";

const DEFAULT_FALLBACK_SUGGESTIONS: PromptSuggestion[] = [
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

interface SuggestionsDialogProps {
  children: React.ReactNode;
  topicId?: string;
}

async function fetchSuggestions(topicId?: string): Promise<PromptSuggestion[]> {
  "use server";

  try {
    if (topicId) {
      const topics = await getTopics();
      const topic = topics.find((t) => t.id === topicId);

      if (topic) {
        const suggestions = await generatePromptSuggestions(
          topic.name,
          topic.description ?? undefined
        );

        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return suggestions;
        }
      }
    }

    const genericSuggestions = await generatePromptSuggestions(
      DEFAULT_TOPIC_CONTEXT
    );

    return Array.isArray(genericSuggestions) && genericSuggestions.length > 0
      ? genericSuggestions
      : DEFAULT_FALLBACK_SUGGESTIONS;
  } catch (error) {
    console.error("Failed to generate suggestions:", {
      error,
      topicId,
      timestamp: new Date().toISOString(),
    });

    return DEFAULT_FALLBACK_SUGGESTIONS;
  }
}

function SkeletonItem() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border bg-card">
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
  );
}

function SuggestionsListSkeleton() {
  return (
    <div className="space-y-3 mr-3">
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonItem key={i} />
      ))}
    </div>
  );
}

function EmptyTopicsState() {
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

function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">Or</span>
      </div>
    </div>
  );
}

async function TopicSelectionStep() {
  const topics = await getTopics();

  async function handleTopicSelection(formData: FormData) {
    "use server";

    try {
      const selectedTopicId = formData.get("topicId");

      if (typeof selectedTopicId === "string" && selectedTopicId.trim()) {
        redirect(`/dashboard/rankings/${encodeURIComponent(selectedTopicId)}`);
      }
    } catch (error) {
      console.error("Failed to handle topic selection:", error);
      throw error;
    }
  }

  if (topics.length === 0) {
    return <EmptyTopicsState />;
  }

  return (
    <div className="space-y-4">
      <form action={handleTopicSelection} className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="topic-select" className="text-sm font-medium">
            Choose a topic for personalized suggestions:
          </label>
          <Select name="topicId" required>
            <SelectTrigger id="topic-select">
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
      <OrDivider />
    </div>
  );
}

interface SuggestionItemProps {
  suggestion: PromptSuggestion;
  topicId?: string;
  onAccept: (suggestion: PromptSuggestion) => Promise<void>;
  onReject: (suggestionId: string) => Promise<void>;
}

function SuggestionItem({
  suggestion,
  topicId,
  onAccept,
  onReject,
}: SuggestionItemProps) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
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
          <form action={onAccept.bind(null, suggestion)}>
            <Button
              type="submit"
              size="icon"
              variant="outline"
              title="Create this prompt"
              aria-label={`Create prompt: ${suggestion.content}`}
            >
              <Check className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button
            size="icon"
            variant="outline"
            disabled
            title="Select a topic first to create prompts"
            aria-label="Select topic first"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <form action={onReject.bind(null, suggestion.id)}>
          <Button
            type="submit"
            size="icon"
            variant="outline"
            title="Dismiss suggestion"
            aria-label={`Dismiss suggestion: ${suggestion.content}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

async function SuggestionsList({ topicId }: { topicId?: string }) {
  const suggestions = await fetchSuggestions(topicId);

  async function handleAccept(suggestion: PromptSuggestion) {
    "use server";

    if (!topicId) {
      console.error("Cannot create prompt without topic ID");
      return;
    }

    try {
      const result = await createPrompt({
        content: suggestion.content,
        topicId: topicId,
        geoRegion: DEFAULT_GEO_REGION,
      });

      if (result.success) {
        revalidatePath("/dashboard/rankings");
      } else {
        console.error("Failed to create prompt:", {
          error: result.error,
          suggestion: suggestion.content,
          topicId,
        });
      }
    } catch (error) {
      console.error("Error creating prompt from suggestion:", {
        error,
        suggestion: suggestion.content,
        topicId,
      });
    }
  }

  async function handleReject(suggestionId: string) {
    "use server";

    console.log("Suggestion rejected:", {
      suggestionId,
      timestamp: new Date().toISOString(),
      topicId,
    });
  }

  return (
    <div className="space-y-3 mr-3">
      {!topicId && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg" role="alert">
          <p className="text-sm text-muted-foreground">
            💡 These are general SEO suggestions. Select a topic above for
            personalized recommendations.
          </p>
        </div>
      )}

      {suggestions.map((suggestion) => (
        <SuggestionItem
          key={suggestion.id}
          suggestion={suggestion}
          topicId={topicId}
          onAccept={handleAccept}
          onReject={handleReject}
        />
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
          <DialogTitle>Ranking Prompt Suggestions</DialogTitle>
          <DialogDescription>
            {topicId
              ? "Here are AI-generated ranking prompt suggestions tailored to your selected topic."
              : "Get personalized ranking prompt suggestions by selecting a topic, or view general suggestions below."}
          </DialogDescription>
        </DialogHeader>
        <div>
          {!topicId ? (
            <>
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <TopicSelectionStep />
              </Suspense>
              <div
                className="mt-6 overflow-y-auto"
                style={{ maxHeight: `${MAX_DIALOG_HEIGHT}px` }}
              >
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
