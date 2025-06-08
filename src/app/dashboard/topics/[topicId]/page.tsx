import { Suspense } from "react";
import { DashboardOverview } from "@/components/dashboard/main/overview";
import { DashboardBreadcrumb } from "@/components/dashboard/main/breadcrumb";
import { DashboardOverviewSkeleton } from "@/components/dashboard/main/skeleton";

export default async function DashboardTopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardBreadcrumb topicId={topicId} />
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <DashboardOverview topicId={topicId} />
        </Suspense>
      </div>
    </div>
  );
}
