import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Create Topic", description: "Add your website" },
  { number: 2, title: "Create Prompt", description: "Define what to track" },
  { number: 3, title: "Run Analysis", description: "Start monitoring" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                currentStep > step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep === step.number
                  ? "border-primary bg-background text-primary"
                  : "border-muted-foreground/30 bg-background text-muted-foreground/30"
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{step.number}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  currentStep >= step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              <p
                className={cn(
                  "text-xs transition-colors",
                  currentStep >= step.number
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-4 h-0.5 w-full max-w-[100px] transition-colors",
                currentStep > step.number
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
