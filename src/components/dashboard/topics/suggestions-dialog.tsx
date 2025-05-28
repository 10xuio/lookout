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
import { Check, X, Tag } from "lucide-react";
import { Suspense } from "react";
import {
  generateTopicSuggestions,
  type TopicSuggestion,
} from "@/lib/suggestions";
import { createTopicFromUrl } from "./actions";

interface TopicSuggestionsDialogProps {
  children: React.ReactNode;
}

async function fetchTopicSuggestions(): Promise<TopicSuggestion[]> {
  "use server";

  try {
    return await generateTopicSuggestions();
  } catch (error) {
    console.error("Failed to generate topic suggestions:", error);

    // Fallback to some default suggestions if AI fails
    return [
      {
        id: "fallback_1",
        name: "Shopify",
        description:
          "Leading e-commerce platform with strong SEO presence and diverse merchant ecosystem",
        category: "E-commerce",
      },
      {
        id: "fallback_2",
        name: "Tesla",
        description:
          "Innovative automotive brand with unique marketing approach and strong brand presence",
        category: "Automotive",
      },
      {
        id: "fallback_3",
        name: "Notion",
        description:
          "Fast-growing productivity SaaS with community-driven growth and content marketing",
        category: "SaaS",
      },
    ];
  }
}

function TopicSuggestionsListSkeleton() {
  return (
    <div className="space-y-3 mr-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 rounded-lg border bg-card"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
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

async function TopicSuggestionsList() {
  const suggestions = await fetchTopicSuggestions();

  async function handleAccept(suggestion: TopicSuggestion) {
    "use server";

    try {
      // Create topic using the suggestion name
      // We'll use the name as a URL-like identifier for now
      const result = await createTopicFromUrl({
        url: suggestion.name.toLowerCase().replace(/\s+/g, "") + ".com",
      });

      if (result.success) {
        console.log("Topic created successfully:", result.topicId);
      } else {
        console.error("Failed to create topic:", result.error);
      }
    } catch (error) {
      console.error("Error creating topic from suggestion:", error);
    }
  }

  async function handleReject(suggestionId: string) {
    "use server";
    console.log("Rejected topic suggestion:", suggestionId);
    // TODO: Implement rejection logic (e.g., feedback for AI)
  }

  return (
    <div className="space-y-3 mr-3">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold">{suggestion.name}</h4>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                <Tag className="h-3 w-3" />
                {suggestion.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {suggestion.description}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <form action={handleAccept.bind(null, suggestion)}>
              <Button
                type="submit"
                size="icon"
                variant="outline"
                title="Add this topic"
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Accept topic suggestion</span>
              </Button>
            </form>
            <form action={handleReject.bind(null, suggestion.id)}>
              <Button
                type="submit"
                size="icon"
                variant="outline"
                title="Dismiss suggestion"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Reject topic suggestion</span>
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopicSuggestionsDialog({
  children,
}: TopicSuggestionsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Generated Topic Suggestions</DialogTitle>
          <DialogDescription>
            Here are some AI-generated suggestions for interesting brands and
            companies to analyze.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[500px] overflow-y-auto">
          <Suspense fallback={<TopicSuggestionsListSkeleton />}>
            <TopicSuggestionsList />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
