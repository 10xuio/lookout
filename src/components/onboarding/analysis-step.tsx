import { AnalysisButton } from "./analysis-button";

interface AnalysisStepProps {
  promptId: string;
}

export function AnalysisStep({ promptId }: AnalysisStepProps) {
  return (
    <div className="mx-auto space-y-2">
      <AnalysisButton promptId={promptId} />
      <p className="text-xs text-center text-muted-foreground">
        Analysis typically takes 1-2 minutes to complete
      </p>
    </div>
  );
}
