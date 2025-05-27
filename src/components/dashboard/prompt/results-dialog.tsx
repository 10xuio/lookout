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
import { db } from "@/db";
import { modelResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Status } from "@/types/prompt";

interface LLMResult {
  id: string;
  model: string;
  response: string | null;
  status: Status;
  errorMessage?: string | null;
  completedAt?: Date | null;
}

interface ResultsDialogProps {
  promptId: string;
  promptContent: string;
  children: React.ReactNode;
}

async function getPromptResults(promptId: string): Promise<LLMResult[]> {
  const results = await db.query.modelResults.findMany({
    where: eq(modelResults.promptId, promptId),
  });

  return results.map((result) => ({
    id: result.id,
    model: result.model,
    response: result.response,
    status: result.status,
    errorMessage: result.errorMessage,
    completedAt: result.completedAt,
  }));
}

function getModelDisplayName(model: string) {
  switch (model) {
    case "openai":
      return "OpenAI GPT-4";
    case "claude":
      return "Claude 3.5 Sonnet";
    case "google":
      return "Gemini 1.5 Pro";
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
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function ResultsContent({ promptId }: { promptId: string }) {
  const results = await getPromptResults(promptId);

  if (results.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No results available yet. Process the prompt first.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => (
        <div key={result.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">
              {getModelDisplayName(result.model)}
            </h3>
            <Badge className={getStatusColor(result.status)}>
              {result.status}
            </Badge>
          </div>

          {result.status === "completed" && result.response ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">
                {result.response}
              </div>
            </div>
          ) : result.status === "failed" && result.errorMessage ? (
            <div className="text-red-600 text-sm">
              Error: {result.errorMessage}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              No response available
            </div>
          )}

          {result.completedAt && (
            <div className="text-xs text-muted-foreground mt-2">
              Completed: {result.completedAt.toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
