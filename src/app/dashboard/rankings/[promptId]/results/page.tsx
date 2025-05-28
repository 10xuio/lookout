import { Suspense } from "react";
import { ResultsBreadcrumb } from "@/components/dashboard/rankings/results/breadcrumb";
import { ResultsLoadingSkeleton } from "@/components/dashboard/rankings/results/skelaton";
import { ResultsContent } from "@/components/dashboard/rankings/results/result-content";

interface ResultsPageProps {
  params: Promise<{ promptId: string }>;
  searchParams: Promise<{ topicId?: string }>;
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
