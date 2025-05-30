import { Search } from "lucide-react";
import { AnalysisButton } from "./analysis-button";

interface AnalysisStepProps {
  promptId: string;
}

export function AnalysisStep({ promptId }: AnalysisStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Ready to Analyze!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Click the button below to start your first SEO analysis. We&apos;ll
          check how your brand appears across different AI models.
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-4">
        <AnalysisButton promptId={promptId} />

        <p className="text-xs text-center text-muted-foreground">
          Analysis typically takes 2-3 minutes to complete
        </p>
      </div>
    </div>
  );
}
