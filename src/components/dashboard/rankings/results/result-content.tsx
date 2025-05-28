import { notFound } from "next/navigation";
import { Calendar, Globe, Hash, Bot, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";

import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/auth/server";
import { formatRelative } from "date-fns";
import { cn, getVisibilityScoreColor } from "@/lib/utils";
import { ResultItem } from "./item";
import { SearchResult } from "@/lib/llm";
import { LLMResult, Prompt, Status } from "@/types/prompt";

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  openai: "ChatGPT",
  claude: "Claude",
  google: "Gemini",
} as const;

const STATUS_BADGE_VARIANTS: Record<
  Status,
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "default",
  failed: "destructive",
  processing: "secondary",
  pending: "outline",
  cancelled: "outline",
} as const;

async function getPromptWithResults(promptId: string): Promise<Prompt | null> {
  try {
    const user = await getUser();
    if (!user) {
      console.error("User not found when fetching prompt");
      return null;
    }

    const prompt = await db.query.prompts.findFirst({
      where: and(eq(prompts.id, promptId), eq(prompts.userId, user.id)),
      with: {
        topic: true,
        modelResults: true,
      },
    });

    return prompt || null;
  } catch (error) {
    console.error("Error fetching prompt with results:", error);
    return null;
  }
}

function getModelDisplayName(model: string): string {
  return MODEL_DISPLAY_NAMES[model] || model;
}

function getStatusVariant(
  status: Status
): "default" | "secondary" | "destructive" | "outline" {
  return STATUS_BADGE_VARIANTS[status] || "outline";
}

function parseVisibilityScore(score: string | null | undefined): number {
  const parsed = parseFloat(score ?? "0");
  return isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
}

export async function ResultsContent({ promptId }: { promptId: string }) {
  const prompt = await getPromptWithResults(promptId);

  if (!prompt) {
    notFound();
  }

  const visibilityScore = parseVisibilityScore(prompt.visibilityScore);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ranking Results</h1>
      <PromptSummaryCard prompt={prompt} visibilityScore={visibilityScore} />
      <ModelResultsList modelResults={prompt.modelResults} />
    </div>
  );
}

function PromptSummaryCard({
  prompt,
  visibilityScore,
}: {
  prompt: Prompt;
  visibilityScore: number;
}) {
  const completedDate = prompt.completedAt
    ? formatRelative(new Date(prompt.completedAt), new Date())
    : "Processing results";

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <CardTitle className="text-xl leading-tight">
            {prompt.content}
          </CardTitle>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" />
              <span>{prompt.geoRegion.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{completedDate}</span>
            </div>
          </div>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
                getVisibilityScoreColor(visibilityScore)
              )}
            >
              <Hash className="h-3 w-3" />
              {visibilityScore}%
            </div>
            <Badge variant={getStatusVariant(prompt.status as Status)}>
              {prompt.status}
            </Badge>
          </div>
        </CardAction>
      </CardHeader>
    </Card>
  );
}

function ModelResultsList({ modelResults }: { modelResults?: LLMResult[] }) {
  if (!modelResults || modelResults.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-6">
      {modelResults.map((result) => (
        <ModelResultItem key={result.id} result={result} />
      ))}
    </div>
  );
}

function ModelResultItem({ result }: { result: LLMResult }) {
  const completedDate = result.completedAt
    ? formatRelative(new Date(result.completedAt), new Date())
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Bot className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {getModelDisplayName(result.model)}
            </CardTitle>
            {completedDate && (
              <CardDescription>Completed {completedDate}</CardDescription>
            )}
          </div>
        </div>
        <CardAction>
          <Badge variant={getStatusVariant(result.status as Status)}>
            {result.status}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ResultContent result={result} />
      </CardContent>
    </Card>
  );
}

function ResultContent({ result }: { result: LLMResult }) {
  const statusHandlers: Record<string, () => React.ReactNode> = {
    completed: () => <ResultDone results={result.results || []} />,
    failed: () => <ResultFailed errorMessage={result.errorMessage} />,
    processing: () => <ResultProcessing />,
  };

  const handler = statusHandlers[result.status];
  return handler ? handler() : <ResultNoResponse />;
}

function ResultNoResponse() {
  return (
    <StatusMessage
      icon={Bot}
      title="No response available"
      description="The analysis hasn't been completed yet."
      variant="muted"
    />
  );
}

function ResultProcessing() {
  return (
    <StatusMessage
      icon={Clock}
      title="Processing in progress"
      description="This may take a few moments to complete."
      variant="secondary"
    />
  );
}

function StatusMessage({
  icon: Icon,
  title,
  description,
  variant = "muted",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  variant?: "muted" | "secondary" | "destructive";
}) {
  const variantStyles = {
    muted: "bg-muted/50 border-muted text-muted-foreground",
    secondary: "bg-secondary/50 border-secondary text-secondary-foreground",
    destructive: "bg-destructive/5 border-destructive/20 text-destructive",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border rounded-lg",
        variantStyles[variant]
      )}
    >
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </div>
  );
}

function ResultDone({ results }: { results: SearchResult[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.length} source{results.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((source, index) => (
          <ResultItem key={`${source.url}-${index}`} result={source} />
        ))}
      </div>
    </div>
  );
}

function ResultFailed({ errorMessage }: { errorMessage: string | null }) {
  return (
    <StatusMessage
      icon={AlertCircle}
      title="Error occurred"
      description={
        errorMessage || "An unexpected error occurred. Please try again."
      }
      variant="destructive"
    />
  );
}

function NoResults() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-3">
          <Bot className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <div>
            <p className="text-lg font-medium text-muted-foreground">
              No results available yet
            </p>
            <p className="text-sm text-muted-foreground">
              Process the prompt first to see LLM responses and sources.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
