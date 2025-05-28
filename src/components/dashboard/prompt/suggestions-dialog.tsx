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

interface SuggestionsDialogProps {
  children: React.ReactNode;
  topicId?: string;
}

interface PromptSuggestion {
  id: string;
  content: string;
}

async function fetchSuggestions(topicId?: string): Promise<PromptSuggestion[]> {
  "use server";

  console.log("Fetching suggestions for topic:", topicId);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  return [
    {
      id: "1",
      content:
        "What are the top 10 SEO strategies for improving organic search rankings in 2024?",
    },
    {
      id: "2",
      content:
        "How to optimize website content for voice search and featured snippets?",
    },
    {
      id: "3",
      content:
        "Compare technical SEO best practices for e-commerce sites vs blog websites",
    },
    {
      id: "4",
      content:
        "What are the most important Core Web Vitals metrics and how to improve them?",
    },
    {
      id: "5",
      content:
        "How does Google's E-E-A-T algorithm update affect content ranking strategies?",
    },
  ];
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

async function SuggestionsList({ topicId }: { topicId?: string }) {
  const suggestions = await fetchSuggestions(topicId);

  async function handleAccept(suggestionId: string) {
    "use server";
    console.log("Accepted suggestion:", suggestionId);
  }

  async function handleReject(suggestionId: string) {
    "use server";
    console.log("Rejected suggestion:", suggestionId);
  }

  return (
    <div className="space-y-3 mr-3">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <p className="flex-1 text-sm leading-relaxed">{suggestion.content}</p>
          <div className="flex gap-1 shrink-0">
            <form action={handleAccept.bind(null, suggestion.id)}>
              <Button type="submit" size="icon" variant="outline">
                <Check className="h-4 w-4" />
                <span className="sr-only">Accept suggestion</span>
              </Button>
            </form>
            <form action={handleReject.bind(null, suggestion.id)}>
              <Button type="submit" size="icon" variant="outline">
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
          <DialogTitle>Suggested Prompts</DialogTitle>
          <DialogDescription>
            Here are some suggestions for SEO prompts to analyze search results
            and rankings.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <Suspense fallback={<SuggestionsListSkeleton />}>
            <SuggestionsList topicId={topicId} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
