import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMentions } from "./actions";
import { AtSign, BicepsFlexed, Smile, Target } from "lucide-react";

async function StatsContent() {
  const mentions = await getMentions();

  const stats = {
    total: mentions.length,
    direct: mentions.filter((m) => m.mentionType === "direct").length,
    competitive: mentions.filter((m) => m.mentionType === "competitive").length,
    positive: mentions.filter((m) => m.sentiment === "positive").length,
  };

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <AtSign className="h-4 w-4" /> Total Mentions
          </CardTitle>
        </CardHeader>
        <CardContent className="h-8">
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Target className="h-4 w-4" /> Direct Mentions
          </CardTitle>
        </CardHeader>
        <CardContent className="h-8">
          <div className="text-2xl font-bold text-green-600">
            {stats.direct}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <BicepsFlexed className="h-4 w-4" /> Competitive
          </CardTitle>
        </CardHeader>
        <CardContent className="h-8">
          <div className="text-2xl font-bold text-orange-600">
            {stats.competitive}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Smile className="h-4 w-4" /> Positive
          </CardTitle>
        </CardHeader>
        <CardContent className="h-8">
          <div className="text-2xl font-bold text-green-600">
            {stats.positive}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
