import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getMentions } from "./actions";
import { BicepsFlexed, Smile, Frown, Meh, CircleDot } from "lucide-react";

async function StatsContent({ topicId }: { topicId?: string }) {
  const mentions = await getMentions({ topicId });

  const stats = {
    mentions: {
      total: mentions.length,
      direct: mentions.filter((m) => m.mentionType === "direct").length,
      indirect: mentions.filter((m) => m.mentionType === "indirect").length,
      competitive: mentions.filter((m) => m.mentionType === "competitive")
        .length,
    },
    sentiment: {
      positive: mentions.filter((m) => m.sentiment === "positive").length,
      negative: mentions.filter((m) => m.sentiment === "negative").length,
      neutral: mentions.filter((m) => m.sentiment === "neutral").length,
    },
  };

  return (
    <>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-border bg-muted">
          Mentions Overview
        </div>
        <div className="flex justify-between p-4">
          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 items-center">
              <CircleDot className="h-5 w-5 text-green-600" />
              <div className="flex items-end">
                <p className="text-sm font-semibold flex gap-2">
                  {stats.mentions.direct}
                  <span className="text-muted-foreground font-normal">
                    Direct
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 items-center">
              <CircleDot className="h-5 w-5 text-yellow-600" />
              <div className="flex items-end">
                <p className="text-sm font-semibold flex gap-2">
                  {stats.mentions.indirect}
                  <span className="text-muted-foreground font-normal">
                    Indirect
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 items-center">
              <BicepsFlexed className="h-5 w-5 text-orange-600" />
              <div className="flex items-end">
                <p className="text-sm font-semibold flex gap-2">
                  {stats.mentions.competitive}
                  <span className="text-muted-foreground font-normal">
                    Competitive
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-border bg-muted">
          Sentiment Analysis
        </div>
        <div className="flex justify-between p-4">
          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 items-center">
              <Smile className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold flex gap-2">
                {stats.sentiment.positive}
                <span className="text-muted-foreground font-normal">
                  Positive
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 items-center">
              <Meh className="h-5 w-5 text-gray-500" />
              <p className="text-sm font-semibold flex gap-2">
                {stats.sentiment.neutral}
                <span className="text-muted-foreground font-normal">
                  Neutral
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex justify-center gap-2 items-center">
              <Frown className="h-5 w-5 text-red-600" />
              <p className="text-sm font-semibold flex gap-2">
                {stats.sentiment.negative}
                <span className="text-muted-foreground font-normal">
                  Negative
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-border bg-muted">
          Mentions Overview
        </div>
        <div className="flex justify-between p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex justify-center gap-2 items-center">
                <Skeleton className="h-5 w-5" />
                <div className="flex items-end">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col border border-border rounded-lg overflow-hidden">
        <div className="flex justify-between px-4 py-2 border-b border-border bg-muted">
          Sentiment Analysis
        </div>
        <div className="flex justify-between p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="flex justify-center gap-2 items-center">
                <Skeleton className="h-5 w-5" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function Stats({ topicId }: { topicId?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent topicId={topicId} />
      </Suspense>
    </div>
  );
}
