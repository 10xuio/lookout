import { Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ImageAvatar } from "@/components/brand-list";
import { db } from "@/db";
import { modelResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LLMResult } from "@/types/prompt";
import { SearchResult } from "@/lib/llm";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDialogProps {
  promptId: string;
  promptContent: string;
  children: React.ReactNode;
}

async function getPromptResults(promptId: string): Promise<LLMResult[]> {
  const results = await db.query.modelResults.findMany({
    where: eq(modelResults.promptId, promptId),
  });

  return results;
}

function getModelDisplayName(model: string) {
  switch (model) {
    case "openai":
      return "ChatGPT";
    case "claude":
      return "Claude";
    case "google":
      return "Gemini";
    default:
      return model;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function ResultsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border rounded-md px-4 py-2 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>

          <div className="w-full min-w-0">
            <div className="flex flex-col gap-2">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="flex items-start gap-3 p-3 border rounded-md"
                >
                  <div className="flex-shrink-0">
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-3/4 mb-1 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full rounded" />
                      <Skeleton className="h-3 w-5/6 rounded" />
                    </div>
                    <Skeleton className="h-3 w-1/2 mt-2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      ))}
    </div>
  );
}

async function ResultsContent({ promptId }: { promptId: string }) {
  const promptResults = await getPromptResults(promptId);

  if (promptResults.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No results available yet. Process the prompt first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      {promptResults.map((res) => (
        <div
          key={res.id}
          className="flex flex-col gap-2 border rounded-md px-4 py-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-md truncate">
              {getModelDisplayName(res.model)}
            </h3>
            <Badge className={getStatusColor(res.status)}>{res.status}</Badge>
          </div>

          {res.status === "completed" && res.response ? (
            <div className="w-full min-w-0">
              <div className="flex flex-col gap-2">
                {res.results.map((result) => (
                  <ResultItem key={result.title} result={result} />
                ))}
              </div>
            </div>
          ) : res.status === "failed" && res.errorMessage ? (
            <div className="text-red-600 text-sm break-words overflow-wrap-anywhere">
              Error: {res.errorMessage}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              No response available
            </div>
          )}

          {res.completedAt && (
            <div className="text-xs text-muted-foreground">
              Completed: {res.completedAt.toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const ResultItem = ({ result }: { result: SearchResult }) => {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex-shrink-0">
        <ImageAvatar title={result.title} url={result.url} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-md text-gray-900 truncate">
            {result.title}
          </h3>
        </div>

        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
          {result.snippet}
        </p>

        {result.url && (
          <div className="text-xs text-gray-400 mt-2 truncate">
            {result.url}
          </div>
        )}
      </div>
    </div>
  );
};

export function ResultsDialog({
  promptId,
  promptContent,
  children,
}: ResultsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>LLM Results</DialogTitle>
          <DialogDescription>
            Results from all providers for: &ldquo;{promptContent}&rdquo;
          </DialogDescription>
        </DialogHeader>
        <Suspense fallback={<ResultsLoadingSkeleton />}>
          <ResultsContent promptId={promptId} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
