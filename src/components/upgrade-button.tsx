import { createCheckoutSession } from "@/app/actions/stripe";
import { PlanType } from "@/lib/stripe/server";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./loading-button";

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
  if (planType === "free") return null;

  return (
    <form
      action={createCheckoutSession.bind(null, planType)}
      className="w-full"
    >
      <LoadingButton
        type="submit"
        variant={variant}
        size={size}
        className={cn("w-full justify-start gap-2", className)}
      >
        {children ??
          `Upgrade to ${planType.charAt(0).toUpperCase() + planType.slice(1)}`}
      </LoadingButton>
    </form>
  );
}
