import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  Calendar,
  Globe,
  Hash,
  ExternalLink,
  Bot,
  AlertCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ImageAvatar } from "@/components/brand-list";
import { db } from "@/db";
import { prompts, modelResults } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/auth/server";
import { SearchResult } from "@/lib/llm";
import { formatRelative } from "date-fns";
import { cn, getVisibilityScoreColor } from "@/lib/utils";

interface ResultsPageProps {
  params: Promise<{ promptId: string }>;
  searchParams: Promise<{ topicId?: string }>;
}

function ResultsBreadcrumb({ topicId }: { topicId?: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/dashboard/prompts${
                  topicId ? `?topicId=${topicId}` : ""
                }`}
              >
                Prompts
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Results</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}

async function getPromptWithResults(promptId: string) {
  const user = await getUser();
  if (!user) throw new Error("User not found");

  const prompt = await db.query.prompts.findFirst({
    where: and(eq(prompts.id, promptId), eq(prompts.userId, user.id)),
    with: {
      topic: true,
    },
  });

  if (!prompt) {
    return null;
  }

  const results = await db.query.modelResults.findMany({
    where: eq(modelResults.promptId, promptId),
  });

  return {
    ...prompt,
    results,
  };
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

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "failed":
      return "destructive";
    case "processing":
      return "secondary";
    default:
      return "outline";
  }
}

function ResultsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <CardAction>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Results Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <CardAction>
              <Skeleton className="h-6 w-20" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-8 h-8 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const ResultItem = ({ result }: { result: SearchResult }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <ImageAvatar title={result.title} url={result.url} />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm leading-tight line-clamp-2">
                {result.title}
              </h4>
              {result.url && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">Open link</span>
                  </a>
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {result.snippet}
            </p>

            {result.url && (
              <p className="text-xs text-muted-foreground/70 truncate">
                {new URL(result.url).hostname}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

async function ResultsContent({
  promptId,
  topicId,
}: {
  promptId: string;
  topicId?: string;
}) {
  const promptData = await getPromptWithResults(promptId);

  if (!promptData) {
    notFound();
  }

  const { results, ...prompt } = promptData;
  const visibilityScore = parseFloat(prompt.visibilityScore ?? "0");

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/prompts${topicId ? `?topicId=${topicId}` : ""}`}
        >
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-2xl font-bold">LLM Analysis Results</h1>
      </div>

      {/* Prompt Header */}
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <CardTitle className="text-xl leading-tight">
              {prompt.content}
            </CardTitle>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {prompt.topic && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">Topic:</span>
                  <span>{prompt.topic.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>{prompt.geoRegion.toUpperCase()}</span>
              </div>
              {prompt.completedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatRelative(new Date(prompt.completedAt), new Date())}
                  </span>
                </div>
              )}
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
              <Badge variant={getStatusVariant(prompt.status)}>
                {prompt.status}
              </Badge>
            </div>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Results from each LLM */}
      {results.length === 0 ? (
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
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {getModelDisplayName(result.model)}
                    </CardTitle>
                    {result.completedAt && (
                      <CardDescription>
                        Completed{" "}
                        {formatRelative(
                          new Date(result.completedAt),
                          new Date()
                        )}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <CardAction>
                  <Badge variant={getStatusVariant(result.status)}>
                    {result.status}
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent>
                {result.status === "completed" &&
                result.results &&
                result.results.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Found {result.results.length} sources
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {result.results.map((source, index) => (
                        <ResultItem
                          key={`${source.title}-${index}`}
                          result={source}
                        />
                      ))}
                    </div>
                  </div>
                ) : result.status === "failed" && result.errorMessage ? (
                  <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">
                        Error occurred
                      </p>
                      <p className="text-sm text-destructive/80">
                        {result.errorMessage}
                      </p>
                    </div>
                  </div>
                ) : result.status === "processing" ? (
                  <div className="flex items-start gap-3 p-4 bg-secondary/50 border border-secondary rounded-lg">
                    <Clock className="h-5 w-5 text-secondary-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-secondary-foreground">
                        Processing in progress
                      </p>
                      <p className="text-sm text-secondary-foreground/80">
                        This may take a few moments to complete.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-muted/50 border border-muted rounded-lg">
                    <Bot className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No response available
                      </p>
                      <p className="text-sm text-muted-foreground/80">
                        The analysis hasn&apos;t been completed yet.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ResultsPage({
  params,
  searchParams,
}: ResultsPageProps) {
  const { promptId } = await params;
  const { topicId } = await searchParams;

  return (
    <>
      <ResultsBreadcrumb topicId={topicId} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<ResultsLoadingSkeleton />}>
          <ResultsContent promptId={promptId} topicId={topicId} />
        </Suspense>
      </div>
    </>
  );
}
