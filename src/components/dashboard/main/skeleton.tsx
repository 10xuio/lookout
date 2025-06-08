import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function KPICardSkeleton() {
  return (
    <Card className="relative overflow-hidden shadow-none bg-white gap-2">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <div className="p-2 bg-slate-50 rounded-lg">
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Skeleton className="h-9 w-20" />
          <div className="inline-flex items-center px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
            <Skeleton className="h-3 w-3 mr-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandHealthCardSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-5 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <Skeleton className="h-11 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="bg-slate-100 rounded-full overflow-hidden h-2">
                <Skeleton className="h-full w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitorAnalysisCardSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-5 w-36" />
        </CardTitle>
        <CardDescription className="text-slate-500">
          <Skeleton className="h-4 w-48" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="w-7 h-7 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-600"></Badge>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-10 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center border justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="w-7 h-7 p-0 flex items-center justify-center border-slate-300 text-slate-600"
                >
                  <Skeleton className="h-3 w-2" />
                </Badge>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-8 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsCardSkeleton() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-5 w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 border-slate-200"
          >
            <div className="p-1">
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModelCardSkeleton() {
  return (
    <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-lg">
          <Skeleton className="h-4 w-4" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
            </div>
            {i > 0 && <Skeleton className="h-2 w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelPerformanceCardSkeleton() {
  return (
    <Card className="col-span-full shadow-none">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Skeleton className="h-5 w-5" />
          </div>
          <Skeleton className="h-5 w-36" />
        </CardTitle>
        <CardDescription className="text-slate-500">
          <Skeleton className="h-4 w-56" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ModelCardSkeleton key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <KPICardSkeleton key={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BrandHealthCardSkeleton />
        <CompetitorAnalysisCardSkeleton />
        <AlertsCardSkeleton />
      </div>

      <ModelPerformanceCardSkeleton />
    </div>
  );
}
