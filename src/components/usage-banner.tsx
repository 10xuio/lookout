import { auth } from "@/auth";
import { checkUsageLimit } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "./upgrade-button";
import { AlertTriangle, Info } from "lucide-react";
import { headers } from "next/headers";

export async function UsageBanner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const usage = await checkUsageLimit(session.user.id);

  // Don't show for unlimited monthly plans with daily limits
  if (usage.limit === -1) {
    return null;
  }

  const usagePercentage = (usage.currentUsage / usage.limit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = !usage.canProcess;

  // Determine if we're showing daily or monthly usage
  const isDaily = usage.plan === "basic" || usage.plan === "pro";
  const timeframe = isDaily ? "today" : "this month";

  if (isAtLimit) {
    return (
      <div className="flex items-center justify-between p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <strong>Usage limit reached!</strong> You&apos;ve used{" "}
            {usage.currentUsage}/{usage.limit} prompts {timeframe}.
          </div>
        </div>
        <UpgradeButton
          planType={usage.plan === "free" ? "basic" : "pro"}
          size="sm"
        >
          Upgrade Now
        </UpgradeButton>
      </div>
    );
  }

  if (isNearLimit) {
    return (
      <div className="flex items-center justify-between p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 mb-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <div>
            You&apos;re approaching your limit: {usage.currentUsage}/
            {usage.limit} prompts used {timeframe}.
          </div>
        </div>
        <UpgradeButton
          planType={usage.plan === "free" ? "basic" : "pro"}
          variant="outline"
          size="sm"
        >
          Upgrade Plan
        </UpgradeButton>
      </div>
    );
  }

  // Show current usage for free users
  if (usage.plan === "free") {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{usage.plan}</Badge>
          <span className="text-sm text-muted-foreground">
            {usage.currentUsage}/{usage.limit} prompts {timeframe}
          </span>
        </div>
        <UpgradeButton planType="basic" variant="outline" size="sm">
          Upgrade for More
        </UpgradeButton>
      </div>
    );
  }

  return null;
}
