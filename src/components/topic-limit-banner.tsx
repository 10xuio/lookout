import { auth } from "@/auth";
import { checkTopicLimit } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "./upgrade-button";
import { AlertTriangle, Info } from "lucide-react";
import { headers } from "next/headers";

export async function TopicLimitBanner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const topicLimit = await checkTopicLimit(session.user.id);

  const usagePercentage = (topicLimit.currentTopics / topicLimit.limit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = !topicLimit.canCreateTopic;

  if (isAtLimit) {
    return (
      <div className="flex items-center justify-between p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <strong>Topic limit reached!</strong> You&apos;re tracking{" "}
            {topicLimit.currentTopics}/{topicLimit.limit} topics.
          </div>
        </div>
        <UpgradeButton
          planType={topicLimit.plan === "free" ? "basic" : "pro"}
          size="sm"
        >
          Upgrade Now
        </UpgradeButton>
      </div>
    );
  }

  if (isNearLimit && topicLimit.plan !== "pro") {
    return (
      <div className="flex items-center justify-between p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 mb-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <div>
            You&apos;re approaching your topic limit: {topicLimit.currentTopics}
            /{topicLimit.limit} topics.
          </div>
        </div>
        <UpgradeButton
          planType={topicLimit.plan === "free" ? "basic" : "pro"}
          variant="outline"
          size="sm"
        >
          Upgrade Plan
        </UpgradeButton>
      </div>
    );
  }

  if (topicLimit.plan === "free" || topicLimit.plan === "basic") {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{topicLimit.plan}</Badge>
          <span className="text-sm text-muted-foreground">
            {topicLimit.currentTopics}/{topicLimit.limit} topics
          </span>
        </div>
        <UpgradeButton
          planType={topicLimit.plan === "free" ? "basic" : "pro"}
          variant="outline"
          size="sm"
        >
          Track More Topics
        </UpgradeButton>
      </div>
    );
  }

  return null;
}
