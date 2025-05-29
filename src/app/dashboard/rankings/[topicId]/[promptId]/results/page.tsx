import { Suspense } from "react";
import {
  RankingsBreadcrumb,
  ResultsLoadingSkeleton,
  ResultsContent,
} from "@/components/dashboard";

interface ResultsPageProps {
  params: Promise<{ topicId: string; promptId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { promptId, topicId } = await params;

  return (
    <>
      <RankingsBreadcrumb topicId={topicId} page="results" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<ResultsLoadingSkeleton />}>
          <ResultsContent promptId={promptId} />
        </Suspense>
      </div>
    </>
  );
}
