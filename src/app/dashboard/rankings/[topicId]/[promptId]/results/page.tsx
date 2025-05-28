import { Suspense } from "react";
import { PromptBreadcrumb } from "@/components/dashboard/rankings/breadcrumb";
import { ResultsLoadingSkeleton } from "@/components/dashboard/rankings/results/skelaton";
import { ResultsContent } from "@/components/dashboard/rankings/results/result-content";

interface ResultsPageProps {
  params: Promise<{ topicId: string; promptId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { promptId, topicId } = await params;

  return (
    <>
      <PromptBreadcrumb topicId={topicId} page="results" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<ResultsLoadingSkeleton />}>
          <ResultsContent promptId={promptId} />
        </Suspense>
      </div>
    </>
  );
}
