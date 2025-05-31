import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/actions/stripe";
import { PlanType } from "@/lib/stripe/server";

interface UpgradeButtonProps {
  planType: PlanType;
  children?: React.ReactNode;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function UpgradeButton({
  planType,
  children,
  variant = "default",
  size = "default",
  className,
}: UpgradeButtonProps) {
  if (planType === "free") {
    return null; // Don't show upgrade button for free plan
  }

  return (
    <form action={createCheckoutSession.bind(null, planType)}>
      <Button type="submit" variant={variant} size={size} className={className}>
        {children ||
          `Upgrade to ${planType.charAt(0).toUpperCase() + planType.slice(1)}`}
      </Button>
    </form>
  );
}
