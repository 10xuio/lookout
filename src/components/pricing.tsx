import { PLANS, PlanType } from "@/lib/stripe/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./loading-button";

interface PricingProps {
  currentPlan?: PlanType;
  currentUsage?: number;
}

export function Pricing({
  currentPlan = "free",
  currentUsage = 10,
}: PricingProps) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 container mx-auto py-8">
      <div className="flex flex-col gap-2 items-center mb-8">
        <h1 className="text-2xl font-bold">Choose Your Plan</h1>
        <p className="text-md text-muted-foreground">
          Scale your AI ranking monitoring with the perfect plan for your needs
        </p>
        {currentUsage > 0 && (
          <Badge variant="outline">
            Current usage: {currentUsage} prompts this month
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {Object.entries(PLANS).map(([key, plan]) => {
          const planKey = key as PlanType;
          const isCurrentPlan = planKey === currentPlan;
          const isPopular = planKey === "pro";

          return (
            <Card
              key={planKey}
              className={cn(
                "relative flex flex-col shadow-none",
                isPopular && "border-orange-600 shadow-lg"
              )}
            >
              {isPopular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : planKey === "free" ? (
                  <Button className="w-full" variant="outline" disabled>
                    Get Started
                  </Button>
                ) : (
                  <form
                    action={createCheckoutSession.bind(null, planKey)}
                    className="w-full"
                  >
                    <LoadingButton
                      className={cn(
                        "w-full",
                        isPopular &&
                          "bg-orange-600 hover:bg-orange-700 text-white hover:text-white border-none"
                      )}
                    >
                      Upgrade to {plan.name}
                    </LoadingButton>
                  </form>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>All plans include SSL security, 99.9% uptime, and email support.</p>
        <p className="mt-2">You can cancel or change your plan at any time.</p>
      </div>
    </div>
  );
}
